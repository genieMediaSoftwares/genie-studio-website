const path = require('node:path');
const fs = require('node:fs/promises');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const axios = require('axios');
const FormData = require('form-data');
const { httpError } = require('./security');

const SAFE_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.(?:jpg|jpeg|png|webp|avif)$/i;
function checkedName(filename) {
  if (typeof filename !== 'string' || filename.length > 255 || !SAFE_NAME.test(filename) || filename.includes('..')) {
    throw httpError(400, 'Unsafe storage filename.');
  }
  return filename;
}

function createStorage(config, { transport = axios, client } = {}) {
  let s3 = client;
  const getClient = () => s3 ||= new S3Client({
    region: 'auto', endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: config.r2.accessKeyId, secretAccessKey: config.r2.secretAccessKey },
  });
  const provider = config.storageProvider;
  async function uploadToStorage(input, filename, mimeType = 'image/jpeg') {
    checkedName(filename);
    const chunks = [];
    const buffer = Buffer.isBuffer(input) ? input : await (async () => {
      for await (const chunk of input) chunks.push(chunk);
      return Buffer.concat(chunks);
    })();
    if (provider === 'r2') {
      await getClient().send(new PutObjectCommand({
        Bucket: config.r2.bucket, Key: filename, Body: buffer, ContentType: mimeType,
        IfNoneMatch: '*',
      }));
      return `${config.r2.publicDomain}/${filename}`;
    }
    if (provider === 'hostinger') {
      const form = new FormData();
      form.append('file', buffer, { filename, contentType: mimeType });
      const response = await transport.post(config.hostingerUploadUrl, form, {
        headers: { ...form.getHeaders(), ...(config.hostingerUploadToken ? { Authorization: `Bearer ${config.hostingerUploadToken}` } : {}) },
        timeout: 10000, maxRedirects: 0, maxBodyLength: 30 * 1024 * 1024, maxContentLength: 64 * 1024,
      });
      const url = new URL(response.data?.url);
      if (url.protocol !== 'https:' || url.username || url.password ||
          url.origin !== new URL(config.hostingerUploadUrl).origin || !url.pathname.startsWith('/uploads/') ||
          !SAFE_NAME.test(path.posix.basename(url.pathname))) throw new Error('Upload service returned an invalid image URL');
      return url.href;
    }
    await fs.mkdir(config.uploadDir, { recursive: true });
    const target = path.join(config.uploadDir, filename);
    try {
      await fs.writeFile(target, buffer, { flag: 'wx' });
    } catch (err) {
      // A resumed backfill may already have produced the exact derivative.
      if (err.code !== 'EEXIST' || !(await fs.readFile(target)).equals(buffer)) throw err;
    }
    return `${config.baseUrl}/uploads/${filename}`;
  }

  function ownsUrl(url) {
    try {
      const base = provider === 'r2' ? config.r2.publicDomain : config.baseUrl + '/uploads';
      const parsed = new URL(url), root = new URL(base);
      return provider !== 'hostinger' && parsed.origin === root.origin &&
        parsed.pathname.startsWith(root.pathname.replace(/\/$/, '') + '/') &&
        !parsed.search && !parsed.hash;
    } catch { return false; }
  }
  async function deleteFromStorage(filename, url) {
    checkedName(filename);
    if (!ownsUrl(url)) throw httpError(409, 'This image belongs to legacy or different storage and cannot be safely deleted here.');
    if (decodeURIComponent(new URL(url).pathname.split('/').pop()) !== filename) throw httpError(409, 'Storage metadata does not match the image URL.');
    if (provider === 'r2') {
      await getClient().send(new DeleteObjectCommand({ Bucket: config.r2.bucket, Key: filename }));
    } else {
      try { await fs.unlink(path.join(config.uploadDir, filename)); }
      catch (err) { if (err.code !== 'ENOENT') throw err; }
    }
    return true;
  }
  return { uploadToStorage, deleteFromStorage, ownsUrl, provider };
}

// Scripts use the same validated configuration as the application.
let defaultStorage;
function configuredStorage() {
  if (!defaultStorage) defaultStorage = createStorage(require('./config').loadConfig());
  return defaultStorage;
}
module.exports = {
  createStorage, checkedName,
  uploadToStorage: (...args) => configuredStorage().uploadToStorage(...args),
  deleteFromStorage: (...args) => configuredStorage().deleteFromStorage(...args),
};

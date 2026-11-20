const path = require("path");
const fs = require("fs");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

/**
 * Storage Provider for GenieStudio.
 *
 * Supports Cloudflare R2 (S3-compatible persistent storage) when environment
 * variables are set:
 *   - R2_ACCOUNT_ID
 *   - R2_ACCESS_KEY_ID
 *   - R2_SECRET_ACCESS_KEY
 *   - R2_BUCKET_NAME
 *   - R2_PUBLIC_DOMAIN (e.g., https://pub-xxx.r2.dev or https://media.geniestudio.in)
 *
 * Falls back safely to local persistent storage in backend/public/uploads if R2
 * is not configured.
 */

const hasR2Config = () => {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_DOMAIN
  );
};

let s3Client = null;

const getS3Client = () => {
  if (!s3Client && hasR2Config()) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
};

/**
 * Upload a buffer or stream to persistent storage (R2 or local fallback).
 *
 * @param {Buffer|fs.ReadStream} bufferOrStream
 * @param {string} filename - Target filename (e.g. 1786601041-image.webp)
 * @param {string} mimeType - e.g. "image/webp", "image/jpeg"
 * @returns {Promise<string>} Public HTTPS URL of the uploaded image
 */
async function uploadToStorage(bufferOrStream, filename, mimeType = "image/jpeg") {
  if (hasR2Config()) {
    const client = getS3Client();
    const body = Buffer.isBuffer(bufferOrStream)
      ? bufferOrStream
      : await streamToBuffer(bufferOrStream);

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
      Body: body,
      ContentType: mimeType,
    });

    await client.send(command);

    const domain = process.env.R2_PUBLIC_DOMAIN.replace(/\/+$/, "");
    return `${domain}/${filename}`;
  }

  // Fallback to local storage in public/uploads
  const uploadDir = path.join(__dirname, "../public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const targetPath = path.join(uploadDir, filename);

  if (Buffer.isBuffer(bufferOrStream)) {
    fs.writeFileSync(targetPath, bufferOrStream);
  } else {
    const writer = fs.createWriteStream(targetPath);
    await new Promise((resolve, reject) => {
      bufferOrStream.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  }

  const baseUrl = (process.env.BASE_URL || "").replace(/\/+$/, "");
  return `${baseUrl}/uploads/${filename}`;
}

/**
 * Delete a file from persistent storage if it exists.
 */
async function deleteFromStorage(filename) {
  if (hasR2Config()) {
    try {
      const client = getS3Client();
      await client.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: filename,
        })
      );
      return true;
    } catch (err) {
      console.error("R2 delete error:", err.message);
      return false;
    }
  }

  try {
    const targetPath = path.join(__dirname, "../public/uploads", filename);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    return true;
  } catch (err) {
    console.error("Local file delete error:", err.message);
    return false;
  }
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

module.exports = {
  uploadToStorage,
  deleteFromStorage,
  hasR2Config,
};


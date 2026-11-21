const path = require('node:path');
const sharp = require('sharp');
const { httpError, newFilename } = require('./security');

const MAX_IMAGE_PIXELS = 40_000_000;
const TYPES = { '.jpg': 'jpeg', '.jpeg': 'jpeg', '.png': 'png', '.webp': 'webp' };
const MIMES = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

function filterImage(req, file, cb) {
  const format = TYPES[path.extname(file.originalname || '').toLowerCase()];
  if (!format || file.mimetype !== MIMES[format]) return cb(httpError(415, 'Upload a JPG, JPEG, PNG, or WebP image with a matching extension.'));
  cb(null, true);
}

async function validateImage(file) {
  const format = TYPES[path.extname(file.originalname || '').toLowerCase()];
  if (!format || file.mimetype !== MIMES[format] || !Buffer.isBuffer(file.buffer)) {
    throw httpError(415, 'Invalid image format.');
  }
  try {
    const pipeline = sharp(file.buffer, { failOn: 'warning', limitInputPixels: MAX_IMAGE_PIXELS });
    const meta = await pipeline.metadata();
    if (meta.format !== format || (meta.pages || 1) !== 1) throw new Error('Unsupported image');
    // Full decode/re-encode rejects corrupt or disguised input and removes metadata.
    // Keep maximum JPEG quality and use lossless PNG/WebP to preserve approved media.
    const result = await pipeline.rotate().toFormat(format, {
      quality: 100, lossless: true, chromaSubsampling: '4:4:4',
    }).toBuffer({ resolveWithObject: true });
    if (result.data.length > 25 * 1024 * 1024) throw new Error('Decoded image is too large');
    return { buffer: result.data, filename: newFilename(format === 'jpeg' ? 'jpg' : format),
      mimeType: MIMES[format], width: result.info.width, height: result.info.height };
  } catch {
    throw httpError(415, 'Image could not be decoded. Use a valid, single-frame image up to 40 megapixels.');
  }
}
module.exports = { filterImage, validateImage, MAX_IMAGE_PIXELS };

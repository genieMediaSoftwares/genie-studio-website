const crypto = require('node:crypto');

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

function rateLimit({ limit = 20, windowMs = 15 * 60 * 1000, maxEntries = 10000, now = Date.now } = {}) {
  const entries = new Map();
  return (req, res, next) => {
    const time = now();
    for (const [key, value] of entries) if (value.reset <= time) entries.delete(key);
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    let entry = entries.get(key);
    if (!entry) {
      if (entries.size >= maxEntries) return res.status(503).json({ success: false, message: 'Please try again later.' });
      entry = { count: 0, reset: time + windowMs };
      entries.set(key, entry);
    }
    entry.count++;
    if (entry.count > limit) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((entry.reset - time) / 1000))));
      return res.status(429).json({ success: false, message: 'Too many attempts. Please try again later.' });
    }
    next();
  };
}

const validSlug = value => typeof value === 'string' && value.length <= 255 &&
  /^[a-z0-9]+(?:[a-z0-9_-]*[a-z0-9])?(?:\/[a-z0-9]+(?:[a-z0-9_-]*[a-z0-9])?)*$/i.test(value);

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));
const safeJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

function publicImageUrl(value, { nullable = false } = {}) {
  if (nullable && !value) return null;
  if (typeof value !== 'string' || value.length > 2000) throw httpError(400, 'Enter a valid HTTP(S) image URL.');
  let url;
  try { url = new URL(value.trim()); } catch { throw httpError(400, 'Enter a valid HTTP(S) image URL.'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.hash) {
    throw httpError(400, 'Enter a valid HTTP(S) image URL without credentials or fragments.');
  }
  return url.href;
}

const newFilename = extension => `${crypto.randomUUID()}.${extension}`;
module.exports = { httpError, rateLimit, validSlug, escapeHtml, safeJson, publicImageUrl, newFilename };

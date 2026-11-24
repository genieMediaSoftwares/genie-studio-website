const path = require("node:path");

function httpUrl(value, name, { optional = false, production = false } = {}) {
  if (!value && optional) return "";
  let url;
  try { url = new URL(value); } catch { throw new Error(`${name} must be an absolute HTTP(S) URL`); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      url.hash || (production && url.protocol !== 'https:')) {
    throw new Error(`${name} must be an HTTP(S) URL without credentials or a fragment${production ? ' and use HTTPS in production' : ''}`);
  }
  return url.href.replace(/\/$/, "");
}

function loadDatabaseConfig(env = process.env) {
  const missing = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].filter(key => !env[key]?.trim());
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  const dbTls = env.DB_SSL === 'true';
  if (env.NODE_ENV === 'production' && !['localhost', '127.0.0.1', '::1'].includes(env.DB_HOST) && !dbTls) {
    throw new Error('Remote production MySQL connections require DB_SSL=true and a trusted server certificate');
  }
  return {
    host: env.DB_HOST, user: env.DB_USER, password: env.DB_PASSWORD, database: env.DB_NAME,
    ...(dbTls ? { ssl: { rejectUnauthorized: true, ...(env.DB_SSL_CA ? { ca: env.DB_SSL_CA } : {}) } } : {}),
  };
}

function loadConfig(env = process.env) {
  const production = env.NODE_ENV === "production";
  const missing = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "JWT_SECRET"]
    .filter(key => !env[key]?.trim());
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  if (env.JWT_SECRET.length < 32 || /your[_-]|super[_-]secret|change[_-]?me|placeholder/i.test(env.JWT_SECRET)) {
    throw new Error("JWT_SECRET must be a unique random value of at least 32 characters");
  }
  if (production && (!env.SITE_URL || !env.BASE_URL || !env.CORS_ORIGINS)) {
    throw new Error("Production requires SITE_URL, BASE_URL, and CORS_ORIGINS");
  }
  const port = Number(env.PORT || 5000);
  const trustProxy = Number(env.TRUST_PROXY_HOPS || 0);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be between 1 and 65535");
  if (!Number.isInteger(trustProxy) || trustProxy < 0 || trustProxy > 5) throw new Error("TRUST_PROXY_HOPS must be an integer from 0 to 5");
  const siteUrl = httpUrl(env.SITE_URL || "http://localhost:5173", "SITE_URL", { production });
  const baseUrl = httpUrl(env.BASE_URL || `http://localhost:${port}`, "BASE_URL", { production });
  if ([siteUrl, baseUrl].some(value => new URL(value).origin !== value)) throw new Error("SITE_URL and BASE_URL must be origins without paths or queries");
  const db = loadDatabaseConfig(env);
  const corsOrigins = (env.CORS_ORIGINS || "http://localhost:5173").split(',').map(v => {
    const value = httpUrl(v.trim(), "CORS_ORIGINS", { production });
    if (new URL(value).origin !== value) throw new Error("CORS_ORIGINS entries must be origins without paths");
    return value;
  });
  const r2Fields = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_DOMAIN'];
  const storageProvider = env.STORAGE_PROVIDER || (r2Fields.some(k => env[k]) ? 'r2' : 'local');
  if (!['local', 'r2', 'hostinger'].includes(storageProvider)) throw new Error("STORAGE_PROVIDER must be local, r2, or hostinger");
  if (storageProvider === 'r2' && r2Fields.some(k => !env[k])) throw new Error(`R2 storage requires ${r2Fields.join(', ')}`);
  if (production && storageProvider === 'hostinger' && !env.HOSTINGER_UPLOAD_TOKEN) throw new Error('Production Hostinger uploads require HOSTINGER_UPLOAD_TOKEN and a handler that verifies it');
  if (storageProvider === 'hostinger' && !env.HOSTINGER_UPLOAD_URL) throw new Error("Hostinger storage requires HOSTINGER_UPLOAD_URL");
  const jwtTtl = env.JWT_TTL || '7d';
  if (!/^\d+[smhd]$/.test(jwtTtl)) throw new Error("JWT_TTL must be a duration such as 1h");
  return {
    production, port, trustProxy, siteUrl, baseUrl, corsOrigins, jwtSecret: env.JWT_SECRET, jwtTtl,
    db,
    storageProvider,
    uploadDir: path.resolve(__dirname, '../public/uploads'),
    r2: {
      accountId: env.R2_ACCOUNT_ID, accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      bucket: env.R2_BUCKET_NAME,
      publicDomain: httpUrl(env.R2_PUBLIC_DOMAIN, 'R2_PUBLIC_DOMAIN', { optional: true, production }),
    },
    hostingerUploadUrl: httpUrl(env.HOSTINGER_UPLOAD_URL, 'HOSTINGER_UPLOAD_URL', { optional: true, production }),
    hostingerUploadToken: env.HOSTINGER_UPLOAD_TOKEN || '',
    contactWebhookUrl: httpUrl(env.CONTACT_WEBHOOK_URL, 'CONTACT_WEBHOOK_URL', { optional: true, production }),
    contactWebhookToken: env.CONTACT_WEBHOOK_TOKEN || '',
  };
}

module.exports = { loadConfig, loadDatabaseConfig, httpUrl };

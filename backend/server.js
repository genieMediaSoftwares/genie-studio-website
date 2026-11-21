const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env"), quiet: true });

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const axios = require("axios");
const { generateAndUploadVariants } = require("./lib/imagePipeline");
const { createStorage } = require("./lib/storageProvider");
const fs = require("node:fs");
const { loadConfig } = require("./lib/config");
const { transaction } = require("./lib/transaction");
const { filterImage, validateImage } = require("./lib/imageValidation");
const { httpError, rateLimit, validSlug, escapeHtml, safeJson, publicImageUrl } = require("./lib/security");

function createApp({ config = loadConfig(), db: suppliedDb, storage: suppliedStorage, transport = axios, initializeDatabase = true, variantGenerator = generateAndUploadVariants } = {}) {
const mediaStorage = suppliedStorage || createStorage(config);
const bundledMedia = new Set(require('./data/siteSections.json').map(slot => slot.image_url));
for (const url of fs.readFileSync(path.join(__dirname, 'scripts/image-urls.txt'), 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean)) bundledMedia.add(url);
try {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../Frontend/src/lib/imageManifest.json'), 'utf8'));
  for (const [url, entry] of Object.entries(manifest)) {
    bundledMedia.add(url);
    for (const variant of Object.values(entry.variants || {}).flatMap(v => Object.values(v))) bundledMedia.add(variant);
  }
} catch (err) { if (err.code !== 'ENOENT') throw err; }
const { uploadToStorage, deleteFromStorage } = mediaStorage;

const app = express();

// ================= CORS =================
app.disable("x-powered-by");
app.set("trust proxy", config.trustProxy);
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (config.production) res.setHeader("Strict-Transport-Security", "max-age=31536000");
  if (req.path.startsWith('/api/') || req.path.startsWith('/share/')) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
  }
  next();
});
const allowedOrigins = config.corsOrigins;

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(httpError(403, "Origin is not allowed"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

// ================= STATIC FILES =================
app.use("/uploads", (req, res, next) => {
  if (!/\.(?:jpe?g|png|webp|avif)$/i.test(req.path)) return res.sendStatus(404);
  res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  next();
}, express.static(config.uploadDir, { dotfiles: "deny", index: false }));

// ================= DB CONNECTION =================
const db = suppliedDb || mysql.createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 100,
});

let initialization = Promise.resolve();
let initializationError;
const initializeQuery = (sql, params, callback) => {
  if (!initializeDatabase) return;
  if (typeof params === 'function') { callback = params; params = []; }
  initialization = initialization.then(() => {
    if (initializationError) return;
    return new Promise((resolve, reject) => {
    db.query(sql, params || [], (err, result) => {
      try { callback?.(err, result); } catch (callbackError) { reject(callbackError); return; }
      if (err) reject(new Error('Database initialization failed. Check server configuration and schema privileges.'));
      else resolve();
    });
    });
  }).catch(err => { initializationError ||= err; });
};
initializeQuery("SELECT 1", (err) => {
  if (err) console.error("Database connectivity check failed.");
  else console.log("Database connected");
});

// Promise wrapper so the newer image endpoints can use async/await
const dbQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => (err ? reject(err) : resolve(result)));
  });

/**
 * `images.variants` is stored as a JSON string in a TEXT column. Rows written
 * before the responsive pipeline existed hold NULL, and a hand-edited row could
 * hold something unparseable — in both cases the caller should just get null and
 * fall back to the plain `file_url`, never a 500.
 */
const parseVariants = (raw) => {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Attaches variants/lqip to any list of rows carrying an image URL, by looking
 * the URL up in the `images` registry.
 *
 * Gallery and portfolio rows store only a URL — many were added as raw URLs via
 * the bulk manager and have no `images` row of their own. One IN() query keeps
 * this to a single round trip instead of one per item.
 */
const attachImageVariants = async (rows, urlKey = "image_url") => {
  const urls = [...new Set(rows.map((r) => r[urlKey]).filter(Boolean))];
  if (urls.length === 0) return rows;

  let byUrl = new Map();
  try {
    const found = await dbQuery(
      `SELECT file_url, variants, lqip, width, height FROM images WHERE file_url IN (?)`,
      [urls]
    );
    byUrl = new Map(found.map((r) => [r.file_url, r]));
  } catch (err) {
    // A lookup failure must never take down the public page — the items still
    // render from their original URL, just without a srcSet.
    console.error("Variant lookup failed:", err.message);
    return rows;
  }

  return rows.map((row) => {
    const match = byUrl.get(row[urlKey]);
    if (!match) return row;
    return {
      ...row,
      variants: parseVariants(match.variants),
      lqip: match.lqip || null,
      width: match.width || null,
      height: match.height || null,
    };
  });
};

// ================= IMAGES TABLE =================
// Central registry of every image pushed to Hostinger — used by the standalone
// Image Library (/admin/images) and by the Blog Editor's Featured Image.
// Blogs keep storing the image URL, so nothing about existing rows changes.
initializeQuery(
  `CREATE TABLE IF NOT EXISTS images (
     id            INT AUTO_INCREMENT PRIMARY KEY,
     filename      VARCHAR(255) NOT NULL,
     original_name VARCHAR(255) DEFAULT NULL,
     file_url      VARCHAR(500) NOT NULL,
     file_path     VARCHAR(500) DEFAULT NULL,
     mime_type     VARCHAR(100) DEFAULT NULL,
     file_size     INT          DEFAULT NULL,
     width         INT          DEFAULT NULL,
     height        INT          DEFAULT NULL,
     source        VARCHAR(32)  DEFAULT 'library',
     created_at    BIGINT       DEFAULT NULL,
     UNIQUE KEY uniq_file_url (file_url(191))
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  (err) => {
    if (err) console.log("❌ images table error:", err.message);
    else console.log("✅ images table ready");
  }
);

// Responsive derivatives live alongside the original row. Added by migration
// rather than in CREATE TABLE above, because the table already exists in
// production and CREATE TABLE IF NOT EXISTS would skip the new columns.
//
//   variants — JSON: { webp: { 400: url, … }, avif: { 400: url, … } }
//   lqip     — base64 data URI of the ~24px blur-up placeholder
//
// Both are nullable: an image with no derivatives yet still renders from
// file_url, it just does not get a srcSet.
const addColumnIfMissing = (table, column, definition) => {
  initializeQuery(
    `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column],
    (err, rows) => {
      if (err) return console.log(`❌ ${table}.${column} check failed:`, err.message);
      if (rows[0].n > 0) return;
      initializeQuery(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (alterErr) => {
        if (alterErr) console.log(`❌ ${table}.${column} add failed:`, alterErr.message);
        else console.log(`✅ ${table}.${column} added`);
      });
    }
  );
};

addColumnIfMissing("images", "variants", "TEXT DEFAULT NULL");
addColumnIfMissing("images", "lqip", "TEXT DEFAULT NULL");
addColumnIfMissing("images", "storage_provider", "VARCHAR(32) DEFAULT NULL");
addColumnIfMissing("images", "storage_bucket", "VARCHAR(255) DEFAULT NULL");

// ================= PORTFOLIO =================
// Categories the public Portfolio page filters by. "all" is a view, not a
// stored category, so it is intentionally absent.
const PORTFOLIO_CATEGORIES = [
  "corporate",
  "events",
  "product",
  "podcast",
  "professional",
  "business",
];

initializeQuery(
  `CREATE TABLE IF NOT EXISTS portfolio_images (
     id          INT AUTO_INCREMENT PRIMARY KEY,
     category    VARCHAR(50)  NOT NULL,
     image_url   VARCHAR(500) NOT NULL,
     title       VARCHAR(255) DEFAULT NULL,
     description TEXT         NULL,
     sort_order  INT          DEFAULT 0,
     created_at  BIGINT       DEFAULT NULL,
     updated_at  BIGINT       DEFAULT NULL,
     UNIQUE KEY uniq_category_url (category, image_url(191)),
     KEY idx_category (category)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  (err) => {
    if (err) return console.log("❌ portfolio_images table error:", err.message);
    console.log("✅ portfolio_images table ready");


  }
);

// ================= DOME GALLERY =================
// One flat, ordered list of images for the DomeGallery component on /gallery.
initializeQuery(
  `CREATE TABLE IF NOT EXISTS gallery_images (
     id         INT AUTO_INCREMENT PRIMARY KEY,
     image_url  VARCHAR(500) NOT NULL,
     alt        VARCHAR(255) DEFAULT NULL,
     sort_order INT          DEFAULT 0,
     created_at BIGINT       DEFAULT NULL,
     updated_at BIGINT       DEFAULT NULL,
     UNIQUE KEY uniq_gallery_url (image_url(191))
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  (err) => {
    if (err) return console.log("❌ gallery_images table error:", err.message);
    console.log("✅ gallery_images table ready");


  }
);

// ================= SITE SECTIONS (PAGE IMAGE ASSIGNMENTS) =================
const DEFAULT_SITE_SECTIONS = require('./data/siteSections.json');

initializeQuery(
  `CREATE TABLE IF NOT EXISTS site_sections (
     id INT AUTO_INCREMENT PRIMARY KEY,
     category VARCHAR(50) NOT NULL,
     section_key VARCHAR(100) NOT NULL UNIQUE,
     section_name VARCHAR(150) NOT NULL,
     page_name VARCHAR(100) NOT NULL,
     image_url VARCHAR(500) DEFAULT NULL,
     alt_text VARCHAR(255) DEFAULT NULL,
     aspect_ratio VARCHAR(50) DEFAULT '16:9',
     sort_order INT DEFAULT 0,
     updated_at BIGINT DEFAULT NULL,
     KEY idx_category (category)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  (err) => {
    if (err) return console.log("❌ site_sections table error:", err.message);
    console.log("✅ site_sections table ready");

    // Seed default section slots if empty
    initializeQuery("SELECT COUNT(*) AS n FROM site_sections", (err2, rows) => {
      if (err2 || rows[0].n > 0) return;
      const now = Date.now();
      const values = DEFAULT_SITE_SECTIONS.filter(s => s.active !== false).map((s) => [
        s.category,
        s.section_key,
        s.section_name,
        s.page_name,
        s.image_url,
        s.alt_text,
        s.aspect_ratio,
        s.sort_order,
        now,
      ]);
      initializeQuery(
        `INSERT INTO site_sections
          (category, section_key, section_name, page_name, image_url, alt_text, aspect_ratio, sort_order, updated_at)
         VALUES ?`,
        [values],
        (err3) => {
          if (err3) console.log("❌ site_sections seed error:", err3.message);
          else console.log(`✅ site_sections seeded with ${values.length} slots`);
        }
      );
    });
  }
);

// Bounded memory upload: no unvalidated file is written to a public directory.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 20, parts: 21, fieldSize: 1024 * 1024 },
  fileFilter: filterImage,
});
let activeUploads = 0;
const uploadAndRegisterImage = async (file, meta = {}) => {
  if (activeUploads >= 4) throw httpError(429, "The image processor is busy. Please retry shortly.");
  activeUploads++;
  let url, filename, derived;
  try {
    const validated = await validateImage(file);
    filename = validated.filename;
    url = await uploadToStorage(validated.buffer, filename, validated.mimeType);
    filename = decodeURIComponent(new URL(url).pathname.split('/').pop());
    try {
      derived = await variantGenerator(validated.buffer, filename, { storageUpload: uploadToStorage });
    } catch {
      console.error("Image derivative generation failed; validated original was retained.");
    }
    const record = {
      filename, original_name: String(file.originalname).replace(/[\x00-\x1f]/g, '').slice(0, 255),
      url, file_url: url, file_path: null, mime_type: validated.mimeType, file_size: validated.buffer.length,
      width: validated.width, height: validated.height,
      variants: derived?.variants || null, lqip: derived?.lqip || null, created_at: Date.now(),
    };
    const result = await dbQuery(`INSERT INTO images
      (filename, original_name, file_url, file_path, mime_type, file_size, width, height, variants, lqip, source, created_at, storage_provider, storage_bucket)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      record.filename, record.original_name, record.file_url, null, record.mime_type, record.file_size,
      record.width, record.height, record.variants ? JSON.stringify(record.variants) : null, record.lqip,
      meta.source || 'library', record.created_at, mediaStorage.provider,
      mediaStorage.provider === 'r2' ? config.r2.bucket : null,
    ]);
    return { ...record, id: result.insertId };
  } catch (err) {
    // Roll back only new files from this request, never existing company media.
    if (url) {
      const createdUrls = [url, ...Object.values(derived?.variants || {}).flatMap(v => Object.values(v))];
      for (const createdUrl of createdUrls) {
        try { await deleteFromStorage(decodeURIComponent(new URL(createdUrl).pathname.split('/').pop()), createdUrl); }
        catch { console.error("New upload cleanup needs retry."); }
      }
    }
    throw err;
  } finally { activeUploads--; }
};

// ================= HELPER: Normalize image URL =================
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  return String(imagePath);
};

// ================= JWT MIDDLEWARE =================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(403).json({ success: false, message: "No token provided" });

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] }, async (err, decoded) => {
    if (err)
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    if (!decoded || !Number.isInteger(decoded.id) || decoded.id < 1 || typeof decoded.email !== 'string') {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    try {
      const users = await dbQuery("SELECT id FROM admins WHERE id = ? AND email = ? LIMIT 1", [decoded.id, decoded.email]);
      if (!users.length) return res.status(401).json({ success: false, message: "Invalid or expired token" });
      req.user = decoded;
      next();
    } catch { res.status(503).json({ success: false, message: "Authentication is temporarily unavailable" }); }
  });
};

app.use((req, res, next) => {
  if (config.production && !req.secure) return res.status(400).json({ success: false, message: 'HTTPS is required.' });
  next();
});

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("🚀 GenieStudio Backend is Working!");
});

// ================= LOGIN =================
const loginLimiter = rateLimit();
const uploadLimiter = rateLimit({ limit: 120, windowMs: 60 * 60 * 1000 });
app.post("/api/login", loginLimiter, async (req, res, next) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string' || email.length > 255 ||
      !email.trim() || !password || Buffer.byteLength(password) > 72) {
    return res.status(400).json({ success: false, message: 'A valid email and password are required.' });
  }
  try {
    const users = await dbQuery("SELECT id, email, password FROM admins WHERE email = ? LIMIT 1", [email.trim()]);
    const user = users[0];
    if (!user || typeof user.password !== 'string' || !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.password) ||
        !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, { algorithm: 'HS256', expiresIn: config.jwtTtl });
    res.json({ success: true, token });
  } catch (err) { next(err); }
});

app.post('/api/contact', rateLimit({ limit: 5, windowMs: 60 * 60 * 1000 }), async (req, res, next) => {
  const fields = ['name', 'email', 'phone', 'service', 'bookingDate', 'message'];
  const data = {};
  for (const field of fields) {
    if (typeof req.body?.[field] !== 'string' || req.body[field].length > (field === 'message' ? 5000 : 255)) {
      return res.status(400).json({ success: false, message: 'Please check your contact details.' });
    }
    data[field] = req.body[field].trim();
  }
  if (!data.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || !/^[+()\d\s-]{7,25}$/.test(data.phone) ||
      data.phone.replace(/\D/g, '').length < 7 || !data.service || !/^\d{4}-\d{2}-\d{2}$/.test(data.bookingDate) ||
      !Number.isFinite(Date.parse(data.bookingDate)) || new Date(data.bookingDate).toISOString().slice(0, 10) !== data.bookingDate) {
    return res.status(400).json({ success: false, message: 'Please complete the required contact details.' });
  }
  if (!config.contactWebhookUrl) return res.status(503).json({ success: false, message: 'Online enquiries are temporarily unavailable. Please call or email the studio.' });
  try {
    const result = await transport.post(config.contactWebhookUrl, data, {
      timeout: 10000, maxRedirects: 0, maxContentLength: 65536,
      headers: config.contactWebhookToken ? { Authorization: `Bearer ${config.contactWebhookToken}` } : {},
    });
    if (result.data?.success !== true) throw new Error('Contact provider did not confirm delivery');
    res.json({ success: true, message: 'Your enquiry was sent.' });
  } catch (err) { next(err); }
});

// ================= IMAGE LIBRARY =================
// Standalone upload — no blog required. Uses the exact same pipeline as the
// Blog Editor's Featured Image (multer → upload.php → public_html/uploads/).
app.post("/api/images", verifyToken, uploadLimiter, upload.single("image"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No image file received" });

    const image = await uploadAndRegisterImage(req.file, {
      width: req.body.width,
      height: req.body.height,
      source: "library",
    });

    res.json({ success: true, message: "Image uploaded successfully", image });
  } catch (err) {
    console.error("Error uploading image:", err.message);
    res.status(err.status || 500).json({ success: false, message: err.status ? err.message : "Image upload failed. Please try again." });
  }
});

// List every image in the library, newest first
app.get("/api/images", verifyToken, async (req, res) => {
  try {
    const images = await dbQuery(
      "SELECT * FROM images ORDER BY created_at DESC, id DESC"
    );
    res.json({
      success: true,
      images: images.map((img) => ({
        ...img,
        url: img.file_url,
        variants: parseVariants(img.variants),
      })),
    });
  } catch (err) {
    console.error("DB error listing images:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch images" });
  }
});

// Renames the DISPLAY NAME only.
// The Hostinger file, file_url, file_path and filename are deliberately never
// touched — every blog already pointing at the HTTPS URL must keep working.
app.put("/api/images/:id", verifyToken, async (req, res) => {
  try {
    const name = String(req.body.original_name || "").trim();
    if (!name)
      return res.status(400).json({ success: false, message: "Display name cannot be empty" });
    if (name.length > 255)
      return res.status(400).json({ success: false, message: "Display name is too long (max 255 characters)" });

    const result = await dbQuery("UPDATE images SET original_name = ? WHERE id = ?", [
      name,
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Image not found" });

    const [image] = await dbQuery("SELECT * FROM images WHERE id = ?", [req.params.id]);
    res.json({
      success: true,
      message: "Image renamed",
      image: { ...image, url: image.file_url },
    });
  } catch (err) {
    console.error("DB error renaming image:", err.message);
    res.status(500).json({ success: false, message: "Failed to rename image" });
  }
});

// Removes the library entry and deletes file from persistent storage
app.delete("/api/images/:id", verifyToken, async (req, res, next) => {
  try {
    if (!/^[1-9]\d*$/.test(req.params.id)) throw httpError(400, 'Invalid image ID.');
    const [image] = await dbQuery("SELECT * FROM images WHERE id = ?", [req.params.id]);
    if (!image) throw httpError(404, 'Image not found.');
    const urls = [...new Set([image.file_url, ...Object.values(parseVariants(image.variants) || {}).flatMap(v => Object.values(v))])];
    if (urls.some(url => bundledMedia.has(url))) throw httpError(409, 'This image is included in the website source and cannot be deleted from the library.');
    // Preserve images referenced by published content, drafts, or assigned slots.
    for (const url of urls) {
      const checks = [
        ['blogs', 'image = ? OR INSTR(COALESCE(description, \'\'), ?) > 0', [url, url]],
        ['gallery_images', 'image_url = ?', [url]],
        ['portfolio_images', 'image_url = ?', [url]],
        ['site_sections', 'image_url = ?', [url]],
      ];
      for (const [table, condition, params] of checks) {
        const rows = await dbQuery(`SELECT id FROM ${table} WHERE ${condition} LIMIT 1`, params);
        if (rows.length) throw httpError(409, 'This image is in use. Replace or remove its content references before deleting it.');
      }
    }
    if (image.storage_provider && image.storage_provider !== mediaStorage.provider ||
        image.storage_bucket && image.storage_bucket !== config.r2.bucket) {
      throw httpError(409, 'This image belongs to a different storage configuration.');
    }
    // Preflight every target before deleting anything. Unknown legacy storage is retained.
    if (urls.some(url => !mediaStorage.ownsUrl(url))) throw httpError(409, 'Legacy or external images must be reviewed before physical deletion.');
    for (const url of urls) {
      const name = decodeURIComponent(new URL(url).pathname.split('/').pop());
      const deleted = await deleteFromStorage(name, url);
      if (deleted !== true) throw new Error('Storage deletion failed');
    }
    await dbQuery("DELETE FROM images WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Unreferenced image deleted from storage and library.' });
  } catch (err) { next(err); }
});

// ================= SITE SECTIONS API (CENTRALIZED IMAGE MANAGEMENT) =================
// Public read: returns all configured section slots with their assigned images
app.get("/api/site-sections", async (req, res) => {
  try {
    const { category } = req.query;
    const where = "";
    const params = [];

    const sections = await dbQuery(
      `SELECT * FROM site_sections ${where} ORDER BY sort_order ASC, id ASC`,
      params
    );

    const definitions = DEFAULT_SITE_SECTIONS.filter(slot => slot.active !== false && (!category || slot.category === category));
    const byKey = new Map(sections.map(row => [row.section_key, row]));
    const merged = definitions.map(slot => ({ ...slot, ...byKey.get(slot.section_key),
      section_heading: slot.section_heading, category: slot.category, page_name: slot.page_name,
      default_image_url: slot.image_url,
    }));
    const withVariants = await attachImageVariants(merged, "image_url");
    // Fast key-value dictionary: { [section_key]: { image_url, alt_text, variants, lqip } }
    const map = {};
    for (const s of withVariants) {
      map[s.section_key] = {
        image_url: s.image_url,
        alt_text: s.alt_text,
        variants: s.variants || null,
        lqip: s.lqip || null,
        section_name: s.section_name,
        page_name: s.page_name,
        category: s.category,
        default_image_url: s.default_image_url,
      };
    }

    res.json({
      success: true,
      sections: withVariants,
      map,
    });
  } catch (err) {
    console.error("DB error fetching site sections:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch site sections" });
  }
});

// Admin assign/replace image for a section
app.put("/api/site-sections/:section_key", verifyToken, async (req, res) => {
  try {
    const { section_key } = req.params;
    const { image_url, alt_text } = req.body;

    if (!image_url || typeof image_url !== "string") {
      return res.status(400).json({ success: false, message: "Valid image URL is required" });
    }

    const trimmedUrl = publicImageUrl(image_url);
    const now = Date.now();

    const slot = DEFAULT_SITE_SECTIONS.find(item => item.active !== false && item.section_key === section_key);
    if (!slot) throw httpError(404, 'Unknown website image slot.');
    if (alt_text != null && (typeof alt_text !== 'string' || alt_text.length > 255)) throw httpError(400, 'Alt text must be at most 255 characters.');
    const result = await dbQuery(`INSERT INTO site_sections
      (category, section_key, section_name, page_name, image_url, alt_text, aspect_ratio, sort_order, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE image_url = VALUES(image_url), alt_text = COALESCE(?, alt_text), updated_at = VALUES(updated_at)`,
      [slot.category, section_key, slot.section_name, slot.page_name, trimmedUrl, alt_text || slot.alt_text, slot.aspect_ratio, slot.sort_order, now, alt_text || null]);

    const [updated] = await dbQuery(
      "SELECT * FROM site_sections WHERE section_key = ?",
      [section_key]
    );

    const [withVariants] = await attachImageVariants([updated], "image_url");

    res.json({
      success: true,
      message: `Image assigned to ${updated.section_name}`,
      section: withVariants,
    });
  } catch (err) {
    console.error("DB error updating site section:", err.message);
    res.status(err.status || 500).json({ success: false, message: err.status ? err.message : "Failed to update site section" });
  }
});

// Admin clear image assignment from a section
app.delete("/api/site-sections/:section_key", verifyToken, async (req, res) => {
  try {
    const { section_key } = req.params;
    const now = Date.now();

    const result = await dbQuery(
      "UPDATE site_sections SET image_url = NULL, updated_at = ? WHERE section_key = ?",
      [now, section_key]
    );

    if (!DEFAULT_SITE_SECTIONS.some(item => item.active !== false && item.section_key === section_key)) {
      return res.status(404).json({ success: false, message: "Section key not found" });
    }

    res.json({ success: true, message: "Image assignment removed from section" });
  } catch (err) {
    console.error("DB error clearing site section:", err.message);
    res.status(500).json({ success: false, message: "Failed to clear site section" });
  }
});

// ================= SHARED: parse a pasted URL list =================
// Used by both the Portfolio and Dome Gallery bulk endpoints so the two behave
// identically: trim, drop blanks, reject non-http(s) lines, and de-duplicate
// within the pasted list itself.
const parseUrlList = (raw) => {
  const lines = (Array.isArray(raw) ? raw : String(raw || "").split(/\r?\n/)).slice(0, 500);
  const seen = new Set();
  const invalid = [];
  const urls = [];
  let repeated = 0;

  for (const line of lines) {
    let url = String(line || "").trim();
    if (!url) continue;
    try { url = publicImageUrl(url); } catch { invalid.push(url); continue; }
    if (seen.has(url)) { repeated += 1; continue; }
    seen.add(url);
    urls.push(url);
  }

  return { urls, invalid, repeated };
};

// ================= PORTFOLIO API =================
// Public read — the Portfolio page fetches this instead of hardcoding images.
app.get("/api/portfolio", async (req, res) => {
  try {
    const { category } = req.query;
    const where = category && category !== "all" ? "WHERE category = ?" : "";
    const params = where ? [category] : [];

    const items = await dbQuery(
      `SELECT * FROM portfolio_images ${where} ORDER BY category ASC, sort_order ASC, id ASC`,
      params
    );
    res.json({ success: true, items: await attachImageVariants(items) });
  } catch (err) {
    console.error("DB error fetching portfolio:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch portfolio images" });
  }
});

/**
 * Bulk add / replace a category from a list of pasted URLs.
 *
 * body: { category, urls: string[], mode: "append" | "replace", title?, description? }
 *
 * mode "append"  — adds the new URLs after the existing ones
 * mode "replace" — wipes the category first, then inserts
 *
 * Duplicates are skipped in both directions: repeats inside the pasted list,
 * and URLs already stored in that category.
 */
app.post("/api/portfolio/bulk", verifyToken, async (req, res) => {
  try {
    const category = String(req.body.category || "").trim().toLowerCase();
    const mode = req.body.mode === "replace" ? "replace" : "append";

    if (!PORTFOLIO_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Unknown category. Use one of: ${PORTFOLIO_CATEGORIES.join(", ")}`,
      });
    }

    const { urls, invalid, repeated } = parseUrlList(req.body.urls);

    if (urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: invalid.length
          ? "No valid URLs found — each line must start with http:// or https://"
          : "Paste at least one image URL.",
      });
    }

    const response = await transaction(db, async query => {
    if (mode === "replace") {
      await query("DELETE FROM portfolio_images WHERE category = ?", [category]);
    }

    const existing = await query(
      "SELECT image_url FROM portfolio_images WHERE category = ?",
      [category]
    );
    const already = new Set(existing.map((r) => r.image_url));

    const [{ maxOrder }] = await query(
      "SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM portfolio_images WHERE category = ?",
      [category]
    );

    const now = Date.now();
    const title = String(req.body.title || "").trim() || null;
    const description = String(req.body.description || "").trim() || null;

    let order = Number(maxOrder) + 1;
    const rows = [];
    // Count both kinds of duplicate — repeats inside the paste AND URLs already
    // stored — so the reported number matches what the admin actually pasted.
    let skipped = repeated;
    for (const url of urls) {
      if (already.has(url)) { skipped += 1; continue; }
      rows.push([category, url, title, description, order++, now, now]);
    }

    if (rows.length > 0) {
      await query(
        `INSERT IGNORE INTO portfolio_images
           (category, image_url, title, description, sort_order, created_at, updated_at)
         VALUES ?`,
        [rows]
      );
    }

    const items = await query(
      "SELECT * FROM portfolio_images WHERE category = ? ORDER BY sort_order ASC, id ASC",
      [category]
    );

    return {
      success: true,
      message: `${rows.length} image${rows.length === 1 ? "" : "s"} added${skipped ? `, ${skipped} duplicate skipped` : ""}`,
      added: rows.length,
      skipped,
      invalid,
      items,
    };
    });
    res.json(response);
  } catch (err) {
    console.error("DB error bulk-saving portfolio:", err.message);
    res.status(500).json({ success: false, message: "Failed to update portfolio" });
  }
});

// Reorder — declared BEFORE /:id so "reorder" is never read as an id
app.put("/api/portfolio/reorder", verifyToken, async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Boolean) : [];
    if (ids.length === 0)
      return res.status(400).json({ success: false, message: "No image order provided" });

    const now = Date.now();
    await Promise.all(
      ids.map((id, index) =>
        dbQuery("UPDATE portfolio_images SET sort_order = ?, updated_at = ? WHERE id = ?", [index, now, id])
      )
    );
    res.json({ success: true, message: "Order saved" });
  } catch (err) {
    console.error("DB error reordering portfolio:", err.message);
    res.status(500).json({ success: false, message: "Failed to save the new order" });
  }
});

// Edit a single entry (URL, title or description)
app.put("/api/portfolio/:id", verifyToken, async (req, res) => {
  try {
    const url = publicImageUrl(req.body.image_url);

    const result = await dbQuery(
      "UPDATE portfolio_images SET image_url = ?, title = ?, description = ?, updated_at = ? WHERE id = ?",
      [
        url,
        String(req.body.title || "").trim() || null,
        String(req.body.description || "").trim() || null,
        Date.now(),
        req.params.id,
      ]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Portfolio image not found" });

    const [item] = await dbQuery("SELECT * FROM portfolio_images WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Portfolio image updated", item });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ success: false, message: "That URL is already in this category." });
    console.error("DB error updating portfolio image:", err.message);
    res.status(err.status || 500).json({ success: false, message: err.status ? err.message : "Failed to update the image" });
  }
});

app.delete("/api/portfolio/:id", verifyToken, async (req, res) => {
  try {
    await dbQuery("DELETE FROM portfolio_images WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Portfolio image removed" });
  } catch (err) {
    console.error("DB error deleting portfolio image:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete the image" });
  }
});

// ================= DOME GALLERY API =================
// Public read — DomeGallery.jsx fetches this instead of holding a hardcoded list.
app.get("/api/gallery", async (req, res) => {
  try {
    const items = await dbQuery(
      "SELECT * FROM gallery_images ORDER BY sort_order ASC, id ASC"
    );
    res.json({ success: true, items: await attachImageVariants(items) });
  } catch (err) {
    console.error("DB error fetching gallery:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch gallery images" });
  }
});

/**
 * Bulk add / replace the dome gallery.
 * body: { urls: string[] | string, mode: "append" | "replace", alt? }
 */
app.post("/api/gallery/bulk", verifyToken, async (req, res) => {
  try {
    const mode = req.body.mode === "replace" ? "replace" : "append";
    const { urls, invalid, repeated } = parseUrlList(req.body.urls);

    if (urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: invalid.length
          ? "No valid URLs found — each line must start with http:// or https://"
          : "Paste at least one image URL.",
      });
    }

    const response = await transaction(db, async query => {
    if (mode === "replace") {
      await query("DELETE FROM gallery_images");
    }

    const existing = await query("SELECT image_url FROM gallery_images");
    const already = new Set(existing.map((r) => r.image_url));

    const [{ maxOrder }] = await query(
      "SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM gallery_images"
    );

    const now = Date.now();
    const alt = String(req.body.alt || "").trim() || null;

    let order = Number(maxOrder) + 1;
    const rows = [];
    let skipped = repeated;
    for (const url of urls) {
      if (already.has(url)) { skipped += 1; continue; }
      rows.push([url, alt, order++, now, now]);
    }

    if (rows.length > 0) {
      await query(
        "INSERT IGNORE INTO gallery_images (image_url, alt, sort_order, created_at, updated_at) VALUES ?",
        [rows]
      );
    }

    const items = await query(
      "SELECT * FROM gallery_images ORDER BY sort_order ASC, id ASC"
    );

    return {
      success: true,
      message: `${rows.length} image${rows.length === 1 ? "" : "s"} added${skipped ? `, ${skipped} duplicate skipped` : ""}`,
      added: rows.length,
      skipped,
      invalid,
      items,
    };
    });
    res.json(response);
  } catch (err) {
    console.error("DB error bulk-saving gallery:", err.message);
    res.status(500).json({ success: false, message: "Failed to update the gallery" });
  }
});

// Reorder — must be declared BEFORE /:id
app.put("/api/gallery/reorder", verifyToken, async (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids.map(Number).filter(Boolean) : [];
    if (ids.length === 0)
      return res.status(400).json({ success: false, message: "No image order provided" });

    const now = Date.now();
    await Promise.all(
      ids.map((id, index) =>
        dbQuery("UPDATE gallery_images SET sort_order = ?, updated_at = ? WHERE id = ?", [index, now, id])
      )
    );
    res.json({ success: true, message: "Order saved" });
  } catch (err) {
    console.error("DB error reordering gallery:", err.message);
    res.status(500).json({ success: false, message: "Failed to save the new order" });
  }
});

app.put("/api/gallery/:id", verifyToken, async (req, res) => {
  try {
    const url = publicImageUrl(req.body.image_url);

    const result = await dbQuery(
      "UPDATE gallery_images SET image_url = ?, alt = ?, updated_at = ? WHERE id = ?",
      [url, String(req.body.alt || "").trim() || null, Date.now(), req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Gallery image not found" });

    const [item] = await dbQuery("SELECT * FROM gallery_images WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Gallery image updated", item });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ success: false, message: "That URL is already in the gallery." });
    console.error("DB error updating gallery image:", err.message);
    res.status(err.status || 500).json({ success: false, message: err.status ? err.message : "Failed to update the image" });
  }
});

app.delete("/api/gallery/:id", verifyToken, async (req, res) => {
  try {
    await dbQuery("DELETE FROM gallery_images WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Gallery image removed" });
  } catch (err) {
    console.error("DB error deleting gallery image:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete the image" });
  }
});

// ================= CREATE BLOG =================
app.post("/api/blogs", verifyToken, uploadLimiter, upload.single("image"), async (req, res) => {
  try {
    if (!validSlug(req.body.permalink) || !['draft', 'published'].includes(req.body.status) ||
        typeof req.body.title !== 'string' || !req.body.title.trim() || req.body.title.length > 255) {
      return res.status(400).json({ success: false, message: 'A title, valid permalink, and draft/published status are required.' });
    }
    if (req.body.existingImage) publicImageUrl(req.body.existingImage);
    let imageUrl = null;

    if (req.file) {
      // Upload temp file to Hostinger, get back full HTTPS URL (also registered
      // in the images library so it can be reused by other blogs later)
      const image = await uploadAndRegisterImage(req.file, {
        width: req.body.width,
        height: req.body.height,
        source: "blog",
      });
      imageUrl = image.url;
    } else if (req.body.existingImage && req.body.existingImage.trim() !== "") {
      // ✅ Image picked from the library — reuse the already-hosted URL,
      //    no second copy of the file is created
      imageUrl = req.body.existingImage.trim();
    }

    const sql = `
      INSERT INTO blogs 
      (title, permalink, metaDescription, description, category, image, keywords, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        req.body.title,
        req.body.permalink,
        req.body.metaDescription,
        req.body.description,
        req.body.category,
        imageUrl,
        req.body.keywords,
        req.body.status,
        Date.now(),
        Date.now(),
      ],
      (err) => {
        if (err) {
          console.error("DB error creating blog:");
          return res.status(500).json({ success: false, message: "Failed to create blog" });
        }
        res.json({ success: true, message: "Blog created" });
      }
    );
  } catch (err) {
    console.error("Error creating blog:");
    res.status(err.status || 500).json({ success: false, message: err.status ? err.message : "Server error" });
  }
});

// ================= GET PUBLIC BLOGS =================
app.get("/api/blogs", (req, res) => {
  db.query("SELECT * FROM blogs WHERE status = 'published' ORDER BY createdAt DESC", async (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to fetch blogs" });

    const blogs = results.map((blog) => ({
      ...blog,
      image: getImageUrl(blog.image),
    }));

    // Blog images are no longer in the shipped manifest — it now carries only
    // the URLs hardcoded in the JSX — so the responsive variants have to ride
    // along with the data instead. One IN() query, same as gallery/portfolio.
    res.json(await attachImageVariants(blogs, "image"));
  });
});

// ================= GET ALL BLOGS (ADMIN) =================
app.get("/api/admin/blogs", verifyToken, (req, res) => {
  db.query("SELECT * FROM blogs ORDER BY createdAt DESC", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to fetch blogs" });

    const blogs = results.map((blog) => ({
      ...blog,
      image: getImageUrl(blog.image),
    }));

    res.json(blogs);
  });
});

// ================= GET SINGLE BLOG BY SLUG =================
app.use("/api/blog", (req, res) => {
  const slug = req.path.replace(/^\//, "");
  if (!slug || !validSlug(slug))
    return res.status(404).json({ success: false, message: "No slug provided" });

  db.query("SELECT * FROM blogs WHERE permalink = ? AND status = 'published'", [slug], async (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ success: false, message: "Blog not found" });

    const blog = { ...result[0], image: getImageUrl(result[0].image) };
    // The hero image here is the blog page's LCP element, so it needs its
    // variants and LQIP attached rather than falling back to the original.
    const [withVariants] = await attachImageVariants([blog], "image");
    res.json(withVariants);
  });
});

// ================= UPDATE BLOG =================
app.put("/api/blogs/:id", verifyToken, uploadLimiter, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  if (!/^[1-9]\d*$/.test(id) || !validSlug(req.body.permalink) || !['draft', 'published'].includes(req.body.status) ||
      typeof req.body.title !== 'string' || !req.body.title.trim() || req.body.title.length > 255) {
    return res.status(400).json({ success: false, message: 'A title, valid permalink, and draft/published status are required.' });
  }
  try { if (req.body.existingImage) publicImageUrl(req.body.existingImage); }
  catch (err) { return res.status(400).json({ success: false, message: err.message }); }
  const {
    title,
    permalink,
    metaDescription,
    description,
    category,
    keywords,
    status,
    existingImage, // ✅ sent by frontend when no new file is chosen — preserve current image
  } = req.body;

  try {
    let imageUrl;

    if (req.file) {
      // ✅ FIX: New file uploaded → send it to Hostinger upload.php, get full HTTPS URL
      // Previously this was storing a local /uploads/ path which broke on Hostinger
      const image = await uploadAndRegisterImage(req.file, {
        width: req.body.width,
        height: req.body.height,
        source: "blog",
      });
      imageUrl = image.url;
    } else if (existingImage && existingImage.trim() !== "") {
      // ✅ No new file, but frontend passed the current image URL → keep it
      imageUrl = existingImage.trim();
    } else {
      // No file, no existingImage → user intentionally removed the image
      imageUrl = null;
    }

    const sql = `
      UPDATE blogs SET
        title = ?,
        permalink = ?,
        metaDescription = ?,
        description = ?,
        category = ?,
        keywords = ?,
        status = ?,
        image = ?,
        updatedAt = ?
      WHERE id = ?
    `;

    const values = [
      title,
      permalink,
      metaDescription,
      description,
      category,
      keywords,
      status,
      imageUrl,   // ✅ always explicitly set — no conditional column building
      Date.now(),
      id,
    ];

    db.query(sql, values, (err) => {
      if (err) {
        console.error("DB error updating blog:");
        return res.status(500).json({ success: false, message: "Failed to update blog" });
      }
      res.json({ success: true, message: "Blog updated" });
    });
  } catch (err) {
    console.error("Error updating blog:");
    res.status(err.status || 500).json({ success: false, message: err.status ? err.message : "Server error uploading image" });
  }
});

// ================= DELETE BLOG =================
app.delete("/api/blogs/:id", verifyToken, (req, res) => {
  db.query("SELECT image FROM blogs WHERE id = ?", [req.params.id], (err, result) => {
    // Note: images are stored on Hostinger, not locally, so local file deletion is skipped
    // If you want to also delete from Hostinger you'd need a delete endpoint on upload.php

    db.query("DELETE FROM blogs WHERE id = ?", [req.params.id], (err2) => {
      if (err2) return res.status(500).json({ success: false, message: "Failed to delete blog" });
      res.json({ success: true, message: "Blog deleted" });
    });
  });
});

// ================= OG SHARE PREVIEW =================
// When a blog link is shared on WhatsApp / Twitter / LinkedIn / Telegram etc.,
// social crawlers hit this URL, read the OG meta tags, and render the preview card.
// Regular human visitors are instantly JS-redirected to the actual React blog page.
//
// Share URL format:  https://<your-backend-domain>/share/<permalink>
// Example:           https://api.geniestudio.in/share/services/my-blog-post
//
// In AdminBlogs.jsx the "Copy Share Link" button copies exactly this URL.

app.use("/share/", (req, res) => {
  const permalink = req.path.replace(/^\//, "");
  if (!permalink || !validSlug(permalink)) return res.sendStatus(404);

  db.query(
    "SELECT title, metaDescription, image, permalink FROM blogs WHERE permalink = ? AND status = 'published'",
    [permalink],
    (err, result) => {
      if (err || result.length === 0) {
        return res.sendStatus(404);
      }
      const blog        = result[0];
      const title       = escapeHtml(blog.title || "GenieStudio Blog");
      const description = escapeHtml(blog.metaDescription || "Read this article on GenieStudio");
      const image       = escapeHtml(blog.image || `${config.siteUrl}/media-placeholder.png`);
      const pageUrl = `${config.siteUrl}/blog/${blog.permalink.split('/').map(encodeURIComponent).join('/')}`;
      const escapedPageUrl = escapeHtml(pageUrl);

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type"        content="article" />
  <meta property="og:title"       content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image"       content="${image}" />
  <meta property="og:image:width"  content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url"         content="${escapedPageUrl}" />
  <meta property="og:site_name"   content="GenieStudio" />
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image"       content="${image}" />
  <meta http-equiv="refresh" content="0;url=${escapedPageUrl}" />
</head>
<body style="margin:0;background:#1a1a1a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;">
  <div>
    <p style="font-size:14px;color:#aaa;margin-bottom:12px;">Redirecting you to the article…</p>
    <a href="${escapedPageUrl}" style="color:#D4B49A;font-size:16px;font-weight:bold;">${title}</a>
  </div>
  <script>window.location.replace(${safeJson(pageUrl)});</script>
</body>
</html>`);
    }
  );
});

// ================= ERROR HANDLER =================
// Keeps upload failures (multer size / type rejections) as JSON so the frontend
// can show the right message instead of choking on an HTML error page.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  console.error("Request failed", { status: err.status || 500, code: err.code || "REQUEST_ERROR" });

  if (err.code === "LIMIT_FILE_SIZE")
    return res.status(413).json({ success: false, message: "Image size must be less than 5 MB." });

  if (err.code?.startsWith('LIMIT_')) return res.status(400).json({ success: false, message: 'The upload form exceeds the allowed file or field limits.' });

  if (err.message === "Only images are allowed")
    return res
      .status(415)
      .json({ success: false, message: "Please upload a JPG, JPEG, PNG, or WebP image." });

  const status = err.status >= 400 && err.status < 500 ? err.status : 500;
  res.status(status).json({ success: false, message: status < 500 ? err.message : "Server error. Please try again later." });
});

app.locals.db = db;
app.locals.ready = async () => {
  // Callbacks may enqueue column changes or seed checks; wait until the queue is stable.
  let pending;
  do { pending = initialization; await pending; } while (pending !== initialization);
  if (initializationError) throw initializationError;
};
return app;
}

if (require.main === module) {
  try {
    const config = loadConfig();
    const app = createApp({ config });
    app.locals.ready().then(() => {
      const server = app.listen(config.port, () => console.log(`Backend listening on port ${config.port}`));
      server.requestTimeout = 30000;
      server.headersTimeout = 15000;
    }).catch(() => {
      console.error('Backend database initialization failed. Check connectivity, TLS, and schema privileges.');
      app.locals.db.end();
      process.exitCode = 1;
    });
  } catch (err) {
    console.error(`Backend configuration error: ${err.message}`);
    process.exitCode = 1;
  }
}
module.exports = { createApp };

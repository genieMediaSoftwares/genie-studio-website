const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const sharp = require('sharp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createApp } = require('../server');
const { loadConfig } = require('../lib/config');
const { createStorage } = require('../lib/storageProvider');
const { validateImage } = require('../lib/imageValidation');
const { validateDownloadUrl, isPublicAddress } = require('../lib/safeDownload');

function configuration(overrides = {}) {
  return loadConfig({ DB_HOST: 'localhost', DB_USER: 'isolated-test', DB_NAME: 'isolated-test',
    DB_PASSWORD: crypto.randomUUID(), JWT_SECRET: crypto.randomBytes(32).toString('hex'), ...overrides });
}

async function harness(t, { respond = () => [], storage, getConnection, config = configuration() } = {}) {
  const queries = [];
  const db = { query(sql, params, callback) {
    queries.push(sql);
    Promise.resolve().then(() => respond(sql, params)).then(result => callback(null, result), err => callback(err));
  } };
  if (getConnection) db.getConnection = getConnection;
  const uploaded = [];
  const media = storage || {
    provider: 'local', ownsUrl: url => url.startsWith('http://localhost:5000/uploads/'),
    uploadToStorage: async (buffer, filename) => { uploaded.push({ buffer, filename }); return `http://localhost:5000/uploads/${filename}`; },
    deleteFromStorage: async () => true,
  };
  const app = createApp({ config, db, storage: media, initializeDatabase: false,
    transport: { post: async () => { throw new Error('Unexpected outbound request'); } },
    variantGenerator: async () => null });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const url = `http://127.0.0.1:${server.address().port}`;
  const token = jwt.sign({ id: 1, email: 'audit@example.invalid' }, config.jwtSecret);
  const request = (route, options = {}) => fetch(url + route, { ...options, headers: { Authorization: `Bearer ${token}`, ...options.headers } });
  return { request, url, queries, uploaded, config };
}
function authenticatedRows(sql) {
  return sql.startsWith('SELECT id FROM admins') ? [{ id: 1 }] : [];
}

test('configuration fails closed and never includes credential values in errors', () => {
  assert.throws(() => loadConfig({}), /Missing required environment variables/);
  assert.throws(() => configuration({ JWT_SECRET: 'short' }), /at least 32/);
  assert.throws(() => configuration({ NODE_ENV: 'production' }), /Production requires/);
  assert.throws(() => configuration({ R2_ACCOUNT_ID: 'partial' }), /R2 storage requires/);
  assert.throws(() => configuration({ CORS_ORIGINS: 'http://localhost:5173/path' }), /without paths/);
  assert.throws(() => configuration({ TRUST_PROXY_HOPS: 'true' }), /TRUST_PROXY_HOPS/);
});

test('admin APIs reject missing, forged, expired, and removed-account tokens', async t => {
  const h = await harness(t);
  assert.equal((await fetch(h.url + '/api/images')).status, 403);
  assert.equal((await h.request('/api/images', { headers: { Authorization: 'forged' } })).status, 401);
  const expired = jwt.sign({ id: 1, email: 'audit@example.invalid' }, h.config.jwtSecret, { expiresIn: -1 });
  assert.equal((await h.request('/api/images', { headers: { Authorization: expired } })).status, 401);
  assert.equal((await h.request('/api/images')).status, 401);
});

test('draft posts and draft share previews are not public', async t => {
  const h = await harness(t, { respond(sql) {
    if (sql.includes('FROM blogs WHERE permalink')) {
      assert.match(sql, /status = 'published'/);
      return [];
    }
    return [];
  } });
  assert.equal((await h.request('/api/blog/draft-post')).status, 404);
  assert.equal((await h.request('/share/draft-post')).status, 404);
});

test('share previews escape stored text and reject executable permalinks', async t => {
  const h = await harness(t, { respond: () => [{ title: '<script>bad()</script>', metaDescription: '" onload="bad()', permalink: 'safe-post', image: 'https://media.example.invalid/a.jpg' }] });
  const response = await h.request('/share/safe-post');
  const html = await response.text();
  assert.equal(response.status, 200);
  assert(!html.includes('<script>bad()'));
  assert(html.includes('&lt;script&gt;'));
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal((await h.request('/share/%3Cscript%3E')).status, 404);
});

test('plaintext passwords are rejected and bcrypt login works', async t => {
  const password = crypto.randomBytes(16).toString('hex');
  let stored = password;
  const h = await harness(t, { respond: () => [{ id: 1, email: 'audit@example.invalid', password: stored }] });
  const login = () => h.request('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'audit@example.invalid', password }) });
  assert.equal((await login()).status, 401);
  stored = await bcrypt.hash(password, 4);
  const response = await login();
  assert.equal(response.status, 200);
  assert((await response.json()).token);
});

test('login attempts are rate limited', async t => {
  const h = await harness(t);
  for (let i = 0; i < 20; i++) await h.request('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  const response = await h.request('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(response.status, 429);
  assert(Number(response.headers.get('retry-after')) > 0);
});

test('spoofed extensions and bytes are rejected before storage', async t => {
  const h = await harness(t, { respond: authenticatedRows });
  for (const filename of ['payload.html', 'spoof.jpg']) {
    const form = new FormData();
    form.set('image', new Blob(['<html>invalid image</html>'], { type: 'image/jpeg' }), filename);
    const response = await h.request('/api/images', { method: 'POST', body: form });
    assert.equal(response.status, 415);
  }
  assert.equal(h.uploaded.length, 0);
});

test('valid upload is decoded, registered, and assigned a generated safe name', async t => {
  const h = await harness(t, { respond: sql => sql.startsWith('INSERT INTO images') ? { insertId: 7 } : authenticatedRows(sql) });
  const bytes = await sharp({ create: { width: 24, height: 24, channels: 3, background: '#112233' } }).png().toBuffer();
  const form = new FormData();
  form.set('image', new Blob([bytes], { type: 'image/png' }), 'private-original-name.png');
  const response = await h.request('/api/images', { method: 'POST', body: form });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.image.id, 7);
  assert.equal(data.image.width, 24);
  assert.match(h.uploaded[0].filename, /^[a-f0-9-]{36}\.png$/);
});

test('oversized and corrupt images are rejected', async () => {
  await assert.rejects(validateImage({ originalname: 'broken.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('invalid') }), { status: 415 });
  const bytes = await sharp({ create: { width: 6500, height: 6500, channels: 3, background: '#000' } }).png().toBuffer();
  await assert.rejects(validateImage({ originalname: 'large.png', mimetype: 'image/png', buffer: bytes }), { status: 415 });
});

test('referenced images cannot be deleted', async t => {
  let deletion = false;
  const h = await harness(t, { respond(sql) {
    if (sql.startsWith('SELECT * FROM images')) return [{ filename: 'audit.jpg', file_url: 'http://localhost:5000/uploads/audit.jpg' }];
    if (sql.includes('FROM blogs WHERE image')) return [{ id: 2 }];
    if (sql.startsWith('DELETE')) deletion = true;
    return authenticatedRows(sql);
  } });
  assert.equal((await h.request('/api/images/1', { method: 'DELETE' })).status, 409);
  assert.equal(deletion, false);
});

test('storage deletion errors preserve registry rows and hide internal errors', async t => {
  let deletion = false;
  const h = await harness(t, { respond(sql) {
    if (sql.startsWith('SELECT * FROM images')) return [{ filename: 'audit.jpg', file_url: 'http://localhost:5000/uploads/audit.jpg' }];
    if (sql.startsWith('DELETE')) deletion = true;
    return authenticatedRows(sql);
  }, storage: { provider: 'local', ownsUrl: () => true, uploadToStorage: async () => {}, deleteFromStorage: async () => { throw new Error('internal storage details'); } } });
  const response = await h.request('/api/images/1', { method: 'DELETE' });
  assert.equal(response.status, 500);
  assert(!(await response.text()).includes('internal storage details'));
  assert.equal(deletion, false);
});

test('local storage never truncates or overwrites originals and rejects path traversal', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'genie-storage-test-'));
  const config = { ...configuration(), uploadDir: dir };
  const storage = createStorage(config);
  t.after(async () => { await fs.unlink(path.join(dir, 'audit.png')); await fs.rmdir(dir); });
  await storage.uploadToStorage(Buffer.from('first'), 'audit.png', 'image/png');
  await assert.rejects(storage.uploadToStorage(Buffer.from('different'), 'audit.png', 'image/png'));
  assert.equal(await fs.readFile(path.join(dir, 'audit.png'), 'utf8'), 'first');
  await assert.rejects(storage.uploadToStorage(Buffer.from('x'), '../audit.png'));
  await assert.rejects(storage.deleteFromStorage('audit.png', 'https://external.example.invalid/audit.png'), { status: 409 });
});

test('backfill refuses arbitrary hosts, spoofed host text, redirects-to-private candidates, and non-HTTPS URLs', () => {
  const allowed = ['https://media.example.invalid'];
  assert.equal(validateDownloadUrl('https://media.example.invalid/uploads/a.jpg', allowed), 'https://media.example.invalid/uploads/a.jpg');
  for (const url of ['http://127.0.0.1/?https://media.example.invalid/uploads/a.jpg', 'https://media.example.invalid.evil.test/uploads/a.jpg', 'https://user:pass@media.example.invalid/uploads/a.jpg', 'https://media.example.invalid/uploads/../secret', 'https://media.example.invalid/uploads/a.jpg?token=x']) {
    assert.throws(() => validateDownloadUrl(url, allowed));
  }
  for (const address of ['127.0.0.1', '10.1.2.3', '169.254.169.254', '::1', '::ffff:127.0.0.1', 'fe80::1']) assert.equal(isPublicAddress(address), false);
  assert.equal(isPublicAddress('8.8.8.8'), true);
});

test('CORS denies unapproved origins and unavailable contact delivery never reports success', async t => {
  const h = await harness(t);
  assert.equal((await h.request('/api/blogs', { headers: { Origin: 'https://unapproved.example.invalid' } })).status, 403);
  const response = await h.request('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Audit', email: 'audit@example.invalid', phone: '1234567890', service: 'Podcast', bookingDate: '2027-01-01', message: '' }) });
  assert.equal(response.status, 503);
  assert.equal((await response.json()).success, false);
});

test('site image slots use canonical metadata and authenticated assignments can create missing slots', async t => {
  let assigned;
  const h = await harness(t, { respond(sql, params) {
    if (sql.startsWith('INSERT INTO site_sections')) {
      assigned = { id: 4, section_key: params[1], section_name: params[2], image_url: params[4] };
      return { affectedRows: 1 };
    }
    if (sql.startsWith('SELECT * FROM site_sections WHERE section_key')) return [assigned];
    return authenticatedRows(sql);
  } });
  const initial = await (await h.request('/api/site-sections?category=homepage')).json();
  assert(initial.sections.length > 0);
  assert(initial.sections.every(slot => slot.category === 'homepage' && slot.section_heading));
  assert(initial.map.home_hero_slide_1.default_image_url);
  const response = await h.request('/api/site-sections/home_hero_slide_1', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_url: 'https://media.example.invalid/real.png', alt_text: 'Studio' }) });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).section.image_url, 'https://media.example.invalid/real.png');
  assert.equal((await h.request('/api/site-sections/not-a-slot', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image_url: 'https://media.example.invalid/real.png' }) })).status, 404);
});

test('bundled company images cannot be physically deleted even without database references', async t => {
  const slot = require('../data/siteSections.json')[0];
  const h = await harness(t, { respond: sql => sql.startsWith('SELECT * FROM images')
    ? [{ filename: 'company.jpg', file_url: slot.image_url }] : authenticatedRows(sql) });
  const response = await h.request('/api/images/1', { method: 'DELETE' });
  assert.equal(response.status, 409);
  assert((await response.json()).message.includes('website source'));
});

test('configured R2 upload failure does not silently send media to another provider', async () => {
  const config = { ...configuration(), storageProvider: 'r2', r2: { publicDomain: 'https://media.example.invalid', bucket: 'isolated-test' } };
  let unexpectedFallback = false;
  const storage = createStorage(config, { client: { send: async () => { throw new Error('R2 unavailable'); } },
    transport: { post: async () => { unexpectedFallback = true; } } });
  await assert.rejects(storage.uploadToStorage(Buffer.from('test'), 'audit.png', 'image/png'), /R2 unavailable/);
  assert.equal(unexpectedFallback, false);
});

test('startup waits for queued schema checks without parallel DDL or real database access', async () => {
  let active = 0, maximum = 0, total = 0;
  const db = { query(sql, params, callback) {
    active++; total++; maximum = Math.max(maximum, active);
    setImmediate(() => {
      active--;
      callback(null, /COUNT\(\*\)/.test(sql) ? [{ n: 1 }] : []);
    });
  } };
  const app = createApp({ config: configuration(), db });
  await app.locals.ready();
  assert(total >= 10);
  assert.equal(active, 0);
  assert.equal(maximum, 1);
});

test('database initialization failures prevent startup readiness', async () => {
  let calls = 0;
  const db = { query(sql, params, callback) { calls++; setImmediate(() => callback(new Error('isolated failure'))); } };
  const app = createApp({ config: configuration(), db });
  await assert.rejects(app.locals.ready(), /Database initialization failed/);
  assert.equal(calls, 1);
});

for (const failInsert of [true, false]) {
  test(`gallery replacement ${failInsert ? 'rolls back failed inserts without losing existing data' : 'commits before reporting success'}`, async t => {
    let rows = [{ image_url: 'https://media.example.invalid/existing.png' }], snapshot, committed = false, released = false;
    const connection = {
      beginTransaction(callback) { snapshot = [...rows]; callback(); },
      commit(callback) { committed = true; callback(); },
      rollback(callback) { rows = snapshot; callback(); },
      release() { released = true; },
      query(sql, params, callback) {
        if (sql.startsWith('DELETE')) { rows = []; callback(null, {}); }
        else if (sql.startsWith('SELECT COALESCE')) callback(null, [{ maxOrder: -1 }]);
        else if (sql.startsWith('INSERT')) {
          if (failInsert) callback(new Error('Isolated insert failure'));
          else { rows = params[0].map(row => ({ image_url: row[0] })); callback(null, { affectedRows: rows.length }); }
        } else callback(null, rows);
      },
    };
    const h = await harness(t, { respond: authenticatedRows, getConnection: callback => callback(null, connection) });
    const response = await h.request('/api/gallery/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'replace', urls: ['https://media.example.invalid/replacement.png'] }) });
    assert.equal(response.status, failInsert ? 500 : 200);
    assert.equal(committed, !failInsert);
    assert.equal(released, true);
    assert.equal(rows[0].image_url, `https://media.example.invalid/${failInsert ? 'existing' : 'replacement'}.png`);
  });
}

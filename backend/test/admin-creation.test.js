const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AdminCreationError, validateCreationInput, inspectAdminDatabase, createAdmin } = require('../lib/adminCreation');
const { parseArguments, confirmationText, verifyLiveLogin } = require('../scripts/create-admin');
const { createApp } = require('../app');
const { loadConfig } = require('../lib/config');

const secret = () => `Aa1!${crypto.randomBytes(24).toString('base64url')}`;
const input = (overrides = {}) => { const password = secret(); return { email: 'new@example.invalid', password, confirmation: password, ...overrides }; };
const identity = { database_name: 'isolated_test', server_hostname: 'isolated_server', database_account: 'test@localhost' };
const schema = () => [
  { name: 'id', type: 'int', nullable: 'NO', extra: 'auto_increment', has_default: 0 },
  { name: 'email', type: 'varchar', max_length: 255, nullable: 'NO', extra: '', has_default: 0 },
  { name: 'password', type: 'varchar', max_length: 255, nullable: 'NO', extra: '', has_default: 0 },
  { name: 'createdAt', type: 'bigint', nullable: 'YES', extra: '', has_default: 0 },
];

function database(options = {}) {
  let records = [{ id: 1, email: 'old@example.invalid', password: secret(), label: 'Existing account' }], snapshot;
  const commands = [];
  const db = {
    commands, get records() { return records; },
    async beginTransaction() { commands.push('BEGIN'); snapshot = structuredClone(records); },
    async commit() { commands.push('COMMIT'); },
    async rollback() { commands.push('ROLLBACK'); records = snapshot; },
    async execute(sql, params = []) {
      commands.push(sql);
      if (sql.startsWith('SELECT DATABASE()')) return [[options.identity || identity]];
      if (sql.includes('information_schema.TABLES')) return [[{ engine: options.engine || 'InnoDB' }]];
      if (sql.includes('information_schema.COLUMNS')) return [options.columns || schema()];
      if (sql.includes('information_schema.STATISTICS')) return [[
        { index_name: 'PRIMARY', non_unique: 0, column_name: 'id', sub_part: null },
        ...(options.unique === false ? [] : [{ index_name: 'email', non_unique: 0, column_name: 'email', sub_part: options.prefix ? 10 : null }]),
        ...(options.composite ? [{ index_name: 'email', non_unique: 0, column_name: 'id', sub_part: null }] : []),
      ]];
      if (sql.includes('information_schema.TRIGGERS')) return [options.triggers ? [{ name: 'custom_trigger' }] : []];
      if (sql.includes('information_schema.USER_PRIVILEGES')) return [options.noTriggerPrivilege ? [] : [{ PRIVILEGE_TYPE: 'TRIGGER' }]];
      if (sql.startsWith('SELECT id FROM admins WHERE email')) return [records.filter(r => r.email.toLowerCase() === params[0].toLowerCase()).map(({ id }) => ({ id }))];
      if (sql.startsWith('INSERT INTO admins')) {
        if (options.insertError) throw Object.assign(new Error('private database details'), { code: options.insertError });
        const [email, password] = params;
        records.push({ id: 2, email, password: options.truncate ? password.slice(0, 20) : password });
        return [{ insertId: 2, affectedRows: options.affectedRows ?? 1, warningStatus: options.warningStatus ?? 0 }];
      }
      if (sql.startsWith('SELECT id, email, password FROM admins WHERE id')) return [records.filter(r => r.id === params[0] && r.email === params[1])];
      throw new Error('Unexpected isolated query');
    },
  };
  return db;
}

test('creation validates email, strong password, confirmation and bcrypt length before database access', async () => {
  for (const args of [input({ email: '' }), input({ email: 'bad\x1b@example.invalid' }), input({ password: 'short' }),
    input({ password: 'lowercaseonlypassword' }), input({ password: 'Aa1!' + 'x'.repeat(69) }), input({ confirmation: secret() })]) {
    const db = database();
    await assert.rejects(createAdmin(db, args, identity), AdminCreationError);
    assert.equal(db.commands.length, 0);
  }
  const password = 'Aa1!' + '\u00e9'.repeat(34);
  assert.equal(validateCreationInput(input({ email: ' new@example.invalid ', password, confirmation: password })), 'new@example.invalid');
  await assert.rejects(createAdmin(database(), input()), { code: 'APPROVAL_REQUIRED' });
});

test('read-only inspection returns schema and identity without reading credentials or content', async () => {
  const db = database();
  const report = await inspectAdminDatabase(db);
  assert.deepEqual(report.identity, identity);
  assert.deepEqual(report.problems, []);
  assert(db.commands.every(sql => sql.startsWith('SELECT ')));
  assert(!db.commands.some(sql => /FROM admins|FROM blogs|FROM images|FROM gallery|FROM portfolio/i.test(sql)));
  assert(!JSON.stringify(report).includes(db.records[0].password));
});

test('creation inserts one bcrypt cost-12 account while preserving every existing record', async () => {
  const db = database(), original = structuredClone(db.records), args = input();
  assert.deepEqual(await createAdmin(db, args, identity), { id: 2, email: args.email });
  assert.deepEqual(db.records.slice(0, 1), original);
  assert.equal(db.records.length, 2);
  assert.equal(bcrypt.getRounds(db.records[1].password), 12);
  assert(await bcrypt.compare(args.password, db.records[1].password));
  assert.deepEqual(db.commands.filter(sql => /^(INSERT|UPDATE|DELETE|ALTER|CREATE|DROP|TRUNCATE)/i.test(sql)), ['INSERT INTO admins (email, password) VALUES (?, ?)']);
  assert(db.commands.includes('COMMIT'));
  await assert.rejects(createAdmin(db, args, identity), { code: 'EMAIL_EXISTS' });
  assert.equal(db.records.length, 2);
});

test('creation refuses unsafe schemas, triggers, duplicate email and changed database identity', async () => {
  const cases = [
    { options: { engine: 'MyISAM' } }, { options: { unique: false } }, { options: { prefix: true } }, { options: { composite: true } },
    { options: { triggers: true } }, { options: { noTriggerPrivilege: true } }, { options: { columns: schema().map(c => c.name === 'password' ? { ...c, max_length: 20 } : c) } },
    { options: { columns: [...schema(), { name: 'custom', type: 'varchar', nullable: 'NO', has_default: 0, extra: '' }] } },
    { options: { identity: { ...identity, database_name: 'unexpected' } }, code: 'TARGET_CHANGED' },
    { options: {}, args: input({ email: 'OLD@example.invalid' }), code: 'EMAIL_EXISTS' },
  ];
  for (const item of cases) {
    const db = database(item.options), original = structuredClone(db.records);
    await assert.rejects(createAdmin(db, item.args || input(), identity), { code: item.code || 'SCHEMA_REVIEW_REQUIRED' });
    assert.deepEqual(db.records, original);
    assert(db.commands.includes('ROLLBACK'));
    assert(!db.commands.some(sql => sql.startsWith('INSERT')));
  }
});

test('creation rolls back truncation, warnings, unexpected row counts and concurrent duplicates without leaking errors', async () => {
  for (const options of [{ truncate: true }, { warningStatus: 1 }, { affectedRows: 0 }, { insertError: 'ER_DUP_ENTRY' }, { insertError: 'OTHER' }]) {
    const db = database(options), original = structuredClone(db.records);
    await assert.rejects(createAdmin(db, input(), identity), error => error instanceof AdminCreationError && !error.message.includes('private database details'));
    assert.deepEqual(db.records, original);
    assert(db.commands.includes('ROLLBACK'));
    assert(!db.commands.includes('COMMIT'));
  }
});

test('CLI defaults to read-only and rejects secret arguments, bypass flags and noninteractive creation', () => {
  assert.equal(parseArguments([]), 'check');
  assert.equal(parseArguments(['--verify-login']), 'verify-login');
  for (const args of [['--password', secret()], ['--email', 'new@example.invalid'], ['--create', '--yes']]) {
    assert.throws(() => parseArguments(args), { code: 'USAGE' });
  }
  assert.equal(confirmationText('new@example.invalid', 'isolated_test'), 'CREATE new@example.invalid IN isolated_test');
  const result = spawnSync(process.execPath, [path.resolve(__dirname, '../scripts/create-admin.js'), '--create'], { encoding: 'utf8', input: secret() });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /interactive terminal/);
});

test('live verification fixes HTTPS destination, blocks redirects and hides tokens, response content and network errors', async () => {
  const args = input(), calls = [];
  const transport = async (url, options) => {
    calls.push({ url, options });
    return url.endsWith('/api/login') ? new Response(JSON.stringify({ success: true, token: secret() })) : new Response('[]');
  };
  assert.equal(await verifyLiveLogin(args.email, args.password, transport), undefined);
  assert.deepEqual(calls.map(c => c.url), ['https://api-studio.geniemedia.in/api/login', 'https://api-studio.geniemedia.in/api/admin/blogs']);
  assert(calls.every(c => c.options.redirect === 'error' && c.options.signal));
  assert.equal(calls[1].options.method, undefined);
  await assert.rejects(verifyLiveLogin(args.email, args.password, async () => new Response('{}', { status: 401 })), { code: 'LOGIN_FAILED' });
  await assert.rejects(verifyLiveLogin(args.email, args.password, async () => { throw new Error(args.password); }), error => error.code === 'VERIFICATION_FAILED' && !error.message.includes(args.password));
  await assert.rejects(verifyLiveLogin(args.email, args.password, async url => url.endsWith('/api/login') ? new Response(JSON.stringify({ success: true, token: secret() })) : new Response('{}')), { code: 'ACCESS_FAILED' });
});

test('new account authenticates through the actual login route and accesses protected data; old account is preserved', async t => {
  const db = database(), original = structuredClone(db.records), args = input();
  const config = loadConfig({ DB_HOST: 'localhost', DB_USER: 'isolated', DB_PASSWORD: secret(), DB_NAME: 'isolated', JWT_SECRET: secret() });
  const app = createApp({ config, initializeDatabase: false, db: { query(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    const rows = sql.startsWith('SELECT id, email, password FROM admins') ? db.records.filter(r => r.email === params[0])
      : sql.startsWith('SELECT id FROM admins') ? db.records.filter(r => r.id === params[0] && r.email === params[1]).map(({ id }) => ({ id })) : [];
    callback(null, rows);
  } } });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const login = (email, password) => fetch(origin + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  assert.equal((await login(args.email, args.password)).status, 401);
  await createAdmin(db, args, identity);
  const response = await login(args.email, args.password);
  assert.equal(response.status, 200);
  const { token } = await response.json();
  const claims = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
  assert.equal(claims.id, 2);
  assert.equal(claims.email, args.email);
  assert.equal((await fetch(origin + '/api/admin/blogs', { headers: { Authorization: `Bearer ${token}` } })).status, 200);
  await verifyLiveLogin(args.email, args.password, (url, options) => fetch(origin + new URL(url).pathname, options));
  assert.equal((await login(args.email, secret())).status, 401);
  assert.equal((await login(original[0].email, original[0].password)).status, 401);
  assert.deepEqual(db.records[0], original[0]);
});

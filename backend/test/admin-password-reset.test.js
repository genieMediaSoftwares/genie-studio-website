const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { PassThrough, Writable } = require('node:stream');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AdminResetError, validateResetInput, resetAdminPassword } = require('../lib/adminPasswordReset');
const { parseArguments, passwordPrompt } = require('../scripts/reset-admin-password');
const { loadConfig, loadDatabaseConfig } = require('../lib/config');
const { createApp } = require('../app');

const secret = () => crypto.randomBytes(24).toString('base64url');
const input = (overrides = {}) => {
  const password = secret();
  return { email: 'admin@example.invalid', password, confirmation: password, ...overrides };
};

function database(initial, { engine = 'InnoDB', columnSize = 255, truncate = false, failUpdate = false, affectedRows = 1 } = {}) {
  let records = structuredClone(initial), snapshot;
  const commands = [];
  return {
    get records() { return records; }, commands,
    async beginTransaction() { commands.push('BEGIN'); snapshot = structuredClone(records); },
    async commit() { commands.push('COMMIT'); },
    async rollback() { commands.push('ROLLBACK'); records = snapshot; },
    async execute(sql, params = []) {
      commands.push(sql);
      if (sql.includes('information_schema.TABLES')) return [[{ engine }]];
      if (sql.includes('information_schema.COLUMNS')) return [[{ type: 'varchar', max_length: columnSize }]];
      if (sql.startsWith('SELECT id, email FROM admins')) {
        return [records.filter(row => row.email === params[0]).map(({ id, email }) => ({ id, email }))];
      }
      if (sql.startsWith('UPDATE admins')) {
        if (failUpdate) throw new Error('Private database error details must not escape');
        const [hash, id, email] = params;
        for (const row of records.filter(row => row.id === id && row.email === email)) row.password = truncate ? hash.slice(0, 20) : hash;
        return [{ affectedRows }];
      }
      if (sql.startsWith('SELECT password FROM admins')) {
        return [records.filter(row => row.id === params[0] && row.email === params[1]).map(({ password }) => ({ password }))];
      }
      throw new Error('Unexpected query in isolated reset test');
    },
  };
}

test('reset validates confirmation and the bcrypt byte limit before database access', async () => {
  for (const args of [input({ password: 'short' }), input({ confirmation: secret() }), input({ password: 'é'.repeat(37), confirmation: 'é'.repeat(37) }), input({ email: '' })]) {
    let touched = false;
    const db = { beginTransaction() { touched = true; } };
    await assert.rejects(resetAdminPassword(db, args), AdminResetError);
    assert.equal(touched, false);
  }
  const password = 'é'.repeat(36);
  assert.equal(validateResetInput(input({ email: ' admin@example.invalid ', password, confirmation: password })), 'admin@example.invalid');
});

test('reset stores bcrypt cost 12 on exactly one account and preserves every other field and record', async () => {
  const original = [{ id: 1, email: 'admin@example.invalid', password: secret(), label: 'Existing administrator' },
    { id: 2, email: 'other@example.invalid', password: secret(), label: 'Other account' }];
  const db = database(original), args = input();
  assert.deepEqual(await resetAdminPassword(db, args), { id: 1 });
  const stored = db.records[0].password;
  assert.equal(bcrypt.getRounds(stored), 12);
  assert(await bcrypt.compare(args.password, stored));
  assert.notEqual(stored, args.password);
  assert.deepEqual({ ...db.records[0], password: original[0].password }, original[0]);
  assert.deepEqual(db.records[1], original[1]);
  assert.equal(db.records.length, original.length);
  assert(db.commands.includes('COMMIT'));
  assert(!db.commands.some(sql => /^(INSERT|DELETE|ALTER|DROP|TRUNCATE)/i.test(sql)));
});

test('reset refuses missing or ambiguous accounts without creating or changing records', async () => {
  for (const rows of [[], [{ id: 1, email: 'admin@example.invalid', password: secret() }, { id: 2, email: 'admin@example.invalid', password: secret() }]]) {
    const db = database(rows);
    await assert.rejects(resetAdminPassword(db, input()), { code: 'ACCOUNT_NOT_UNIQUE' });
    assert.deepEqual(db.records, rows);
    assert(!db.commands.some(sql => sql.startsWith('UPDATE')));
    assert(db.commands.includes('ROLLBACK'));
  }
});

test('reset refuses nontransactional tables and undersized columns before updates', async () => {
  for (const options of [{ engine: 'MyISAM' }, { columnSize: 20 }]) {
    const rows = [{ id: 1, email: 'admin@example.invalid', password: secret() }], db = database(rows, options);
    await assert.rejects(resetAdminPassword(db, input()), AdminResetError);
    assert.deepEqual(db.records, rows);
    assert(!db.commands.includes('BEGIN'));
    assert(!db.commands.some(sql => sql.startsWith('UPDATE')));
  }
});

test('reset rolls back truncation, failed updates, and unexpected row counts', async () => {
  for (const options of [{ truncate: true }, { failUpdate: true }, { affectedRows: 0 }]) {
    const rows = [{ id: 1, email: 'admin@example.invalid', password: secret() }], db = database(rows, options);
    await assert.rejects(resetAdminPassword(db, input()), error => error instanceof AdminResetError && !error.message.includes('Private database error'));
    assert.deepEqual(db.records, rows);
    assert(db.commands.includes('ROLLBACK'));
    assert(!db.commands.includes('COMMIT'));
  }
});

test('CLI rejects password arguments and noninteractive input without connecting to a database', () => {
  assert.deepEqual(parseArguments(['--help']), { help: true });
  assert.throws(() => parseArguments(['--email', 'admin@example.invalid', '--password', secret()]), { code: 'USAGE' });
  const result = spawnSync(process.execPath, [path.resolve(__dirname, '../scripts/reset-admin-password.js'), '--email', 'admin@example.invalid'], { encoding: 'utf8', input: secret() });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /interactive terminal/);
});

test('terminal prompts do not echo password characters, redraws, or confirmations', async () => {
  const terminalInput = new PassThrough();
  terminalInput.isTTY = true;
  terminalInput.setRawMode = () => {};
  let displayed = '';
  const terminalOutput = new Writable({ write(chunk, _encoding, done) { displayed += chunk.toString(); done(); } });
  terminalOutput.isTTY = true;
  const prompt = passwordPrompt(terminalInput, terminalOutput);
  const password = secret();
  try {
    const first = prompt.ask('New password: ');
    terminalInput.write(password + '\x1b[D\x1b[C\r');
    assert.equal(await first, password);
    const second = prompt.ask('Confirm: ');
    terminalInput.write(password + '\r');
    assert.equal(await second, password);
    assert(!displayed.includes(password));
    assert.equal(displayed, 'New password: \nConfirm: \n');
  } finally { prompt.close(); terminalInput.destroy(); }
});

test('database-only reset configuration works without a JWT secret and preserves TLS verification', () => {
  const env = { NODE_ENV: 'production', DB_HOST: 'database.example.invalid', DB_USER: 'isolated-test', DB_PASSWORD: secret(), DB_NAME: 'isolated-test' };
  assert.throws(() => loadDatabaseConfig(env), /DB_SSL=true/);
  const config = loadDatabaseConfig({ ...env, DB_SSL: 'true' });
  assert.equal(config.ssl.rejectUnauthorized, true);
  assert(config.password === env.DB_PASSWORD);
});

test('cancelling hidden password entry aborts without echoing input', async () => {
  const terminalInput = new PassThrough();
  terminalInput.isTTY = true;
  terminalInput.setRawMode = () => {};
  let displayed = '';
  const terminalOutput = new Writable({ write(chunk, _encoding, done) { displayed += chunk.toString(); done(); } });
  terminalOutput.isTTY = true;
  const prompt = passwordPrompt(terminalInput, terminalOutput);
  try {
    const answer = prompt.ask('New password: ');
    const rejected = assert.rejects(answer, { code: 'CANCELLED' });
    terminalInput.write(secret() + '\x03');
    await rejected;
    assert.equal(displayed, 'New password: ');
  } finally { prompt.close(); terminalInput.destroy(); }
});

test('local login rejects plaintext before reset, accepts the new password afterward, and rejects old/wrong passwords', async t => {
  const oldPassword = secret(), args = input();
  const db = database([{ id: 1, email: args.email, password: oldPassword, label: 'Original record' }]);
  const config = loadConfig({ DB_HOST: 'localhost', DB_USER: 'isolated-test', DB_PASSWORD: secret(), DB_NAME: 'isolated-test', JWT_SECRET: secret() });
  const app = createApp({ config, initializeDatabase: false, db: {
    query(sql, params, callback) {
      if (typeof params === 'function') { callback = params; params = []; }
      const rows = sql.startsWith('SELECT id, email, password FROM admins') ? db.records.filter(row => row.email === params[0])
        : sql.startsWith('SELECT id FROM admins') ? db.records.filter(row => row.id === params[0] && row.email === params[1]).map(({ id }) => ({ id })) : [];
      callback(null, rows);
    },
  } });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const login = password => fetch(origin + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: args.email, password }) });
  assert.equal((await login(oldPassword)).status, 401);
  await resetAdminPassword(db, args);
  const response = await login(args.password);
  assert.equal(response.status, 200);
  const { token } = await response.json();
  const claims = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
  assert.equal(claims.id, 1);
  assert.equal(claims.email, args.email);
  assert.equal((await fetch(origin + '/api/admin/blogs', { headers: { Authorization: `Bearer ${token}` } })).status, 200);
  assert.equal((await login(oldPassword)).status, 401);
  assert.equal((await login(secret())).status, 401);
});

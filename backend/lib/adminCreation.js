const bcrypt = require('bcrypt');

class AdminCreationError extends Error {
  constructor(code, message) { super(message); this.name = 'AdminCreationError'; this.code = code; }
}

function validateEmail(email) {
  if (typeof email !== 'string' || email.trim().length > 255 ||
      !/^[\x21-\x7e]+$/.test(email.trim()) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new AdminCreationError('INVALID_EMAIL', 'Enter a valid administrator email, up to 255 characters.');
  }
  return email.trim();
}

function validateCreationInput({ email, password, confirmation } = {}) {
  const normalizedEmail = validateEmail(email);
  const classes = typeof password === 'string' ? [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9\s]/].filter(re => re.test(password)).length : 0;
  if (typeof password !== 'string' || [...password].length < 12 || Buffer.byteLength(password, 'utf8') > 72 ||
      /[\x00-\x1f\x7f]/.test(password) || classes < 3) {
    throw new AdminCreationError('INVALID_PASSWORD', 'Use at least 12 characters, at most 72 UTF-8 bytes, and at least three of: lowercase, uppercase, numbers, symbols.');
  }
  if (confirmation !== password) throw new AdminCreationError('CONFIRMATION_MISMATCH', 'The passwords do not match.');
  return normalizedEmail;
}

// Metadata only: never selects passwords, hashes, or website content.
async function inspectAdminDatabase(connection) {
  const [[identity]] = await connection.execute('SELECT DATABASE() AS database_name, @@hostname AS server_hostname, CURRENT_USER() AS database_account');
  const [tables] = await connection.execute("SELECT ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins'");
  const [columns] = await connection.execute("SELECT COLUMN_NAME AS name, DATA_TYPE AS type, CHARACTER_MAXIMUM_LENGTH AS max_length, IS_NULLABLE AS nullable, EXTRA AS extra, (COLUMN_DEFAULT IS NOT NULL) AS has_default FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins' ORDER BY ORDINAL_POSITION");
  const [indexes] = await connection.execute("SELECT INDEX_NAME AS index_name, NON_UNIQUE AS non_unique, COLUMN_NAME AS column_name, SUB_PART AS sub_part FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins' ORDER BY INDEX_NAME, SEQ_IN_INDEX");
  // TRIGGERS metadata hides triggers from users without TRIGGER privileges. Refuse
  // that blind spot instead of assuming an empty result proves there are none.
  const account = identity?.database_account || '';
  const separator = account.lastIndexOf('@');
  const grantee = [account.slice(0, separator), account.slice(separator + 1)].map(value => `'${value.replace(/'/g, "''")}'`).join('@');
  const [triggerPrivileges] = await connection.execute("SELECT PRIVILEGE_TYPE FROM information_schema.USER_PRIVILEGES WHERE GRANTEE = ? AND PRIVILEGE_TYPE = 'TRIGGER' UNION ALL SELECT PRIVILEGE_TYPE FROM information_schema.SCHEMA_PRIVILEGES WHERE GRANTEE = ? AND TABLE_SCHEMA = DATABASE() AND PRIVILEGE_TYPE = 'TRIGGER' UNION ALL SELECT PRIVILEGE_TYPE FROM information_schema.TABLE_PRIVILEGES WHERE GRANTEE = ? AND TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins' AND PRIVILEGE_TYPE = 'TRIGGER'", [grantee, grantee, grantee]);
  const [triggers] = await connection.execute("SELECT TRIGGER_NAME AS name FROM information_schema.TRIGGERS WHERE EVENT_OBJECT_SCHEMA = DATABASE() AND EVENT_OBJECT_TABLE = 'admins'");
  const problems = [];
  if (!identity?.database_name) problems.push('No database is selected.');
  if (tables.length !== 1 || tables[0].engine?.toUpperCase() !== 'INNODB') problems.push('admins must exist and use InnoDB.');
  const id = columns.find(c => c.name === 'id');
  const primary = indexes.filter(i => i.index_name === 'PRIMARY');
  if (!id || !['int', 'bigint', 'smallint', 'mediumint', 'tinyint'].includes(id.type?.toLowerCase()) ||
      !/auto_increment/i.test(id.extra) || primary.length !== 1 || primary[0].column_name !== 'id') {
    problems.push('admins.id must be an auto-increment integer primary key.');
  }
  const email = columns.find(c => c.name === 'email');
  if (!email || !['char', 'varchar'].includes(email.type?.toLowerCase()) || email.nullable !== 'NO') problems.push('admins.email must be a required char/varchar column.');
  const uniqueEmail = indexes.some(i => Number(i.non_unique) === 0 && i.column_name === 'email' && i.sub_part == null &&
    indexes.filter(other => other.index_name === i.index_name).length === 1);
  if (!uniqueEmail) problems.push('admins.email needs a full-column unique index; no index will be added automatically.');
  const password = columns.find(c => c.name === 'password');
  if (!password || !['char', 'varchar', 'tinytext', 'text', 'mediumtext', 'longtext'].includes(password.type?.toLowerCase()) || Number(password.max_length) < 60) {
    problems.push('admins.password must hold a bcrypt hash of at least 60 characters.');
  }
  if (columns.some(c => !['id', 'email', 'password'].includes(c.name) && c.nullable === 'NO' && !Number(c.has_default) && !/generated/i.test(c.extra))) {
    problems.push('Additional required columns need manual review before inserting an admin.');
  }
  if (triggers.length) problems.push('admins has triggers; review their effects before creating an account.');
  if (!triggerPrivileges.length) problems.push('Cannot prove trigger visibility for this database user; ask the database administrator to inspect with an account having direct TRIGGER privilege.');
  return { identity, engine: tables[0]?.engine || null, columns, uniqueEmail, triggerCount: triggers.length, problems };
}

function requireCompatible(report) {
  if (report.problems.length) throw new AdminCreationError('SCHEMA_REVIEW_REQUIRED', report.problems.join(' '));
}

// One INSERT into admins, no migrations, server imports, updates, deletes, or content writes.
async function createAdmin(connection, input, approvedIdentity) {
  const email = validateCreationInput(input);
  if (!approvedIdentity?.database_name || !approvedIdentity.server_hostname || !approvedIdentity.database_account) {
    throw new AdminCreationError('APPROVAL_REQUIRED', 'Review and confirm the database identity before creating an administrator.');
  }
  const hash = await bcrypt.hash(input.password, 12);
  let inTransaction = false;
  try {
    await connection.beginTransaction();
    inTransaction = true;
    const report = await inspectAdminDatabase(connection);
    requireCompatible(report);
    if (['database_name', 'server_hostname', 'database_account'].some(key => report.identity[key] !== approvedIdentity[key])) {
      throw new AdminCreationError('TARGET_CHANGED', 'Database identity changed after approval. No account was created.');
    }
    if (email.length > Number(report.columns.find(c => c.name === 'email').max_length)) {
      throw new AdminCreationError('EMAIL_TOO_LONG', 'The email does not fit the existing column. No schema changes were made.');
    }
    const [existing] = await connection.execute('SELECT id FROM admins WHERE email = ? LIMIT 1', [email]);
    if (existing.length) throw new AdminCreationError('EMAIL_EXISTS', 'An administrator already uses that email. Choose a different email; no account was changed.');
    const [result] = await connection.execute('INSERT INTO admins (email, password) VALUES (?, ?)', [email, hash]);
    if (result.affectedRows !== 1 || !Number.isSafeInteger(result.insertId) || result.insertId < 1 || Number(result.warningStatus) !== 0) {
      throw new AdminCreationError('INSERT_NOT_VERIFIED', 'The insert could not be verified without warnings.');
    }
    const [saved] = await connection.execute('SELECT id, email, password FROM admins WHERE id = ? AND email = ?', [result.insertId, email]);
    if (saved.length !== 1 || saved[0].email !== email || saved[0].password !== hash || !(await bcrypt.compare(input.password, saved[0].password))) {
      throw new AdminCreationError('HASH_NOT_STORED', 'The database did not preserve the new account and bcrypt hash exactly.');
    }
    await connection.commit();
    inTransaction = false;
    return { id: result.insertId, email };
  } catch (error) {
    if (inTransaction) { try { await connection.rollback(); } catch { /* Caller closes connection. */ } }
    if (error instanceof AdminCreationError) throw error;
    if (error.code === 'ER_DUP_ENTRY') throw new AdminCreationError('EMAIL_EXISTS', 'Duplicate account detected. No existing account was changed.');
    throw new AdminCreationError('DATABASE_ERROR', 'Creation failed or the commit outcome is uncertain. Check the selected admins table before retrying. Private database errors were suppressed.');
  }
}

module.exports = { AdminCreationError, validateEmail, validateCreationInput, inspectAdminDatabase, requireCompatible, createAdmin };

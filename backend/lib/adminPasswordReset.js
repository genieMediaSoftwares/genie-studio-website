const bcrypt = require('bcrypt');

class AdminResetError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'AdminResetError';
    this.code = code;
  }
}

function validateResetInput({ email, password, confirmation } = {}) {
  if (typeof email !== 'string' || !email.trim() || email.trim().length > 255 || /[\r\n\0]/.test(email)) {
    throw new AdminResetError('INVALID_EMAIL', 'Specify the existing administrator email.');
  }
  if (typeof password !== 'string' || !password.trim() || [...password].length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new AdminResetError('INVALID_PASSWORD', 'Use a new password of at least 12 characters and at most 72 UTF-8 bytes.');
  }
  if (confirmation !== password) {
    throw new AdminResetError('CONFIRMATION_MISMATCH', 'The new passwords do not match.');
  }
  return email.trim();
}

// Privileged maintenance operation: no public reset endpoint, inserts, deletes, or schema changes.
async function resetAdminPassword(connection, input) {
  const email = validateResetInput(input);
  const hash = await bcrypt.hash(input.password, 12);
  let inTransaction = false;
  try {
    const [tables] = await connection.execute("SELECT ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins'");
    if (tables.length !== 1 || tables[0].engine?.toUpperCase() !== 'INNODB') {
      throw new AdminResetError('TRANSACTIONS_REQUIRED', 'The admins table must use InnoDB for a safe transactional reset. No schema changes were made.');
    }
    const [columns] = await connection.execute("SELECT DATA_TYPE AS type, CHARACTER_MAXIMUM_LENGTH AS max_length FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'password'");
    if (columns.length !== 1 || !['char', 'varchar', 'tinytext', 'text', 'mediumtext', 'longtext'].includes(columns[0].type?.toLowerCase()) || Number(columns[0].max_length) < 60) {
      throw new AdminResetError('HASH_COLUMN_TOO_SMALL', 'admins.password must be a text column that can store at least 60 characters. No schema changes were made.');
    }
    await connection.beginTransaction();
    inTransaction = true;
    const [admins] = await connection.execute('SELECT id, email FROM admins WHERE email = ? FOR UPDATE', [email]);
    if (admins.length !== 1) {
      throw new AdminResetError('ACCOUNT_NOT_UNIQUE', 'Exactly one existing administrator must match that email. No account was created.');
    }
    const admin = admins[0];
    if (!Number.isSafeInteger(admin.id) || admin.id < 1) {
      throw new AdminResetError('INVALID_ACCOUNT', 'The administrator record has an invalid ID.');
    }
    const [result] = await connection.execute('UPDATE admins SET password = ? WHERE id = ? AND email = ?', [hash, admin.id, admin.email]);
    if (result.affectedRows !== 1) {
      throw new AdminResetError('UPDATE_MISMATCH', 'The reset must update exactly one existing account.');
    }
    const [saved] = await connection.execute('SELECT password FROM admins WHERE id = ? AND email = ?', [admin.id, admin.email]);
    if (saved.length !== 1 || saved[0].password !== hash) {
      throw new AdminResetError('HASH_NOT_STORED', 'The database did not preserve the bcrypt hash. Ensure admins.password can store at least 60 characters.');
    }
    await connection.commit();
    inTransaction = false;
    return { id: admin.id };
  } catch (error) {
    if (inTransaction) {
      try { await connection.rollback(); } catch { /* The caller closes the connection after a failed reset. */ }
    }
    if (error instanceof AdminResetError) throw error;
    throw new AdminResetError('DATABASE_ERROR', 'Password reset failed. Check database connectivity, TLS, transaction support, and permissions.');
  }
}

module.exports = { AdminResetError, validateResetInput, resetAdminPassword };

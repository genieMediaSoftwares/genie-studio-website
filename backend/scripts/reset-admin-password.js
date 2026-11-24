const path = require('node:path');
const { Writable } = require('node:stream');
const { createInterface } = require('node:readline');
const { AdminResetError, validateResetInput, resetAdminPassword } = require('../lib/adminPasswordReset');

function parseArguments(args) {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) return { help: true };
  if (args.length !== 2 || args[0] !== '--email' || !args[1] || args[1].startsWith('--')) {
    throw new AdminResetError('USAGE', 'Usage: npm run admin:reset-password -- --email <existing-admin-email>. Passwords are accepted only through hidden terminal prompts.');
  }
  return { email: args[1] };
}

function passwordPrompt(input = process.stdin, output = process.stdout) {
  if (!input.isTTY || !output.isTTY) {
    throw new AdminResetError('TTY_REQUIRED', 'Use an interactive terminal for hidden password entry. Do not pass a password as an argument, pipe, or environment variable.');
  }
  const hiddenOutput = new Writable({
    // Suppress every readline echo, including buffered paste and control-key redraws.
    write(_chunk, _encoding, done) { done(); },
  });
  const terminal = createInterface({ input, output: hiddenOutput, terminal: true, historySize: 0 });
  let pending;
  const cancel = () => {
    const reject = pending;
    pending = undefined;
    reject?.(new AdminResetError('CANCELLED', 'Password reset cancelled.'));
    terminal.close();
  };
  terminal.on('SIGINT', cancel);
  terminal.on('close', () => {
    const reject = pending;
    pending = undefined;
    reject?.(new AdminResetError('CANCELLED', 'Password reset cancelled.'));
  });
  return {
    ask(label) {
      output.write(label);
      return new Promise((resolve, reject) => {
        pending = reject;
        terminal.question('', answer => {
          pending = undefined;
          output.write('\n');
          resolve(answer);
        });
      });
    },
    close() { terminal.close(); hiddenOutput.destroy(); },
  };
}

async function main(args = process.argv.slice(2)) {
  const options = parseArguments(args);
  if (options.help) {
    console.log('Usage: npm run admin:reset-password -- --email <existing-admin-email>');
    console.log('Enter and confirm a new password at hidden prompts. Only that existing account password is updated.');
    return;
  }
  let prompt;
  let connection;
  try {
    prompt = passwordPrompt();
    const password = await prompt.ask('New password (hidden): ');
    const confirmation = await prompt.ask('Confirm new password (hidden): ');
    prompt.close();
    prompt = undefined;
    const input = { email: options.email, password, confirmation };
    validateResetInput(input);
    require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });
    const { loadDatabaseConfig } = require('../lib/config');
    const mysql = require('mysql2/promise');
    connection = await mysql.createConnection(loadDatabaseConfig());
    await resetAdminPassword(connection, input);
    console.log('Existing administrator password updated to bcrypt. Other account fields and database records were preserved.');
  } finally {
    prompt?.close();
    if (connection) {
      try { await connection.end(); } catch { connection.destroy(); }
    }
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(error instanceof AdminResetError ? error.message : 'Password reset failed. Check private database configuration, TLS, permissions, and connection status.');
    process.exitCode = 1;
  });
}

module.exports = { main, parseArguments, passwordPrompt };

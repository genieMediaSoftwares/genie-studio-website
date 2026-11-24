const path = require('node:path');
const { passwordPrompt } = require('./reset-admin-password');
const { AdminResetError } = require('../lib/adminPasswordReset');
const { AdminCreationError, validateEmail, validateCreationInput, inspectAdminDatabase, requireCompatible, createAdmin } = require('../lib/adminCreation');

const LIVE_API_ORIGIN = 'https://api-studio.geniemedia.in';

function parseArguments(args) {
  if (!args.length) return 'check';
  if (args.length === 1 && ['--check', '--create', '--verify-login', '--help', '-h'].includes(args[0])) {
    return args[0] === '-h' ? 'help' : args[0].slice(2);
  }
  throw new AdminCreationError('USAGE', 'Usage: node scripts/create-admin.js [--check|--create|--verify-login]. Email and passwords are entered only at hidden terminal prompts.');
}

function confirmationText(email, databaseName) { return `CREATE ${email} IN ${databaseName}`; }

// No configurable destination or redirects: credentials only go to this site's HTTPS API.
async function verifyLiveLogin(email, password, transport = fetch) {
  validateEmail(email);
  try {
    const response = await transport(`${LIVE_API_ORIGIN}/api/login`, {
      method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new AdminCreationError('LOGIN_FAILED', `Live login returned HTTP ${response.status}. The account, if created, is preserved. Check the deployed database and authentication version.`);
    }
    const data = await response.json();
    if (data.success !== true || typeof data.token !== 'string' || !data.token) throw new AdminCreationError('LOGIN_FAILED', 'Live login did not return a valid success response.');
    const protectedResponse = await transport(`${LIVE_API_ORIGIN}/api/admin/blogs`, {
      redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${data.token}`, Accept: 'application/json' },
    });
    const protectedData = protectedResponse.ok ? await protectedResponse.json() : null;
    if (!protectedResponse.ok) await protectedResponse.body?.cancel();
    if (!protectedResponse.ok || !Array.isArray(protectedData)) {
      throw new AdminCreationError('ACCESS_FAILED', 'Live login succeeded, but the authenticated read could not be verified. Keep the existing account until this is resolved.');
    }
    // Do not return or print the token or any website content.
  } catch (error) {
    if (error instanceof AdminCreationError) throw error;
    throw new AdminCreationError('VERIFICATION_FAILED', 'Live login verification could not complete securely. Check network access and HTTPS; do not delete either account.');
  }
}

function printReport(report, config) {
  console.log('READ-ONLY inspection. No database records or schema were changed.');
  console.log(JSON.stringify({ configuredHost: config.host, configuredDatabase: config.database, configuredUser: config.user,
    certificateVerifiedTLS: !!config.ssl?.rejectUnauthorized, ...report.identity, engine: report.engine,
    uniqueEmail: report.uniqueEmail, visibleTriggerCount: report.triggerCount }, null, 2));
  console.table(report.columns);
  if (report.problems.length) console.log('Creation blocked:', report.problems.join(' '));
  else console.log('Schema is compatible. Compare these identifiers with the live backend settings and Hostinger database details before approval.');
  console.log('This checks this command\'s connection. It cannot prove the deployed process uses the same settings. Confirm that separately in the backend hosting dashboard.');
}

async function main(args = process.argv.slice(2)) {
  const mode = parseArguments(args);
  if (mode === 'help') {
    console.log('Default / --check: read-only database identity and schema inspection.');
    console.log('--create: hidden email/password prompts, explicit database confirmation, then one admin INSERT.');
    console.log('--verify-login: hidden credentials, live HTTPS login and authenticated read; no database writes.');
    return;
  }
  let connection, prompt;
  try {
    if (mode === 'verify-login') {
      prompt = passwordPrompt();
      const email = validateEmail(await prompt.ask('Admin email (hidden): '));
      const password = await prompt.ask('Password (hidden): ');
      prompt.close(); prompt = undefined;
      await verifyLiveLogin(email, password);
      console.log('Verified: live login and authenticated admin read both succeeded. No content was changed.');
      return;
    }
    // --create must be interactive before any database access; no --yes bypass.
    if (mode === 'create') prompt = passwordPrompt();
    require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });
    const { loadDatabaseConfig } = require('../lib/config');
    let config;
    try { config = loadDatabaseConfig({ ...process.env, NODE_ENV: 'production' }); }
    catch { throw new AdminCreationError('CONFIGURATION_ERROR', 'Database configuration is incomplete or insecure. Remote connections require DB_SSL=true with a trusted certificate. Check private settings; no connection was opened.'); }
    const mysql = require('mysql2/promise');
    connection = await mysql.createConnection({ ...config, connectTimeout: 10000 });
    const report = await inspectAdminDatabase(connection);
    printReport(report, config);
    requireCompatible(report);
    if (mode === 'check') return;
    const email = validateEmail(await prompt.ask('New admin email (hidden): '));
    const password = await prompt.ask('New password (hidden; 12+ characters, 3 character types): ');
    const confirmation = await prompt.ask('Confirm new password (hidden): ');
    const input = { email, password, confirmation };
    validateCreationInput(input);
    console.log(`Proposed change: insert ONE new administrator (${email}) into ${report.identity.database_name}. Existing accounts and website records are preserved.`);
    console.log('Continue only after the owner has approved this account and the target has been matched to production.');
    const required = confirmationText(email, report.identity.database_name);
    const approval = await prompt.ask(`To approve, type exactly: ${required}\nConfirmation (hidden): `);
    if (approval !== required) throw new AdminCreationError('CANCELLED', 'Approval did not match. No account was created.');
    const account = await createAdmin(connection, input, report.identity);
    console.log(`Created administrator ID ${account.id}. The stored bcrypt password was verified. Existing accounts were preserved.`);
    console.log('Live login has not yet been verified. Keep the old account until verification succeeds.');
    const verify = await prompt.ask('Type VERIFY to test this account against the live HTTPS API now, or Enter to stop: ');
    if (verify === 'VERIFY') {
      await verifyLiveLogin(email, password);
      console.log('Verified: live login and authenticated admin read both succeeded.');
    } else console.log('Pending: run node scripts/create-admin.js --verify-login and sign in at https://studio.geniemedia.in/admin.');
  } finally {
    prompt?.close();
    if (connection) { try { await connection.end(); } catch { connection.destroy(); } }
  }
}

if (require.main === module) main().catch(error => {
  console.error(error instanceof AdminCreationError || error instanceof AdminResetError ? error.message : 'Admin maintenance failed. Check private database configuration, TLS, metadata privileges, and connectivity. Error details were suppressed.');
  process.exitCode = 1;
});

module.exports = { parseArguments, confirmationText, verifyLiveLogin, main };

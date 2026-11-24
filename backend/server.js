const { createApp } = require('./app');
const { loadConfig } = require('./lib/config');

// Hostinger loads this file through its own launcher, so require.main may point
// to the launcher. The hosting entry point must always start the HTTP listener.
try {
  const config = loadConfig();
  const app = createApp({ config });
  const server = app.listen(config.port, () => console.log(`Backend listening on port ${config.port}`));
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  module.exports = server;

  // Bind the port before database initialization completes. app.js gates API
  // requests with a CORS-enabled 503 until all schema checks have succeeded.
  app.locals.ready().then(() => {
    console.log('Backend database initialization complete.');
  }).catch(() => {
    console.error('Backend database initialization failed. Check connectivity, TLS, and schema privileges.');
    app.locals.db.end();
    process.exitCode = 1;
  });
} catch (err) {
  console.error(`Backend configuration error: ${err.message}`);
  process.exitCode = 1;
}

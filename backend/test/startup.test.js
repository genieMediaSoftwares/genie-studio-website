const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('Hostinger-style loading binds the port before database readiness without a main-module guard', async () => {
  const events = [];
  let finishInitialization;
  const readiness = new Promise(resolve => { finishInitialization = resolve; });
  const listener = {};
  const app = {
    listen(port) { events.push(['listen', port]); return listener; },
    locals: { ready() { events.push(['ready']); return readiness; }, db: { end() { throw new Error('Unexpected database shutdown'); } } },
  };
  const exported = { exports: {} };
  const fakeProcess = {};
  // require.main is deliberately absent, like an entry imported by a launcher.
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8'), {
    require(id) {
      if (id === './app') return { createApp: () => app };
      if (id === './lib/config') return { loadConfig: () => ({ port: 5000 }) };
      throw new Error('Unexpected dependency');
    },
    module: exported, process: fakeProcess,
    console: { log() {}, error() { throw new Error('Unexpected startup error'); } },
  });
  assert.deepEqual(events, [['listen', 5000], ['ready']]);
  assert.equal(exported.exports, listener);
  assert.equal(listener.requestTimeout, 30000);
  assert.equal(listener.headersTimeout, 15000);
  assert.equal(fakeProcess.exitCode, undefined);
  finishInitialization();
  await readiness;
});

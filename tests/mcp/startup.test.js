const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('MCP server warns on startup if built-ins are omitted via rulesPath', () => {
  const { createServer } = require('../../dist/mcp/server.js');
  
  // mock loadRules via require cache
  const loaderPath = require.resolve('../../dist/engine/loader.js');
  require(loaderPath);
  const originalLoadRules = require.cache[loaderPath].exports.loadRules;
  require.cache[loaderPath].exports.loadRules = () => [{ id: 'dummy-001' }];

  const originalError = console.error;
  let loggedMessage = '';
  console.error = (msg) => { loggedMessage = msg; };
  
  try {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-start-'));
    const config = { allowedScanRoots: [root], ruleDirectory: root, rulesPath: root, enabledTools: [], loggingLevel: 'info' };
    
    // this should trigger the warning since built-ins are missing
    createServer(config);
    
    assert.match(loggedMessage, /built-in MCP rules are not loaded because a custom rulesPath is active/);
  } finally {
    console.error = originalError;
    require.cache[loaderPath].exports.loadRules = originalLoadRules;
  }
});

test('MCP server does not warn if built-ins are present', () => {
  const { createServer } = require('../../dist/mcp/server.js');
  
  const originalError = console.error;
  let called = false;
  console.error = (msg) => { called = true; };
  
  try {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-start2-'));
    const realRules = path.resolve(__dirname, '..', '..', 'rules');
    // point to real rules, omit rulesPath
    const config = { allowedScanRoots: [root], ruleDirectory: realRules, enabledTools: [], loggingLevel: 'info' };
    
    createServer(config);
    assert.equal(called, false);
  } finally {
    console.error = originalError;
  }
});

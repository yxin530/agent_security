const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { validateScanTarget } = require('../dist/mcp/security/path-validation.js');

test('MCP handshake and tool discovery', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-mcp-'));
  const config = path.join(root, 'mcp.config.json');
  fs.writeFileSync(config, JSON.stringify({ allowedScanRoots: [root], ruleDirectory: path.resolve(__dirname, '..', 'rules') }));
  const transport = new StdioClientTransport({ command: process.execPath, args: [path.resolve(__dirname, '..', 'dist', 'mcp', 'server.js')], env: { ...process.env, AGENT_SECURITY_MCP_CONFIG: config } });
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  await client.connect(transport);
  const tools = await client.listTools();
  assert.ok(tools.tools.some(tool => tool.name === 'list_rules'));
  const response = await client.callTool({ name: 'list_rules', arguments: {} });
  assert.equal(response.isError, undefined);
  await client.close();
});

test('scan paths outside configured roots are rejected', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-root-'));
  assert.throws(() => validateScanTarget(os.tmpdir(), { allowedScanRoots: [root], maxScanSizeBytes: 1000 }), /outside allowed scan roots/);
  assert.throws(() => validateScanTarget(path.join(root, '.ssh'), { allowedScanRoots: [root], maxScanSizeBytes: 1000 }), /ENOENT|denied/);
});

test('symlinks within allowed roots are permitted', () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-sym-')));
  const target = path.join(root, 'target.txt');
  fs.writeFileSync(target, 'data');
  const link = path.join(root, 'link.txt');
  fs.symlinkSync(target, link);
  assert.equal(validateScanTarget(link, { allowedScanRoots: [root], maxScanSizeBytes: 1000 }), fs.realpathSync(target));
});

test('symlinks escaping allowed roots are rejected', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-sym-in-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-sym-out-'));
  const target = path.join(outside, 'target.txt');
  fs.writeFileSync(target, 'data');
  const link = path.join(root, 'link.txt');
  fs.symlinkSync(target, link);
  assert.throws(() => validateScanTarget(link, { allowedScanRoots: [root], maxScanSizeBytes: 1000 }), /outside allowed scan roots/);
});

test('denylist categories are individually rejected', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-deny-'));
  const categories = ['.ssh', '.aws', '.azure', '.gnupg', '.npmrc', '.docker', '.git'];
  for (const cat of categories) {
    const dir = path.join(root, cat);
    fs.mkdirSync(dir);
    assert.throws(() => validateScanTarget(dir, { allowedScanRoots: [root], maxScanSizeBytes: 1000 }), /denied by security policy/);
  }
});

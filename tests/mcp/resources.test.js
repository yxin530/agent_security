const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

test('MCP resources block invalid ruleId and document traversal', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-mcp-res-'));
  const config = path.join(root, 'mcp.config.json');
  fs.writeFileSync(config, JSON.stringify({ allowedScanRoots: [root], ruleDirectory: path.resolve(__dirname, '..', '..', 'rules') }));
  
  const serverPath = path.resolve(__dirname, '..', '..', 'dist', 'mcp', 'server.js');
  const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath], env: { ...process.env, AGENT_SECURITY_MCP_CONFIG: config } });
  const client = new Client({ name: 'resources-client', version: '1.0.0' });
  
  await client.connect(transport);

  // Invalid ruleId
  await assert.rejects(
    client.readResource({ uri: 'security://rules/non-existent-rule-123' }),
    /rule was not found/
  );

  // Traversal document
  await assert.rejects(
    client.readResource({ uri: 'security://documentation/..%2F..%2Fpackage.json' }),
    /resource was not found/
  );
  
  // Not allowlisted document
  await assert.rejects(
    client.readResource({ uri: 'security://documentation/random.md' }),
    /resource was not found/
  );

  await client.close();
});

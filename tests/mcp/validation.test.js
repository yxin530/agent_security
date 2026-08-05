const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

test('MCP tool validation rejects invalid inputs', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-mcp-val-'));
  const config = path.join(root, 'mcp.config.json');
  fs.writeFileSync(config, JSON.stringify({ allowedScanRoots: [root], ruleDirectory: path.resolve(__dirname, '..', '..', 'rules') }));
  
  const serverPath = path.resolve(__dirname, '..', '..', 'dist', 'mcp', 'server.js');
  const transport = new StdioClientTransport({ command: process.execPath, args: [serverPath], env: { ...process.env, AGENT_SECURITY_MCP_CONFIG: config } });
  const client = new Client({ name: 'validation-client', version: '1.0.0' });
  
  await client.connect(transport);

  // scan_project missing target
  let response = await client.callTool({ name: 'scan_project', arguments: {} });
  assert.equal(response.isError, true);
  
  // scan_project invalid format
  response = await client.callTool({ name: 'scan_project', arguments: { target: root, format: 'invalid' } });
  assert.equal(response.isError, true);

  // inspect_runtime_event missing eventType
  response = await client.callTool({ name: 'inspect_runtime_event', arguments: { eventData: {} } });
  assert.equal(response.isError, true);

  // inspect_runtime_event invalid eventType
  response = await client.callTool({ name: 'inspect_runtime_event', arguments: { eventType: 'unknown', eventData: {} } });
  assert.equal(response.isError, true);

  // get_rule missing ruleId
  response = await client.callTool({ name: 'get_rule', arguments: {} });
  assert.equal(response.isError, true);
  
  // get_rule invalid ruleId regex
  response = await client.callTool({ name: 'get_rule', arguments: { ruleId: 'INVALID_CAPS' } });
  assert.equal(response.isError, true);

  await client.close();
});

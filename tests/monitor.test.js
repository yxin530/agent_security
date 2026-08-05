const assert = require('node:assert/strict');
const { test } = require('node:test');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const { inspectRuntimeEvent } = require('../dist/monitor');

const cli = path.join(__dirname, '..', 'dist', 'monitor', 'cli.js');
const fixture = path.join(__dirname, 'fixtures', 'runtime', 'tool-call.ndjson');

const result = spawnSync(process.execPath, [cli, '--input', fixture, '--format', 'json'], { encoding: 'utf8' });
assert.equal(result.status, 1, result.stderr);
const findings = result.stdout.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
assert.ok(findings.some(finding => finding.ruleId === 'unvalidated-tool-args-001'));
assert.ok(findings.every(finding => finding.source === 'runtime'));
assert.match(result.stderr, /unrecognized event type/);
assert.match(result.stderr, /invalid runtime event/);

test('runtime equivalents detect outbound LLM key and permissive tool grant observations', () => {
  const rulesDir = path.join(__dirname, '..', 'dist', 'rules');
  const key = inspectRuntimeEvent(rulesDir, { type: 'llm-output', data: '{"type":"llm_output","content":"Authorization Bearer sk-ant-abcdefghijklmnopqrstuv","timestamp":"2026-08-05T00:00:00Z"}' });
  assert.ok(key.some(finding => finding.ruleId === 'hardcoded-llm-key-001' && finding.source === 'runtime'));
  const grant = inspectRuntimeEvent(rulesDir, { type: 'tool-call', data: '{"type":"tool_call","name":"grant","args":{"tools":["*"]},"timestamp":"2026-08-05T00:00:00Z"}' });
  assert.ok(grant.some(finding => finding.ruleId === 'permissive-mcp-grant-001' && finding.source === 'runtime'));
});

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const cli = path.join(__dirname, '..', 'dist', 'monitor', 'cli.js');
const fixture = path.join(__dirname, 'fixtures', 'runtime', 'tool-call.ndjson');

const result = spawnSync(process.execPath, [cli, '--input', fixture, '--format', 'json'], { encoding: 'utf8' });
assert.equal(result.status, 1, result.stderr);
const findings = result.stdout.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
assert.ok(findings.some(finding => finding.ruleId === 'unvalidated-tool-args-001'));
assert.ok(findings.every(finding => finding.source === 'runtime'));
assert.match(result.stderr, /unrecognized event type/);
assert.match(result.stderr, /invalid runtime event/);

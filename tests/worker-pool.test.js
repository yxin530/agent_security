const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { scanFilesInWorkers } = require('../dist/core/worker-pool');

test('worker pool terminates a catastrophic regular expression within its deadline', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-worker-'));
  const file = path.join(dir, 'hostile.txt');
  fs.writeFileSync(file, `${'a'.repeat(150_000)}!`);
  const rule = {
    id: 'hostile-test-001', title: 'hostile test', severity: 'high', category: 'test',
    description: 'test', remediation: 'test', detection_tier: 'regex', scope: 'language-agnostic',
    maps_to: { owasp: [] },
    detection: { conditions: [{ pattern: '(a+)+$', flags: '' }], scope: 'file', logic: 'AND' }
  };
  const started = Date.now();
  try {
    const result = await scanFilesInWorkers([rule], [{ fullPath: file, relativePath: 'hostile.txt', size: fs.statSync(file).size }], { timeoutMs: 100, workers: 1 });
    assert.equal(result.truncated, true);
    assert.ok(Date.now() - started < 1500, `scan took ${Date.now() - started}ms`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

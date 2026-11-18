const assert = require('node:assert/strict');
const test = require('node:test');
const { ScanQueue } = require('../dist/mcp/security/scan-queue');

test('scan queue permits one active and four waiting scans, then rejects overflow', async () => {
  const queue = new ScanQueue(1, 4);
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const active = queue.run(async () => { await gate; return 'active'; });
  const queued = Array.from({ length: 4 }, (_, index) => queue.run(async () => `queued-${index}`));
  await assert.rejects(queue.run(async () => 'overflow'), /scan queue full/);
  release();
  assert.equal(await active, 'active');
  assert.deepEqual(await Promise.all(queued), ['queued-0', 'queued-1', 'queued-2', 'queued-3']);
});

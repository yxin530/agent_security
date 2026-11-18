const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { walkDirectory } = require('../dist/core/walker');

test('walker applies gitignore-style globs, negation, and per-file caps', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-walker-'));
  try {
    fs.writeFileSync(path.join(root, '.agentsecurityignore'), '*.log\n!important.log\n');
    fs.writeFileSync(path.join(root, 'skip.log'), 'ignored');
    fs.writeFileSync(path.join(root, 'important.log'), 'kept');
    fs.writeFileSync(path.join(root, 'large.txt'), 'x'.repeat(20));
    const result = walkDirectory(root, { maxFileBytes: 10 });
    assert.deepEqual(result.files.map(file => file.relativePath).sort(), ['important.log']);
    assert.equal(result.skippedFiles.ignored, 1);
    assert.equal(result.skippedFiles.tooLarge, 1);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('walker rejects scans that exceed the shared total-byte cap', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-walker-cap-'));
  try {
    fs.writeFileSync(path.join(root, 'one.txt'), '12345');
    assert.throws(() => walkDirectory(root, { maxTotalBytes: 4 }), /configured size limit/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('walker omits key and cloud credential paths', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-walker-deny-'));
  try {
    fs.mkdirSync(path.join(root, '.config', 'gcloud'), { recursive: true });
    fs.writeFileSync(path.join(root, '.config', 'gcloud', 'credentials.db'), 'EXAMPLE');
    fs.writeFileSync(path.join(root, 'id_rsa_example'), 'EXAMPLE');
    fs.writeFileSync(path.join(root, 'private.key'), 'EXAMPLE');
    fs.writeFileSync(path.join(root, 'private.pem'), 'EXAMPLE');
    fs.writeFileSync(path.join(root, 'safe.ts'), 'const safe = true;');
    const result = walkDirectory(root);
    assert.deepEqual(result.files.map(file => file.relativePath), ['safe.ts']);
    assert.equal(result.skippedFiles.ignored, 3);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('walker never follows a symlink outside the scan root, even in follow mode', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-walker-root-'));
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-security-walker-outside-'));
  try {
    fs.writeFileSync(path.join(outside, 'outside.ts'), 'const sample = true;');
    fs.symlinkSync(path.join(outside, 'outside.ts'), path.join(root, 'linked.ts'));
    const result = walkDirectory(root, { followSymlinks: true });
    assert.deepEqual(result.files, []);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
    fs.rmSync(outside, { recursive: true, force: true });
  }
});

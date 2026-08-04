#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const command = args.shift();
if (command !== 'scan') {
  console.error('Usage: agent-security-engine scan --target <path> [--format json|terminal]');
  process.exit(1);
}
const result = spawnSync(process.execPath, [path.join(root, 'dist/engine/scan.js'), '--rules', path.join(root, 'dist/rules'), ...args], { stdio: 'inherit' });
process.exit(result.status ?? 1);

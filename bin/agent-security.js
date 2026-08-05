#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const command = args.shift();
if (command === '--version' || command === '-v') {
  console.log(require(path.join(root, 'package.json')).version);
  process.exit(0);
}
if (command === '--help' || command === '-h') {
  console.log('Usage: agent-security-engine [--version] | scan --target <path> [--format json|terminal]\nMCP server: agent-security-mcp (see docs/mcp/architecture.md)');
  process.exit(0);
}
if (command !== 'scan') {
  console.error('Usage: agent-security-engine [--version] | scan --target <path> [--format json|terminal]\nMCP server: agent-security-mcp (see docs/mcp/architecture.md)');
  process.exit(1);
}
const result = spawnSync(process.execPath, [path.join(root, 'dist/engine/scan.js'), '--rules', path.join(root, 'dist/rules'), ...args], { stdio: 'inherit' });
process.exit(result.status ?? 1);

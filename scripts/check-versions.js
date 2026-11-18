const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const expectedVersion = pkg.version;

let hasErrors = false;

// 1. Check CHANGELOG.md
const changelogPath = path.join(root, 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  const changelog = fs.readFileSync(changelogPath, 'utf8');
  const versionHeaderRegex = new RegExp(`##\\s*\\[?${expectedVersion.replace(/\./g, '\\.')}\\]?`);
  if (!versionHeaderRegex.test(changelog) && !changelog.includes('## Unreleased')) {
    console.error(`CHANGELOG.md does not contain header for version ${expectedVersion} or '## Unreleased'`);
    hasErrors = true;
  }
}

// 2. Check core/version.ts if dist exists
const distVersionPath = path.join(root, 'dist', 'core', 'version.js');
if (fs.existsSync(distVersionPath)) {
  try {
    const { getVersion } = require(distVersionPath);
    if (getVersion() !== expectedVersion) {
      console.error(`dist/core/version.js getVersion() returned "${getVersion()}", expected "${expectedVersion}"`);
      hasErrors = true;
    }
  } catch (err) {
    console.error(`Failed to load dist/core/version.js: ${err.message}`);
    hasErrors = true;
  }
}

// 3. Check mcp/server.ts hardcoded version absence
const mcpServerPath = path.join(root, 'mcp', 'server.ts');
if (fs.existsSync(mcpServerPath)) {
  const content = fs.readFileSync(mcpServerPath, 'utf8');
  if (content.includes("version: '0.9.0'")) {
    console.error(`mcp/server.ts still contains hardcoded version '0.9.0'`);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error(`check-versions failed: version inconsistencies detected.`);
  process.exit(1);
} else {
  console.log(`Version check passed: all components consistent with ${expectedVersion}`);
  process.exit(0);
}

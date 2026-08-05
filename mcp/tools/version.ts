import fs from 'node:fs';
import path from 'node:path';
export function rulesetVersion(): string { const packagePath = path.resolve(__dirname, '../../../package.json'); try { return JSON.parse(fs.readFileSync(packagePath, 'utf8')).version; } catch { return 'source'; } }

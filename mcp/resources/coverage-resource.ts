import fs from 'node:fs';
import path from 'node:path';
export function coverageText(): string { return fs.readFileSync(path.resolve(__dirname, '../../docs/agent-threats/coverage-status.md'), 'utf8'); }

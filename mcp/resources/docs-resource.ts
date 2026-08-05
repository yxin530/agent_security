import fs from 'node:fs';
import path from 'node:path';
const ALLOWED = new Set(['engine/parsers.md', 'frameworks/mitre-atlas.md', 'legal/pdpa-mapping.md', 'legal/pdpa-2024-mapping.md', 'legal/enforcement-cases.md', 'monitor/cli.md', 'owasp/llm-top-10.md', 'owasp/web-top-10.md', 'agent-threats/coverage-status.md']);
export function documentationText(document: string): string { if (document.includes('..') || path.isAbsolute(document) || !ALLOWED.has(document)) throw new Error('documentation resource was not found'); return fs.readFileSync(path.resolve(__dirname, '../../docs', document), 'utf8'); }

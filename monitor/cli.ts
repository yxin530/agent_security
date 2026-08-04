#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { inspectRuntimeEvent } from './index';

function option(name: string): string | undefined { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined; }
if (process.argv.includes('--help')) { console.log('Usage: agent-security-monitor --input <events.ndjson|-> --format json'); process.exit(0); }
const input = option('--input');
const format = option('--format') ?? 'json';
if (format !== 'json') { console.error('Only --format json is supported.'); process.exit(1); }
const content = input && input !== '-' ? fs.readFileSync(input, 'utf8') : fs.readFileSync(0, 'utf8');
const rulesDir = path.resolve(__dirname, '../rules');
let emitted = 0;
for (const [index, line] of content.split(/\r?\n/).filter(Boolean).entries()) {
  try {
    const event = JSON.parse(line) as { type?: string; [key: string]: unknown };
    if (event.type !== 'tool_call') { console.error(`Skipping line ${index + 1}: unrecognized event type`); continue; }
    for (const finding of inspectRuntimeEvent(rulesDir, { type: 'tool-call', data: JSON.stringify(event) })) { console.log(JSON.stringify(finding)); emitted++; }
  } catch (error) { console.error(`Skipping line ${index + 1}: invalid runtime event (${(error as Error).message})`); }
}
process.exitCode = emitted > 0 ? 1 : 0;

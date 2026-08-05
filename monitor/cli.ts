#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { inspectRuntimeEvent } from './index';

function option(name: string): string | undefined { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined; }
if (process.argv.includes('--help')) { console.log('Usage: agent-security-monitor --input <events.ndjson|-> --format json'); process.exit(0); }
const input = option('--input');
const format = option('--format') ?? 'json';
const rules = option('--rules')?.split(',').filter(Boolean);
if (format !== 'json') { console.error('Only --format json is supported.'); process.exit(1); }
const content = input && input !== '-' ? fs.readFileSync(input, 'utf8') : fs.readFileSync(0, 'utf8');
const rulesDir = path.resolve(__dirname, '../rules');
let emitted = 0;
let events: unknown[];
try { const parsed = JSON.parse(content); events = Array.isArray(parsed) ? parsed : [parsed]; }
catch { events = content.split(/\r?\n/).filter(Boolean).map(line => { try { return JSON.parse(line); } catch { return { __parseError: true }; } }); }
for (const [index, raw] of events.entries()) {
  try {
    const event = raw as { type?: string; [key: string]: unknown };
    if (event.__parseError) { console.error(`Skipping event ${index + 1}: malformed JSON runtime event`); continue; }
    const type = event.type === 'tool_call' ? 'tool-call' : event.type === 'llm_input' ? 'llm-input' : event.type === 'llm_output' ? 'llm-output' : undefined;
    if (!type) { console.error(`Skipping event ${index + 1}: unrecognized event type (invalid runtime event)`); continue; }
    for (const finding of inspectRuntimeEvent(rulesDir, { type, data: JSON.stringify(event) }, rules)) { console.log(JSON.stringify(finding)); emitted++; }
  } catch (error) { console.error(`Skipping event ${index + 1}: ${(error as Error).message}`); }
}
process.exitCode = emitted > 0 ? 1 : 0;

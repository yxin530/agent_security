import fs from 'node:fs';
import path from 'node:path';
import { McpConfig } from '../config';
import { redactInput } from './redaction-rules';
export function writeAudit(config: McpConfig, entry: { tool: string; input: unknown; outcome: string; durationMs: number }): void {
  if (config.loggingLevel !== 'audit' || !config.auditLogPath) return;
  fs.mkdirSync(path.dirname(config.auditLogPath), { recursive: true });
  fs.appendFileSync(config.auditLogPath, JSON.stringify({ timestamp: new Date().toISOString(), ...entry, input: redactInput(entry.tool, entry.input) }) + '\n');
}

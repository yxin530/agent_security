import path from 'node:path';
import fs from 'node:fs';
import { scanDetailedInWorkers } from '../../core/scan-session';
import { formatJson, formatTerminal } from '../../engine/reporter';
import { McpConfig } from '../config';
import { validateScanTarget } from '../security/path-validation';
import { result } from './common';

export async function scanProject(args: { target: string; rulesPath?: string; format?: 'json' | 'terminal' }, config: McpConfig) {
  if (args.rulesPath && fs.realpathSync(args.rulesPath) !== fs.realpathSync(config.ruleDirectory)) throw new Error('rules path is not permitted by server configuration');
  const target = validateScanTarget(args.target, config);
  const started = Date.now();
  const scanResult = await scanDetailedInWorkers(config.ruleDirectory, target, {
    timeoutMs: config.scanTimeoutMs,
    enabledRules: config.enabledRules,
    maxTotalBytes: config.maxScanSizeBytes
  });
  const findings = scanResult.findings;
  const output = args.format === 'terminal' ? formatTerminal(findings) : JSON.parse(formatJson(findings, scanResult.scannedFiles));
  const summary = { critical: 0, high: 0, medium: 0, low: 0, informational: 0 };
  for (const finding of findings) summary[finding.severity]++;
  return result({ schemaVersion: '0.10.0', findings, summary, scannedFiles: scanResult.scannedFiles, scanDurationMs: Date.now() - started, warnings: [], truncated: scanResult.truncated, ruleMetadata: { ruleCount: new Set(findings.map(f => f.ruleId)).size } , output });
}

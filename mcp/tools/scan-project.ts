import path from 'node:path';
import fs from 'node:fs';
import { scanDetailed, lastScannedFiles } from '../../engine/scan';
import { formatJson, formatTerminal } from '../../engine/reporter';
import { McpConfig } from '../config';
import { preflightScanSize, validateScanTarget } from '../security/path-validation';
import { result } from './common';

export function scanProject(args: { target: string; rulesPath?: string; format?: 'json' | 'terminal' }, config: McpConfig) {
  if (args.rulesPath && fs.realpathSync(args.rulesPath) !== fs.realpathSync(config.ruleDirectory)) throw new Error('rules path is not permitted by server configuration');
  const target = validateScanTarget(args.target, config);
  preflightScanSize(target, config);
  const started = Date.now();
  const scanResult = scanDetailed(config.ruleDirectory, target, { timeoutMs: config.scanTimeoutMs, enabledRules: config.enabledRules });
  const findings = scanResult.findings;
  const output = args.format === 'terminal' ? formatTerminal(findings) : JSON.parse(formatJson(findings, lastScannedFiles));
  const summary = { critical: 0, high: 0, medium: 0, low: 0, informational: 0 };
  for (const finding of findings) summary[finding.severity]++;
  return result({ schemaVersion: '0.10.0', findings, summary, scannedFiles: lastScannedFiles, scanDurationMs: Date.now() - started, warnings: [], truncated: scanResult.truncated, ruleMetadata: { ruleCount: new Set(findings.map(f => f.ruleId)).size } , output });
}

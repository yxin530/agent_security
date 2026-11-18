import { Finding } from '../core/findings';
import { SkippedFiles } from '../core/walker';
import { getVersion } from '../core/version';

export interface JsonReportOptions {
  rulesetVersion?: string;
  profile?: string;
  skippedFiles?: SkippedFiles;
  suppressed?: any[];
  truncated?: boolean;
  durationMs?: number;
}

export function formatJson(
  findings: Finding[],
  scannedFiles: number,
  options: JsonReportOptions = {}
): string {
  const engineVer = getVersion();
  const skipped = options.skippedFiles ?? {
    tooLarge: 0,
    binary: 0,
    minified: 0,
    ignored: 0
  };

  const severityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    informational: 0
  };

  for (const f of findings) {
    if (f.severity in severityCounts) {
      severityCounts[f.severity]++;
    }
  }

  const payload = {
    schemaVersion: 1,
    engineVersion: engineVer,
    rulesetVersion: options.rulesetVersion ?? engineVer,
    profile: options.profile ?? 'default',
    scannedFiles,
    findingsCount: findings.length,
    findings,
    summary: {
      total: findings.length,
      bySeverity: severityCounts
    },
    skippedFiles: skipped,
    suppressed: options.suppressed ?? [],
    truncated: options.truncated ?? false,
    durationMs: options.durationMs ?? 0,
    timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  };

  return JSON.stringify(payload, null, 2);
}

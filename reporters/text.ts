import { Finding } from '../core/findings';
import { SkippedFiles } from '../core/walker';

export interface TextReportOptions {
  skippedFiles?: SkippedFiles;
  suppressedCount?: number;
  useColor?: boolean;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '\x1b[31;1m', // bright red
  high: '\x1b[31m',       // red
  medium: '\x1b[33m',     // yellow
  low: '\x1b[34m',        // blue
  informational: '\x1b[36m' // cyan
};
const RESET = '\x1b[0m';

export function formatTerminal(findings: Finding[], options: TextReportOptions = {}): string {
  if (findings.length === 0) return 'No findings.';

  const isColor = options.useColor ?? (
    process.env.NO_COLOR === undefined &&
    Boolean(process.stdout && process.stdout.isTTY)
  );

  const lines: string[] = [];
  
  // Group by file
  const byFile = new Map<string, Finding[]>();
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file)!.push(f);
  }

  for (const [file, fileFindings] of byFile.entries()) {
    lines.push(`\n📄 ${file}`);
    for (const f of fileFindings) {
      const sevColor = isColor ? (SEVERITY_COLORS[f.severity] ?? '') : '';
      const reset = isColor ? RESET : '';
      const sevTag = `[${f.severity.toUpperCase()}]`;
      const heuristicTag = f.confidence === 'heuristic' ? ' (review suggested)' : '';
      lines.push(`  line ${f.line}:${f.column} - ${sevColor}${sevTag}${reset}${heuristicTag} ${f.title}`);
      lines.push(`    Rule: ${f.ruleId} | Category: ${f.category} | Tier: ${f.detectionTier}`);
      lines.push(`    Message: ${f.message}`);
      lines.push(`    Fix: ${f.remediation}`);
    }
  }

  lines.push('\nSummary:');
  lines.push(`  Total findings: ${findings.length}`);
  if (options.skippedFiles) {
    const s = options.skippedFiles;
    lines.push(`  Skipped files: ${s.tooLarge} too large, ${s.binary} binary, ${s.minified} minified, ${s.ignored} ignored`);
  }
  if (options.suppressedCount) {
    lines.push(`  Suppressed findings: ${options.suppressedCount}`);
  }

  return lines.join('\n');
}

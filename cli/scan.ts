import * as path from 'path';
import * as fs from 'fs';
import { scanDetailedInWorkers } from '../core/scan-session';
import { formatTerminal } from '../reporters/text';
import { formatJson } from '../reporters/json';
import { ExitCode } from '../core/exit-codes';
import { Severity } from '../core/findings';

const SEVERITY_LEVELS: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  informational: 0
};

function parseArgs(args: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        result[key] = next;
        i++;
      } else {
        result[key] = 'true';
      }
    }
  }
  return result;
}

export async function runCli(argv = process.argv.slice(2)): Promise<number> {
  const parsed = parseArgs(argv);

  const targetDir = parsed.target ? path.resolve(parsed.target) : process.cwd();
  const root = path.resolve(__dirname, '../..');
  const defaultRules = fs.existsSync(path.join(root, 'dist', 'rules'))
    ? path.join(root, 'dist', 'rules')
    : path.join(root, 'rules');
  const rulesDir = parsed.rules ? path.resolve(parsed.rules) : defaultRules;
  const format = parsed.format ?? 'text';
  const failOn = (parsed['fail-on'] ?? 'high').toLowerCase() as Severity;
  const timeoutMs = parsed.timeout ? Number(parsed.timeout) : undefined;

  if (!(failOn in SEVERITY_LEVELS)) {
    console.error(`Error: Invalid --fail-on level "${failOn}". Valid levels: critical, high, medium, low, informational`);
    return ExitCode.ERROR;
  }

  if (timeoutMs !== undefined && (!Number.isFinite(timeoutMs) || timeoutMs < 0)) {
    console.error(`Error: Invalid --timeout value "${parsed.timeout}"`);
    return ExitCode.ERROR;
  }

  try {
    const result = await scanDetailedInWorkers(rulesDir, targetDir, {
      timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : undefined
    });

    if (format === 'json') {
      console.log(formatJson(result.findings, result.scannedFiles, {
        skippedFiles: result.skippedFiles,
        truncated: result.truncated,
        durationMs: result.durationMs
      }));
    } else {
      console.log(formatTerminal(result.findings, {
        skippedFiles: result.skippedFiles
      }));
    }

    const threshold = SEVERITY_LEVELS[failOn];
    const failingFindings = result.findings.filter(f => SEVERITY_LEVELS[f.severity] >= threshold);

    return failingFindings.length > 0 ? ExitCode.FINDINGS : ExitCode.OK;
  } catch (error) {
    console.error((error as Error).message);
    return ExitCode.ERROR;
  }
}

if (require.main === module) {
  void runCli().then(code => { process.exitCode = code; });
}

import * as path from 'path';
import { runCli } from '../cli/scan';

export {
  Finding,
  Severity,
  Confidence,
  computeFingerprint,
  deduplicateFindings,
  sortFindings
} from '../core/findings';

export {
  ScanOptions,
  ScanResult,
  scanDetailed,
  scanDetailedInWorkers,
  scan,
  matchesPattern
} from '../core/scan-session';

export {
  SkippedFiles,
  WalkerOptions,
  walkDirectory,
  isBinaryBuffer,
  isMinifiedFile
} from '../core/walker';

export {
  shannonEntropy,
  checkEntropy,
  matchRule,
  compileConditions
} from '../matchers/regex';

if (require.main === module) {
  void runCli().then(code => { process.exitCode = code; });
}

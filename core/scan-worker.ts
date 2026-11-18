import * as fs from 'node:fs';
import { parentPort, workerData } from 'node:worker_threads';
import { Rule } from '../engine/loader';
import { compileConditions, matchRule } from '../matchers/regex';
import { computeFingerprint, Finding } from './findings';

interface WorkerFile { fullPath: string; relativePath: string; }
interface WorkerInput { rules: Rule[]; files: WorkerFile[]; }

function run(input: WorkerInput): void {
  const compiled = new Map(input.rules.map(rule => [rule.id, compileConditions(rule)]));
  const filePatterns = new Map(input.rules.map(rule => [rule.id, (rule.detection.file_patterns ?? []).map(pattern => compileGlob(pattern))]));
  for (const file of input.files) {
    let content: string;
    try { content = fs.readFileSync(file.fullPath, 'utf8'); }
    catch { parentPort?.postMessage({ scannedFiles: 0, findings: [] }); continue; }
    const lines = content.split(/\r?\n/);
    const findings: Finding[] = [];
    let applicable = false;
    for (const rule of input.rules) {
      if (rule.scope === 'language-specific') {
        if (!(filePatterns.get(rule.id) ?? []).some(pattern => pattern.test(file.relativePath))) continue;
      }
      applicable = true;
      for (const match of matchRule(rule, content, compiled.get(rule.id), lines)) {
        findings.push({
          ruleId: rule.id, title: rule.title, severity: rule.severity,
          confidence: (rule as any).confidence ?? 'high', category: rule.category,
          file: file.relativePath, line: match.line, column: match.column, endLine: match.endLine,
          message: rule.description.split('\n')[0], remediation: rule.remediation,
          fingerprint: computeFingerprint(rule.id, file.relativePath, match.lineText),
          mapsTo: rule.maps_to, detectionTier: rule.detection_tier, source: 'static'
        });
      }
    }
    parentPort?.postMessage({ scannedFiles: applicable ? 1 : 0, findings });
  }
  parentPort?.postMessage({ done: true });
}

function compileGlob(pattern: string): RegExp {
  const expression = pattern.split('/').map(part => {
    if (part === '**') return '(?:.*/)?';
    return part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*');
  }).join('');
  return new RegExp(`^${expression}$`);
}

if (!parentPort) throw new Error('scan worker requires a parent port');
run(workerData as WorkerInput);

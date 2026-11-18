import * as fs from 'fs';
import * as path from 'path';
import { loadRules, Rule } from '../engine/loader';
import {
  Finding,
  computeFingerprint,
  deduplicateFindings,
  sortFindings,
  normalizePathPosix
} from './findings';
import { walkDirectory, SkippedFiles, WalkerOptions } from './walker';
import { matchRule, compileConditions, CompiledRuleConditions } from '../matchers/regex';
import { scanFilesInWorkers } from './worker-pool';

export interface ScanOptions extends WalkerOptions {
  timeoutMs?: number;
  workers?: number;
  enabledRules?: string[] | null;
  now?: () => number;
}

export interface ScanResult {
  findings: Finding[];
  truncated: boolean;
  scannedFiles: number;
  skippedFiles: SkippedFiles;
  durationMs: number;
}

export function matchesPattern(relativePath: string, pattern: string): boolean {
  const normalized = normalizePathPosix(relativePath);
  const parts = pattern.split('/');
  const expression = parts.map(part => {
    if (part === '**') return '(?:.*/)?';
    return part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*');
  }).join('');
  const regex = '^' + expression + '$';
  return new RegExp(regex).test(normalized);
}

function loadAliasMap(rulesDir: string): Record<string, string> {
  const aliasPath = path.join(rulesDir, 'aliases.json');
  if (fs.existsSync(aliasPath)) {
    try {
      return JSON.parse(fs.readFileSync(aliasPath, 'utf8'));
    } catch {}
  }
  return {};
}

/**
 * Legacy synchronous API retained for compatibility. It runs inline and cannot terminate a running RegExp.
 * Use scanDetailedInWorkers for CLI, MCP, or any untrusted/custom rule pack.
 */
export function scanDetailed(rulesDir: string, targetDir: string, options: ScanOptions = {}): ScanResult {
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    throw new Error(`Target must be an existing directory: ${targetDir}`);
  }

  const now = options.now ?? Date.now;
  const started = now();

  const loadedRules = loadRules(rulesDir);
  const aliasMap = loadAliasMap(rulesDir);
  const resolvedEnabled = options.enabledRules
    ? new Set(options.enabledRules.map(id => aliasMap[id] ?? id))
    : null;

  const rules = resolvedEnabled
    ? loadedRules.filter(rule => resolvedEnabled.has(rule.id))
    : loadedRules;

  // Compile conditions once per rule
  const compiledMap = new Map<string, CompiledRuleConditions>();
  for (const rule of rules) {
    compiledMap.set(rule.id, compileConditions(rule));
  }

  const { files, skippedFiles } = walkDirectory(targetDir, {
    maxFileBytes: options.maxFileBytes,
    followSymlinks: options.followSymlinks
  });

  const rawFindings: Finding[] = [];
  let truncated = false;
  let scannedFiles = 0;

  for (const fileObj of files) {
    if (options.timeoutMs !== undefined && now() - started >= options.timeoutMs) {
      truncated = true;
      break;
    }

    const fullPath = fileObj.fullPath;
    const relative = fileObj.relativePath;
    let content: string;
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch {
      continue;
    }

    const applicableRules = rules.filter(rule => {
      if (rule.scope === 'language-agnostic') return true;
      const patterns = rule.detection.file_patterns ?? [];
      return patterns.some(pattern => matchesPattern(relative, pattern));
    });
    const lines = content.split(/\r?\n/);

    if (applicableRules.length > 0) {
      scannedFiles++;
    }

    for (const rule of applicableRules) {
      if (options.timeoutMs !== undefined && now() - started >= options.timeoutMs) {
        truncated = true;
        break;
      }

      const compiled = compiledMap.get(rule.id);
      const matches = matchRule(rule, content, compiled, lines);

      for (const m of matches) {
        const fp = computeFingerprint(rule.id, relative, m.lineText);
        rawFindings.push({
          ruleId: rule.id,
          title: rule.title,
          severity: rule.severity,
          confidence: (rule as any).confidence ?? 'high',
          category: rule.category,
          file: relative,
          line: m.line,
          column: m.column,
          endLine: m.endLine,
          message: rule.description.split('\n')[0],
          remediation: rule.remediation,
          fingerprint: fp,
          mapsTo: rule.maps_to,
          detectionTier: rule.detection_tier,
          source: 'static'
        });
      }
    }
  }

  const deduped = deduplicateFindings(rawFindings);
  const sorted = sortFindings(deduped);
  const durationMs = now() - started;

  return {
    findings: sorted,
    truncated,
    scannedFiles,
    skippedFiles,
    durationMs
  };
}

/** @deprecated Use scanDetailedInWorkers for untrusted or custom rule packs. */
export function scan(rulesDir: string, targetDir: string, options: ScanOptions = {}): Finding[] {
  return scanDetailed(rulesDir, targetDir, options).findings;
}

/** Asynchronous scan path used by the CLI and MCP server. Rule matching runs only in terminable workers. */
export async function scanDetailedInWorkers(rulesDir: string, targetDir: string, options: ScanOptions = {}): Promise<ScanResult> {
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    throw new Error(`Target must be an existing directory: ${targetDir}`);
  }
  const started = Date.now();
  const loadedRules = loadRules(rulesDir);
  const aliasMap = loadAliasMap(rulesDir);
  const enabled = options.enabledRules ? new Set(options.enabledRules.map(id => aliasMap[id] ?? id)) : null;
  const rules = enabled ? loadedRules.filter(rule => enabled.has(rule.id)) : loadedRules;
  const { files, skippedFiles } = walkDirectory(targetDir, options);
  const totalTimeoutMs = options.timeoutMs ?? 30_000;
  const remainingMs = Math.max(0, totalTimeoutMs - (Date.now() - started));
  const result = await scanFilesInWorkers(rules, files, { timeoutMs: remainingMs, workers: options.workers });
  return {
    findings: result.findings,
    truncated: result.truncated,
    scannedFiles: result.scannedFiles,
    skippedFiles,
    durationMs: Date.now() - started
  };
}

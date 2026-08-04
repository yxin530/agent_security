import * as fs from 'fs';
import * as path from 'path';
import { loadRules, Rule, DetectionCondition } from './loader';
import { formatJson, formatTerminal } from './reporter';

export interface Finding {
  ruleId: string;
  title: string;
  severity: Rule['severity'];
  category: string;
  file: string;
  line: number;
  column: number;
  message: string;
  remediation: string;
  mapsTo: Rule['maps_to'];
}

function walkFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function isText(content: Buffer): boolean {
  return !content.includes(0);
}

function matchesPattern(relativePath: string, pattern: string): boolean {
  const normalized = relativePath.split(path.sep).join('/');
  const parts = pattern.split('/');
  const expression = parts.map(part => {
    if (part === '**') return '(?:.*/)?';
    return part.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*');
  }).join('');
  const regex = '^' + expression + '$';
  return new RegExp(regex).test(normalized);
}

function conditionMatches(condition: DetectionCondition, text: string): boolean {
  let regex: RegExp;
  try {
    regex = new RegExp(condition.pattern, condition.flags ?? '');
  } catch (error) {
    throw new Error(`Invalid regex in rule condition '${condition.pattern}': ${(error as Error).message}`);
  }
  return condition.negate ? !regex.test(text) : regex.test(text);
}

function shannonEntropy(value: string): number {
  const counts = new Map<string, number>();
  for (const char of value) counts.set(char, (counts.get(char) ?? 0) + 1);
  let entropy = 0;
  for (const count of counts.values()) {
    const p = count / value.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function entropyMatches(rule: Rule, text: string): boolean {
  const check = rule.detection.entropy_check;
  if (!check) return true;
  const quoted = text.match(/["']([^"']{8,})["']/g)?.map(v => v.slice(1, -1)) ?? [];
  return quoted.some(value => check.or_prefixes.some(prefix => value.startsWith(prefix)) || shannonEntropy(value) >= check.min_bits_per_char);
}

function matchingLine(rule: Rule, lines: string[]): { line: number; column: number } | null {
  const conditions = rule.detection.conditions;
  const scope = rule.detection.scope ?? 'line';
  const logic = rule.detection.logic ?? 'AND';
  if (scope === 'file') {
    const text = lines.join('\n');
    const matched = logic === 'OR'
      ? conditions.some(c => conditionMatches(c, text))
      : conditions.every(c => conditionMatches(c, text));
    return matched && entropyMatches(rule, text) ? { line: 1, column: 1 } : null;
  }
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    const matched = logic === 'OR'
      ? conditions.some(c => conditionMatches(c, text))
      : conditions.every(c => conditionMatches(c, text));
    if (matched && entropyMatches(rule, text)) {
      const first = conditions.find(c => conditionMatches(c, text));
      const column = first ? Math.max(0, text.search(new RegExp(first.pattern, first.flags ?? ''))) + 1 : 1;
      return { line: i + 1, column };
    }
  }
  return null;
}

export function scan(rulesDir: string, targetDir: string): Finding[] {
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) throw new Error(`Target must be an existing directory: ${targetDir}`);
  const rules = loadRules(rulesDir);
  const findings: Finding[] = [];
  for (const file of walkFiles(targetDir)) {
    const raw = fs.readFileSync(file);
    if (!isText(raw)) continue;
    const extension = path.extname(file);
    const relative = path.relative(targetDir, file);
    const content = raw.toString('utf8');
    const lines = content.split(/\r?\n/);
    for (const rule of rules) {
      if (rule.scope === 'language-specific') {
        const patterns = rule.detection.file_patterns ?? [];
        if (!patterns.some(pattern => matchesPattern(relative, pattern))) continue;
      }
      const match = matchingLine(rule, lines);
      if (!match) continue;
      findings.push({ ruleId: rule.id, title: rule.title, severity: rule.severity, category: rule.category,
        file: path.relative(targetDir, file), line: match.line, column: match.column,
        message: rule.description.split('\n')[0], remediation: rule.remediation, mapsTo: rule.maps_to });
    }
  }
  return findings;
}

function arg(name: string, fallback: string): string {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

if (require.main === module) {
  const root = path.resolve(__dirname, '../..');
  const target = arg('--target', process.cwd());
  try {
    const findings = scan(arg('--rules', path.join(root, 'rules')), target);
  const format = arg('--format', 'text');
    if (format === 'json') console.log(formatJson(findings, 0));
    else console.log(findings.length === 0 ? 'No findings.' : formatTerminal(findings));
    process.exitCode = findings.length > 0 ? 1 : 0;
  } catch (error) {
    console.error((error as Error).message);
    process.exitCode = 1;
  }
}

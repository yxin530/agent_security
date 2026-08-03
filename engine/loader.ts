import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import Ajv from 'ajv';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface DetectionCondition {
  pattern: string;
  flags?: string;
  negate?: boolean;
  description?: string;
}

export interface EntropyCheck {
  min_bits_per_char: number;
  or_prefixes: string[];
}

export interface Detection {
  extensions: string[];
  conditions: DetectionCondition[];
  logic?: 'AND' | 'OR';
  scope?: 'line' | 'file';
  entropy_check?: EntropyCheck;
}

export interface MapsTo {
  owasp: string[];
  pdpa?: string;
}

export interface TestCase {
  type: 'true_positive' | 'true_negative';
  fixture: string;
  description: string;
  code?: string;
}

export interface Rule {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
  category: string;
  maps_to: MapsTo;
  detection: Detection;
  description: string;
  remediation: string;
  test_cases: TestCase[];
}

// ── Internals ─────────────────────────────────────────────────────────────────

export class LoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoadError';
  }
}

interface Violation {
  filePath: string;
  fieldPath: string;
  message: string;
}

// Load schema once — resolve from project root regardless of where compiled JS lands
// ponytail: walk up until we find rules/schema.json; handles both ts-node (src) and tsc (dist)
const schemaPath = ((): string => {
  let dir = __dirname;
  for (let i = 0; i < 3; i++) {
    const candidate = path.join(dir, 'rules', 'schema.json');
    if (fs.existsSync(candidate)) return candidate;
    dir = path.dirname(dir);
  }
  throw new Error('Cannot locate rules/schema.json from ' + __dirname);
})();
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const ajv = new Ajv();
const validate = ajv.compile(schema);

function walkYamlFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkYamlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.yaml')) {
      results.push(full);
    }
  }
  return results;
}

function processFile(
  filePath: string,
  violations: Violation[],
  parseErrors: { filePath: string; message: string }[],
  unreadable: { filePath: string; message: string }[]
): Rule | null {
  // Read
  let content: string;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e: unknown) {
    unreadable.push({ filePath, message: (e as Error).message });
    return null;
  }

  // Parse
  let doc: unknown;
  try {
    doc = yaml.load(content) as unknown;
  } catch (e: unknown) {
    parseErrors.push({ filePath, message: (e as Error).message });
    return null;
  }

  // Schema validation
  if (!validate(doc)) {
    for (const err of validate.errors ?? []) {
      violations.push({
        filePath,
        fieldPath: err.instancePath || '/',
        message: err.message ?? 'unknown',
      });
    }
    return null;
  }

  const rule = doc as Rule;

  // Programmatic: must have ≥1 true_positive and ≥1 true_negative
  if (!rule.test_cases.some(tc => tc.type === 'true_positive')) {
    violations.push({ filePath, fieldPath: 'test_cases', message: 'must contain at least one true_positive test case' });
    return null;
  }
  if (!rule.test_cases.some(tc => tc.type === 'true_negative')) {
    violations.push({ filePath, fieldPath: 'test_cases', message: 'must contain at least one true_negative test case' });
    return null;
  }

  // id-filename check
  const expectedId = path.basename(filePath, '.yaml');
  if (rule.id !== expectedId) {
    violations.push({ filePath, fieldPath: 'id', message: `expected '${expectedId}' but got '${rule.id}'` });
    return null;
  }

  return rule;
}

// ── Public API ────────────────────────────────────────────────────────────────

export function loadRules(rulesDir: string): Rule[] {
  let files: string[];
  try {
    files = walkYamlFiles(rulesDir);
  } catch {
    throw new LoadError(`rules/ directory missing or unreadable: ${rulesDir}`);
  }

  if (files.length === 0) {
    throw new LoadError(`No .yaml files found in ${rulesDir}`);
  }

  const violations: Violation[] = [];
  const parseErrors: { filePath: string; message: string }[] = [];
  const unreadable: { filePath: string; message: string }[] = [];
  const rules: Rule[] = [];

  for (const f of files) {
    const rule = processFile(f, violations, parseErrors, unreadable);
    if (rule) rules.push(rule);
  }

  const allFailures = [
    ...unreadable.map(e => `[UNREADABLE] ${e.filePath}: ${e.message}`),
    ...parseErrors.map(e => `[PARSE ERROR] ${e.filePath}: ${e.message}`),
    ...violations.map(v => `[VIOLATION] ${v.filePath}: ${v.fieldPath}: ${v.message}`),
  ];

  if (allFailures.length > 0) {
    throw new LoadError(`Rule validation failed:\n${allFailures.join('\n')}`);
  }

  return rules;
}

// ── CLI (--validate mode) ─────────────────────────────────────────────────────

if (process.argv.includes('--validate')) {
  // Resolve project root the same way as schemaPath above
  const projectRoot = ((): string => {
    let dir = __dirname;
    for (let i = 0; i < 3; i++) {
      if (fs.existsSync(path.join(dir, 'rules', 'schema.json'))) return dir;
      dir = path.dirname(dir);
    }
    throw new Error('Cannot locate project root from ' + __dirname);
  })();
  const rulesDir = path.join(projectRoot, 'rules');

  let files: string[];
  try {
    files = walkYamlFiles(rulesDir);
  } catch {
    process.stderr.write(`rules/ directory missing or unreadable: ${rulesDir}\n`);
    process.exit(1);
  }

  if (files.length === 0) {
    process.stderr.write(`No .yaml files found in ${rulesDir}\n`);
    process.exit(1);
  }

  const violations: Violation[] = [];
  const parseErrors: { filePath: string; message: string }[] = [];
  const unreadable: { filePath: string; message: string }[] = [];
  const passed: string[] = [];

  for (const f of files) {
    const rule = processFile(f, violations, parseErrors, unreadable);
    if (rule) passed.push(f);
  }

  // Print errors
  for (const e of unreadable) {
    process.stderr.write(`[UNREADABLE] ${e.filePath}: ${e.message}\n`);
  }
  for (const e of parseErrors) {
    process.stderr.write(`[PARSE ERROR] ${e.filePath}: ${e.message}\n`);
  }
  for (const v of violations) {
    process.stderr.write(`[VIOLATION] ${v.filePath}: ${v.fieldPath}: ${v.message}\n`);
  }

  const total = files.length;
  const failed = total - passed.length;
  process.stderr.write(`Validated ${total} rules: ${passed.length} passed, ${failed} failed\n`);

  process.exit(failed > 0 ? 1 : 0);
}

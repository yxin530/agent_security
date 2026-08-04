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
  file_patterns?: string[];
  conditions: DetectionCondition[];
  logic?: 'AND' | 'OR';
  scope?: 'line' | 'file';
  entropy_check?: EntropyCheck;
}

export interface MapsTo {
  owasp: string[];
  pdpa?: string;
  owasp_llm?: string;
  atlas?: string;
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
  scope: 'language-agnostic' | 'language-specific';
  maps_to: MapsTo;
  detection: Detection;
  description: string;
  remediation: string;
  test_cases: TestCase[];
}

export type AliasMap = Record<string, string>;

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

function validateAliases(rulesDir: string, rules: Rule[]): void {
  const aliasPath = path.join(rulesDir, 'aliases.json');
  if (!fs.existsSync(aliasPath)) throw new LoadError(`Missing alias map: ${aliasPath}`);
  let aliases: unknown;
  try { aliases = JSON.parse(fs.readFileSync(aliasPath, 'utf8')); }
  catch (error) { throw new LoadError(`Invalid aliases.json: ${(error as Error).message}`); }
  if (!aliases || typeof aliases !== 'object' || Array.isArray(aliases)) throw new LoadError('aliases.json must be an object');
  const ids = new Set(rules.map(rule => rule.id));
  for (const [oldId, newId] of Object.entries(aliases as AliasMap)) {
    if (typeof newId !== 'string' || !ids.has(newId)) throw new LoadError(`Alias '${oldId}' maps to missing rule '${newId}'`);
  }
}

function validateFrameworkDocs(rulesDir: string, rules: Rule[]): void {
  const docsRoot = path.join(path.dirname(rulesDir), 'docs');
  const checks: Array<[string, string, (rule: Rule) => string | undefined]> = [
    [path.join(docsRoot, 'owasp', 'web-top-10.md'), 'maps_to.owasp', rule => rule.maps_to.owasp.join(' ')],
    [path.join(docsRoot, 'owasp', 'llm-top-10.md'), 'maps_to.owasp_llm', rule => rule.maps_to.owasp_llm],
    [path.join(docsRoot, 'frameworks', 'mitre-atlas.md'), 'maps_to.atlas', rule => rule.maps_to.atlas],
  ];
  const failures: string[] = [];
  for (const [docPath, field, getValues] of checks) {
    if (!fs.existsSync(docPath)) { failures.push(`${field}: missing documentation file ${docPath}`); continue; }
    const text = fs.readFileSync(docPath, 'utf8');
    for (const rule of rules) {
      const values = getValues(rule);
      if (!values) continue;
      const individual = field === 'maps_to.owasp' ? rule.maps_to.owasp : [values];
      for (const value of individual) if (!text.includes(value)) failures.push(`${rule.id}: ${field} '${value}' missing from ${docPath}`);
    }
  }
  if (failures.length) throw new LoadError(`Framework documentation validation failed:\n${failures.join('\n')}`);
}

function validateThreatTaxonomy(rulesDir: string, rules: Rule[]): void {
  const statusPath = path.join(path.dirname(rulesDir), 'docs', 'agent-threats', 'coverage-status.md');
  if (!fs.existsSync(statusPath)) throw new LoadError(`Missing threat coverage status: ${statusPath}`);
  const status = fs.readFileSync(statusPath, 'utf8');
  for (const rule of rules) {
    const marker = `${path.basename(path.dirname(path.dirname(path.join(rulesDir, rule.id))))}`;
    if (!rule.id || !status.includes(rule.id)) {
      if (rule.category && rulesDir.includes('rules')) {
        const files = walkYamlFiles(rulesDir).filter(file => file.endsWith(`${rule.id}.yaml`));
        if (files.some(file => file.includes(`${path.sep}agent-threats${path.sep}`)) && !status.includes(rule.id)) {
          throw new LoadError(`Threat rule '${rule.id}' is missing from coverage-status.md`);
        }
      }
    }
  }
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

  if (filePath.includes(`${path.sep}agent-threats${path.sep}`) && !rule.maps_to.owasp_llm && !rule.maps_to.atlas) {
    violations.push({ filePath, fieldPath: 'maps_to', message: 'agent-threat rules require maps_to.owasp_llm or maps_to.atlas' });
    return null;
  }

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

  if (rule.scope === 'language-specific' && (!rule.detection.file_patterns || rule.detection.file_patterns.length === 0)) {
    violations.push({ filePath, fieldPath: 'detection.file_patterns', message: 'required and non-empty for language-specific rules' });
    return null;
  }
  if (rule.scope === 'language-agnostic' && rule.detection.file_patterns !== undefined) {
    violations.push({ filePath, fieldPath: 'detection.file_patterns', message: 'must be omitted for language-agnostic rules' });
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

  validateAliases(rulesDir, rules);
  validateFrameworkDocs(rulesDir, rules);
  validateThreatTaxonomy(rulesDir, rules);
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

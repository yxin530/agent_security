import * as fs from 'fs';
import * as path from 'path';
import { loadRules, Rule } from './loader';
import { scan } from './scan';

const packageRoot = path.resolve(__dirname, '../..');
const rulesDir = fs.existsSync(path.join(packageRoot, 'dist', 'rules'))
  ? path.join(packageRoot, 'dist', 'rules')
  : path.join(packageRoot, 'rules');
const fixturesDir = path.join(packageRoot, 'tests', 'fixtures');
let passed = 0;
let failed = 0;

function runCase(rule: Rule, type: 'true_positive' | 'true_negative', fixture: string): void {
  const fixturePath = path.join(fixturesDir, rule.id, fixture);
  if (!fs.existsSync(fixturePath)) throw new Error(`Missing fixture: ${fixturePath}`);
  const findings = scan(rulesDir, path.dirname(fixturePath)).filter(f => f.ruleId === rule.id && f.file === path.basename(fixturePath));
  const detected = findings.length > 0;
  const expected = type === 'true_positive';
  if (detected === expected) { passed++; console.log(`PASS ${rule.id} ${type} ${fixture}`); }
  else { failed++; console.error(`FAIL ${rule.id} ${type} ${fixture}: expected ${expected ? 'finding' : 'no finding'}`); }
}

function runAdversarial(): void {
  const root = path.join(packageRoot, 'tests', 'adversarial');
  if (!fs.existsSync(root)) return;
  let passedAdversarial = 0; let failedAdversarial = 0;
  for (const rule of loadRules(rulesDir)) {
    const dir = path.join(root, rule.id);
    if (!fs.existsSync(dir)) continue;
    for (const fixture of fs.readdirSync(dir)) {
      const findings = scan(rulesDir, dir).filter(f => f.ruleId === rule.id && f.file === fixture);
      if (findings.length === 0) { failedAdversarial++; console.error(`FAIL adversarial ${rule.id} ${fixture}`); }
      else { passedAdversarial++; console.log(`PASS adversarial ${rule.id} ${fixture}`); }
    }
  }
  console.log(`Adversarial tests: ${passedAdversarial} passed, ${failedAdversarial} failed`);
  if (failedAdversarial) failed += failedAdversarial;
}

function checkFixtureIntegrity(rule: Rule, fixture: string): void {
  if (rule.id !== 'hardcoded-secret-001') return;
  const content = fs.readFileSync(path.join(fixturesDir, rule.id, fixture), 'utf8');
  const secret = content.match(/(?:api[_-]?key|secret|password|token|credential)\s*=\s*["']([^"']{8,})["']/i)?.[1];
  if (secret && !secret.startsWith('FAKE')) throw new Error(`Fixture contains a non-FAKE secret: ${fixture}`);
}

try {
  for (const rule of loadRules(rulesDir)) {
    for (const testCase of rule.test_cases) { checkFixtureIntegrity(rule, testCase.fixture); runCase(rule, testCase.type, testCase.fixture); }
  }
  runAdversarial();
} catch (error) {
  console.error((error as Error).message);
  process.exit(1);
}
console.log(`Rule tests: ${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;

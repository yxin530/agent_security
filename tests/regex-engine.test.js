const assert = require('node:assert/strict');
const test = require('node:test');
const { createRegex, regexLintIssues } = require('../dist/matchers/regex-engine');

test('regex handle supports testing, captures, and advancing through matches', () => {
  const regex = createRegex('(token)=([A-Z]+)', 'i');
  assert.equal(regex.test('TOKEN=ABC'), true);
  const first = regex.exec('token=ABC token=DEF');
  const second = regex.exec('token=ABC token=DEF', first.index + first[0].length);
  assert.equal(first[2], 'ABC');
  assert.equal(second[2], 'DEF');
  assert.equal(regex.exec('token=ABC token=DEF', second.index + second[0].length), null);
});

test('regex lint rejects non-RE2 constructs and nested quantifiers', () => {
  assert.match(regexLintIssues('(?<=x)y')[0], /lookbehind/);
  assert.match(regexLintIssues('(a)\\1')[0], /backreferences/);
  assert.match(regexLintIssues('(a+)+')[0], /nested quantifiers/);
  assert.deepEqual(regexLintIssues('\\btoken_[A-Za-z0-9]+\\b'), []);
});


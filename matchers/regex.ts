import { Rule, DetectionCondition } from '../engine/loader';
import { createRegex, RegexHandle, RegexMatch } from './regex-engine';

export interface MatchSpan {
  line: number;
  column: number;
  endLine?: number;
  lineText: string;
}

export function shannonEntropy(value: string): number {
  if (!value || value.length === 0) return 0;
  const counts = new Map<string, number>();
  for (const char of value) counts.set(char, (counts.get(char) ?? 0) + 1);
  let entropy = 0;
  for (const count of counts.values()) {
    const p = count / value.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function checkEntropy(rule: Rule, lineText: string, match?: RegexMatch | null): boolean {
  const check = rule.detection.entropy_check;
  if (!check) return true;

  // Try captured value (group 2 if present, otherwise group 1)
  let candidateValues: string[] = [];
  if (match) {
    if (match[2]) {
      candidateValues.push(match[2]);
    } else if (match[1]) {
      candidateValues.push(match[1]);
    }
  }

  // Fallback to quoted strings inside match or line
  if (candidateValues.length === 0) {
    const textToSearch = match ? match[0] : lineText;
    const quoted = textToSearch.match(/["']([^"']{8,})["']/g)?.map(v => v.slice(1, -1)) ?? [];
    candidateValues = quoted;
  }

  if (candidateValues.length === 0) {
    // If no candidate value found, check against whole line's quoted literals
    const quoted = lineText.match(/["']([^"']{8,})["']/g)?.map(v => v.slice(1, -1)) ?? [];
    candidateValues = quoted;
  }

  return candidateValues.some(val => {
    if (check.or_prefixes && check.or_prefixes.some(p => val.startsWith(p))) {
      return true;
    }
    return shannonEntropy(val) >= check.min_bits_per_char;
  });
}

export interface CompiledCondition {
  condition: DetectionCondition;
  regex: RegexHandle;
}

export interface CompiledRuleConditions {
  conditions: CompiledCondition[];
  firstPositiveIndex: number;
}

export function compileConditions(rule: Rule): CompiledRuleConditions {
  const conditions = rule.detection.conditions || [];
  let firstPositiveIndex = -1;
  const compiled: CompiledCondition[] = conditions.map((cond, idx) => {
    let flags = cond.flags ?? '';
    // Ensure flags don't include global for simple testing
    flags = flags.replace(/[gy]/g, '');
    const regex = createRegex(cond.pattern, flags);
    if (!cond.negate && firstPositiveIndex === -1) {
      firstPositiveIndex = idx;
    }
    return { condition: cond, regex };
  });

  return { conditions: compiled, firstPositiveIndex };
}

function conditionMatches(compiledCond: CompiledCondition, text: string): boolean {
  const { condition, regex } = compiledCond;
  const matched = regex.test(text);
  return condition.negate ? !matched : matched;
}

export function matchRule(rule: Rule, content: string, compiledConds?: CompiledRuleConditions, precomputedLines?: string[]): MatchSpan[] {
  const scope = rule.detection.scope ?? 'line';
  const logic = rule.detection.logic ?? 'AND';
  const reportMode = (rule.detection as any).report ?? 'all'; // 'all' | 'first'

  const compiled = compiledConds ?? compileConditions(rule);
  const conditions = compiled.conditions;
  if (conditions.length === 0) return [];

  const results: MatchSpan[] = [];

  if (scope === 'file') {
    // File scope
    const allMatch = logic === 'OR'
      ? conditions.some(c => conditionMatches(c, content))
      : conditions.every(c => conditionMatches(c, content));

    if (!allMatch) return [];

    // Find occurrences of first positive condition
    const firstPos = compiled.firstPositiveIndex >= 0 ? conditions[compiled.firstPositiveIndex] : null;

    if (!firstPos) {
      // Pure negation rule (e.g. "missing X")
      if (checkEntropy(rule, content)) {
      const firstLine = (precomputedLines ?? content.split(/\r?\n/))[0] || '';
        results.push({ line: 1, column: 1, lineText: firstLine });
      }
      return results;
    }

    // Positive condition in file scope
    const lines = precomputedLines ?? content.split(/\r?\n/);
    const lineOffsets: number[] = [0];
    for (let i = 0; i < lines.length; i++) {
      lineOffsets.push(lineOffsets[i] + lines[i].length + 1);
    }

    function offsetToPosition(offset: number): { line: number; column: number; lineText: string } {
      let low = 0, high = lines.length - 1;
      let lineIdx = 0;
      while (low <= high) {
        const mid = (low + high) >> 1;
        if (lineOffsets[mid] <= offset) {
          lineIdx = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      const col = offset - lineOffsets[lineIdx] + 1;
      return { line: lineIdx + 1, column: col, lineText: lines[lineIdx] };
    }

    // Match all occurrences of the positive condition
    let offset = 0;
    let match: RegexMatch | null;
    let found = false;
    while ((match = firstPos.regex.exec(content, offset)) !== null) {
      const pos = offsetToPosition(match.index);
      if (checkEntropy(rule, pos.lineText, match)) {
        results.push({
          line: pos.line,
          column: pos.column,
          lineText: pos.lineText
        });
        found = true;
        if (reportMode === 'first') break;
      }
      offset = match.index + Math.max(match[0].length, 1);
    }

    if (!found && checkEntropy(rule, content)) {
      results.push({ line: 1, column: 1, lineText: lines[0] || '' });
    }

    return results;
  }

  // Line scope
  const lines = precomputedLines ?? content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const lineText = lines[i];

    const matched = logic === 'OR'
      ? conditions.some(c => conditionMatches(c, lineText))
      : conditions.every(c => conditionMatches(c, lineText));

    if (!matched) continue;

    // Find the first non-negated condition that matched to get column
    let firstMatchingCond: CompiledCondition | null = null;
    let matchExec: RegexMatch | null = null;

    for (const c of conditions) {
      if (!c.condition.negate) {
        const exec = c.regex.exec(lineText);
        if (exec) {
          firstMatchingCond = c;
          matchExec = exec;
          break;
        }
      }
    }

    if (!checkEntropy(rule, lineText, matchExec)) continue;

    const column = matchExec ? matchExec.index + 1 : 1;

    results.push({
      line: i + 1,
      column,
      lineText
    });

    if (reportMode === 'first') {
      break;
    }
  }

  return results;
}

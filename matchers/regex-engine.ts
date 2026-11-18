export interface RegexMatch {
  0: string;
  1?: string;
  2?: string;
  index: number;
  input: string;
}

export interface RegexHandle {
  test(text: string): boolean;
  exec(text: string, from?: number): RegexMatch | null;
}

type RegexConstructor = new (pattern: string, flags?: string) => RegExp;

function re2Constructor(): RegexConstructor | null {
  try {
    // Optional dependency: importing the engine must still work without RE2.
    const loaded = require('re2');
    return (loaded.default ?? loaded) as RegexConstructor;
  } catch {
    return null;
  }
}

export function createRegex(pattern: string, flags = ''): RegexHandle {
  const normalizedFlags = [...new Set(flags.replace(/[gy]/g, ''))].join('');
  if (/[^imsu]/.test(normalizedFlags)) {
    throw new Error(`Unsupported regular expression flags: ${flags}`);
  }

  const RE2 = re2Constructor();
  const Constructor = RE2 ?? RegExp;
  const tester = new Constructor(pattern, normalizedFlags);
  const global = new Constructor(pattern, `${normalizedFlags}g`);

  return {
    test(text: string): boolean {
      return tester.test(text);
    },
    exec(text: string, from = 0): RegexMatch | null {
      global.lastIndex = Math.max(0, from);
      const match = global.exec(text);
      if (!match) return null;
      return { 0: match[0], 1: match[1], 2: match[2], index: match.index, input: match.input };
    }
  };
}

export function usesRe2(): boolean {
  return re2Constructor() !== null;
}

export function regexLintIssues(pattern: string): string[] {
  const issues: string[] = [];
  if (/\(\?<([=!])/.test(pattern)) issues.push('lookbehind is not RE2-compatible');
  if (/\\(?:[1-9]|k<)/.test(pattern)) issues.push('backreferences are not RE2-compatible');
  if (/\(\?>/.test(pattern)) issues.push('atomic groups are not RE2-compatible');
  if (/(?:[*+?]|\})\+/.test(pattern)) issues.push('possessive quantifiers are not RE2-compatible');
  if (/\((?:[^()\\]|\\.)*[*+{](?:[^()\\]|\\.)*\)[*+{]/.test(pattern)) {
    issues.push('nested quantifiers may cause excessive backtracking');
  }
  return issues;
}

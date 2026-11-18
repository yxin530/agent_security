import * as crypto from 'crypto';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type Confidence = 'high' | 'medium' | 'heuristic';

export interface Finding {
  ruleId: string;
  title: string;
  severity: Severity;
  confidence?: Confidence;
  category: string;
  file: string;
  line: number;
  column: number;
  endLine?: number;
  message: string;
  remediation: string;
  fingerprint: string;
  mapsTo: {
    owasp: string[];
    owasp_2021?: string[];
    owasp_llm?: string[];
    owasp_agentic?: string[];
    atlas?: string | null;
    pdpa?: string;
    cwe?: string[];
    mitre_attack?: string;
  };
  detectionTier: string;
  source: 'static' | 'runtime';
  snippet?: string;
}

export function normalizePathPosix(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

export function computeFingerprint(ruleId: string, relPath: string, lineText: string): string {
  const normPath = normalizePathPosix(relPath);
  const trimmed = lineText.trim();
  const data = `${ruleId}\0${normPath}\0${trimmed}`;
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex').slice(0, 16);
}

export function deduplicateFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  const deduped: Finding[] = [];
  for (const f of findings) {
    const key = `${f.ruleId}:${normalizePathPosix(f.file)}:${f.line}:${f.column}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(f);
    }
  }
  return deduped;
}

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const fileA = normalizePathPosix(a.file);
    const fileB = normalizePathPosix(b.file);
    if (fileA !== fileB) return fileA.localeCompare(fileB);
    if (a.line !== b.line) return a.line - b.line;
    if (a.column !== b.column) return a.column - b.column;
    return a.ruleId.localeCompare(b.ruleId);
  });
}

import { Finding } from './scan';

const order: Finding['severity'][] = ['critical', 'high', 'medium', 'low', 'informational'];

export function formatJson(findings: Finding[], scannedFiles: number): string {
  if (findings.length < 0) throw new Error('findingsCount cannot be negative');
  return JSON.stringify({
    scannedFiles,
    findingsCount: findings.length,
    findings,
    timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  }, null, 2);
}

export function formatTerminal(findings: Finding[]): string {
  return [...findings].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity))
    .map(f => `[${f.severity.toUpperCase()}] ${f.title} / File: ${f.file}:${f.line} / Fix: ${f.remediation}`)
    .join('\n');
}

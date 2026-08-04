import { loadRules, Rule } from '../engine/loader';
import { Finding } from '../engine/scan';

export interface RuntimeEvent { type: 'tool-call' | 'llm-input' | 'llm-output'; data: string; }

/** Explicit opt-in helper. The caller supplies live events; this module never starts instrumentation or network activity. */
export function inspectRuntimeEvent(rulesDir: string, event: RuntimeEvent): Finding[] {
  const findings: Finding[] = [];
  for (const rule of loadRules(rulesDir)) {
    const conditions = rule.detection.conditions;
    const matches = conditions.map(condition => {
      const matched = new RegExp(condition.pattern, condition.flags ?? '').test(event.data);
      return condition.negate ? !matched : matched;
    });
    const hit = (rule.detection.logic ?? 'AND') === 'OR' ? matches.some(Boolean) : matches.every(Boolean);
    if (!hit) continue;
    findings.push({ ruleId: rule.id, title: rule.title, severity: rule.severity, category: rule.category,
      file: '<runtime>', line: 1, column: 1, message: rule.description.split('\n')[0], remediation: rule.remediation,
      mapsTo: rule.maps_to, detectionTier: rule.detection_tier, source: 'runtime' });
  }
  return findings;
}

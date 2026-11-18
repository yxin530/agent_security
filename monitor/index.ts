import { loadRules, Rule } from '../engine/loader';
import { Finding } from '../engine/scan';
import { computeFingerprint } from '../core/findings';
import { toolCallEventSchema } from './schemas/tool-call.schema';
import { llmInputEventSchema } from './schemas/llm-input.schema';
import { llmOutputEventSchema } from './schemas/llm-output.schema';
import { detectMalaysianIC, detectMalaysianPhone } from './validators';

export { detectMalaysianIC, detectMalaysianPhone } from './validators';

export interface RuntimeEvent { type: 'tool-call' | 'llm-input' | 'llm-output'; data: string; }

/** Explicit opt-in helper. The caller supplies live events; this module never starts instrumentation or network activity. */
export function validateRuntimeEvent(eventType: RuntimeEvent['type'], data: string): void {
  let parsed: unknown;
  try { parsed = JSON.parse(data); } catch { throw new Error('malformed JSON runtime event'); }
  const schema = eventType === 'tool-call' ? toolCallEventSchema : eventType === 'llm-input' ? llmInputEventSchema : llmOutputEventSchema;
  const result = schema.safeParse(parsed);
  if (!result.success) throw new Error('invalid runtime event shape');
}

export function inspectRuntimeEvent(rulesDir: string, event: RuntimeEvent, ruleIds?: string[]): Finding[] {
  validateRuntimeEvent(event.type, event.data);
  const findings: Finding[] = [];
  for (const rule of loadRules(rulesDir)) {
    if (!rule.runtime) continue;
    if (ruleIds && !ruleIds.includes(rule.id)) continue;
    const conditions = rule.detection.conditions;
    const matches = conditions.map(condition => {
      const matched = new RegExp(condition.pattern, condition.flags ?? '').test(event.data);
      return condition.negate ? !matched : matched;
    });
    const hit = (rule.detection.logic ?? 'AND') === 'OR' ? matches.some(Boolean) : matches.every(Boolean);
    if (!hit) continue;

    const fp = computeFingerprint(rule.id, '<runtime>', event.data);
    findings.push({
      ruleId: rule.id,
      title: rule.title,
      severity: rule.severity,
      confidence: (rule as any).confidence ?? 'high',
      category: rule.category,
      file: '<runtime>',
      line: 1,
      column: 1,
      message: rule.description.split('\n')[0],
      remediation: rule.remediation,
      fingerprint: fp,
      mapsTo: rule.maps_to,
      detectionTier: rule.detection_tier,
      source: 'runtime'
    });
  }

  if (event.type === 'llm-output' && (!ruleIds || ruleIds.includes('pii-leakage-in-output'))) {
    try {
      const parsed = JSON.parse(event.data);
      const content = parsed.content || '';

      const matchedTypes: string[] = [];
      if (detectMalaysianIC(content)) {
        matchedTypes.push('Malaysian IC');
      }
      if (detectMalaysianPhone(content)) {
        matchedTypes.push('Phone Number');
      }
      if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(content)) {
        matchedTypes.push('Email Address');
      }

      if (matchedTypes.length > 0) {
        const fp = computeFingerprint('pii-leakage-in-output', '<runtime>', content);
        findings.push({
          ruleId: 'pii-leakage-in-output',
          title: 'PII Leakage in LLM Output',
          severity: 'medium',
          confidence: 'heuristic',
          category: 'model-abuse',
          file: '<runtime>',
          line: 1,
          column: 1,
          message: `Detected PII patterns in LLM output: ${matchedTypes.join(', ')} (PDPA Section 9 data-integrity principle)`,
          remediation: 'Ensure LLM output is scrubbed of PII before being exposed or stored.',
          fingerprint: fp,
          mapsTo: { owasp: ['A02:2021'], owasp_llm: ['LLM02:2025'], pdpa: 'Section 9' },
          detectionTier: 'regex',
          source: 'runtime'
        });
      }
    } catch {
      // Ignored: invalid JSON should have been caught by validateRuntimeEvent
    }
  }

  return findings;
}

import { loadRules, Rule } from '../engine/loader';
import { Finding } from '../engine/scan';
import { toolCallEventSchema } from './schemas/tool-call.schema';
import { llmInputEventSchema } from './schemas/llm-input.schema';
import { llmOutputEventSchema } from './schemas/llm-output.schema';

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
    if (ruleIds && !ruleIds.includes(rule.id)) continue;
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

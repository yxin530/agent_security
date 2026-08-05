export type RedactionLevel = 'KEEP' | 'PARTIAL' | 'FIELD_AWARE' | 'FULL';
export const REDACTION_POLICY: Record<string, Record<string, RedactionLevel>> = {
  scan_project: { target: 'PARTIAL', rulesPath: 'PARTIAL', format: 'KEEP' },
  inspect_runtime_event: { eventType: 'KEEP', eventData: 'FIELD_AWARE', ruleIds: 'KEEP' },
  get_rule: { ruleId: 'KEEP' }, list_rules: {}, validate_rules: {},
};
export function partialPath(value: unknown): unknown { if (typeof value !== 'string') return '[redacted]'; const parts = value.split(/[\\/]/); return `***/${parts[parts.length - 1]}`; }
export function redactFieldAware(value: unknown): unknown {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '[redacted]';
  const output: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === 'name' || key === 'type' || key === 'timestamp' || key === 'tool') output[key] = child;
    else if (key === 'args' && child && typeof child === 'object' && !Array.isArray(child)) output[key] = Object.fromEntries(Object.keys(child as object).map(k => [k, '[redacted]']));
    else output[key] = '[redacted]';
  }
  return output;
}
export function redactInput(tool: string, input: unknown): unknown {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return '[redacted]';
  const policy = REDACTION_POLICY[tool] ?? {};
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const level = policy[key] ?? 'FULL';
    output[key] = level === 'KEEP' ? value : level === 'PARTIAL' ? partialPath(value) : level === 'FIELD_AWARE' ? redactFieldAware(value) : '[redacted]';
  }
  return output;
}

import { inspectRuntimeEvent } from '../../monitor';
import { McpConfig } from '../config';
import { result } from './common';
export function inspectRuntimeEventTool(args: { eventType: 'tool_call' | 'llm_input' | 'llm_output'; eventData: Record<string, unknown>; ruleIds?: string[] }, config: McpConfig) {
  const data = JSON.stringify({ ...args.eventData, type: args.eventType });
  if (Buffer.byteLength(data, 'utf8') > config.maxEventBytes) throw new Error('runtime event exceeds configured size limit');
  const findings = inspectRuntimeEvent(config.ruleDirectory, { type: args.eventType === 'tool_call' ? 'tool-call' : args.eventType === 'llm_input' ? 'llm-input' : 'llm-output', data }, args.ruleIds);
  const filtered = args.ruleIds ? findings.filter(f => args.ruleIds?.includes(f.ruleId)) : findings;
  return result({ findings: filtered, findingsCount: filtered.length });
}

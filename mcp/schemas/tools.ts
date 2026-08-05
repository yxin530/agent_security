import { z } from 'zod';

export const scanProjectInput = { type: 'object', additionalProperties: false, properties: { target: { type: 'string', minLength: 1, maxLength: 4096 }, rulesPath: { type: 'string', maxLength: 4096 }, format: { type: 'string', enum: ['json', 'terminal'] } }, required: ['target'] };
export const runtimeInput = { type: 'object', additionalProperties: false, properties: { eventType: { type: 'string', enum: ['tool_call', 'llm_input', 'llm_output'] }, eventData: { type: 'object', maxProperties: 100 }, ruleIds: { type: 'array', items: { type: 'string' }, maxItems: 100 } }, required: ['eventType', 'eventData'] };
export const ruleInput = { type: 'object', additionalProperties: false, properties: { ruleId: { type: 'string', pattern: '^[a-z0-9-]+$' } }, required: ['ruleId'] };
export const scanProjectZod = { target: z.string().min(1).max(4096), rulesPath: z.string().max(4096).optional(), format: z.enum(['json', 'terminal']).optional() };
export const runtimeZod = { eventType: z.enum(['tool_call', 'llm_input', 'llm_output']), eventData: z.record(z.unknown()), ruleIds: z.array(z.string()).max(100).optional() };
export const ruleZod = { ruleId: z.string().regex(/^[a-z0-9-]+$/) };

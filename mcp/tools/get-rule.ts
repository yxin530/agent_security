import { loadRules } from '../../engine/loader';
import { McpConfig } from '../config';
import { result } from './common';
export function getRule(args: { ruleId: string }, config: McpConfig) { const rule = loadRules(config.ruleDirectory).find(item => item.id === args.ruleId); if (!rule) throw new Error('rule was not found'); return result({ rule }); }

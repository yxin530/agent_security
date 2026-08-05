import { loadRules } from '../../engine/loader';
import { McpConfig } from '../config';
import { result } from './common';
import { rulesetVersion } from './version';
export function getRule(args: { ruleId: string }, config: McpConfig) { const rule = loadRules(config.ruleDirectory).find(item => item.id === args.ruleId && (!config.enabledRules || config.enabledRules.includes(item.id))); if (!rule) throw new Error('rule was not found'); return result({ rulesetVersion: rulesetVersion(), rule }); }

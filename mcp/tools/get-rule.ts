import { loadRules, resolveRuleId } from '../../engine/loader';
import { McpConfig } from '../config';
import { result } from './common';
import { rulesetVersion } from './version';
export function getRule(args: { ruleId: string }, config: McpConfig) {
  const ruleId = resolveRuleId(config.ruleDirectory, args.ruleId);
  const enabledRuleIds = config.enabledRules?.map(id => resolveRuleId(config.ruleDirectory, id));
  const rule = loadRules(config.ruleDirectory).find(item => item.id === ruleId && (!enabledRuleIds || enabledRuleIds.includes(item.id)));
  if (!rule) throw new Error('rule was not found');
  return result({ rulesetVersion: rulesetVersion(), rule });
}

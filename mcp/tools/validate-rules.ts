import { loadRules } from '../../engine/loader';
import { McpConfig } from '../config';
import { result } from './common';
import { rulesetVersion } from './version';
export function validateRules(config: McpConfig) { const rules = loadRules(config.ruleDirectory).filter(rule => !config.enabledRules || config.enabledRules.includes(rule.id)); return result({ rulesetVersion: rulesetVersion(), valid: true, ruleCount: rules.length }); }

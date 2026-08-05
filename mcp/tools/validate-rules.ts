import { loadRules } from '../../engine/loader';
import { McpConfig } from '../config';
import { result } from './common';
export function validateRules(config: McpConfig) { const rules = loadRules(config.ruleDirectory); return result({ valid: true, ruleCount: rules.length }); }

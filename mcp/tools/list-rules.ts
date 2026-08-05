import { loadRules } from '../../engine/loader';
import { McpConfig } from '../config';
import { result } from './common';
import { rulesetVersion } from './version';
export function listRules(config: McpConfig) { const rules = loadRules(config.ruleDirectory).filter(rule => !config.enabledRules || config.enabledRules.includes(rule.id)); return result({ rulesetVersion: rulesetVersion(), rules: rules.map(rule => ({ id: rule.id, title: rule.title, severity: rule.severity, category: rule.category, detectionTier: rule.detection_tier, mapsTo: rule.maps_to })) }); }

import { loadRules } from '../../engine/loader';
import { McpConfig } from '../config';
import { result } from './common';
export function listRules(config: McpConfig) { return result({ rules: loadRules(config.ruleDirectory).map(rule => ({ id: rule.id, title: rule.title, severity: rule.severity, category: rule.category, detectionTier: rule.detection_tier, mapsTo: rule.maps_to })) }); }

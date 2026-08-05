import { loadRules } from '../../engine/loader';
import { McpConfig } from '../config';
export function ruleListText(config: McpConfig): string { return JSON.stringify(loadRules(config.ruleDirectory).map(r => ({ id: r.id, severity: r.severity, category: r.category, detectionTier: r.detection_tier, mapsTo: r.maps_to })), null, 2); }
export function ruleText(config: McpConfig, ruleId: string): string { const rule = loadRules(config.ruleDirectory).find(r => r.id === ruleId); if (!rule) throw new Error('rule was not found'); return JSON.stringify(rule, null, 2); }

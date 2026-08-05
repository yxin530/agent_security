import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_LIMITS, Limits } from './security/limits';

export interface McpConfig extends Limits {
  ruleDirectory: string;
  rulesPath?: string;
  allowedScanRoots: string[];
  enabledTools: string[];
  enabledRules: string[] | null;
  loggingLevel: 'silent' | 'info' | 'debug' | 'audit';
  auditLogPath?: string;
  redactionEnabled: boolean;
}

const ALL_TOOLS = ['scan_project', 'list_rules', 'get_rule', 'validate_rules', 'inspect_runtime_event'];

export function loadConfig(): McpConfig {
  const configPath = process.env.AGENT_SECURITY_MCP_CONFIG ?? path.resolve(process.cwd(), 'mcp.config.json');
  let file: Partial<McpConfig> = {};
  if (fs.existsSync(configPath)) file = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const root = path.resolve(__dirname, '..');
  const configuredRoots = file.allowedScanRoots ?? (process.env.AGENT_SECURITY_MCP_ALLOWED_ROOTS?.split(path.delimiter).filter(Boolean) ?? []);
  if (configuredRoots.length === 0) throw new Error('MCP server requires explicit allowedScanRoots configuration');
  return {
    ruleDirectory: path.resolve(file.rulesPath ?? file.ruleDirectory ?? path.join(root, 'rules')),
    rulesPath: file.rulesPath ? path.resolve(file.rulesPath) : undefined,
    allowedScanRoots: configuredRoots.map(value => fs.realpathSync(path.resolve(value))),
    maxScanSizeBytes: file.maxScanSizeBytes ?? DEFAULT_LIMITS.maxScanSizeBytes,
    scanTimeoutMs: file.scanTimeoutMs ?? DEFAULT_LIMITS.scanTimeoutMs,
    maxEventBytes: file.maxEventBytes ?? DEFAULT_LIMITS.maxEventBytes,
    enabledTools: file.enabledTools ?? ALL_TOOLS,
    enabledRules: file.enabledRules ?? null,
    loggingLevel: file.loggingLevel ?? 'info',
    auditLogPath: file.auditLogPath ? path.resolve(file.auditLogPath) : undefined,
    redactionEnabled: file.redactionEnabled ?? true,
  };
}

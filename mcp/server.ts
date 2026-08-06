import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config';
import { scanProjectZod, runtimeZod, ruleZod } from './schemas/tools';
import { scanProject } from './tools/scan-project';
import { inspectRuntimeEventTool } from './tools/inspect-runtime-event';
import { listRules } from './tools/list-rules';
import { getRule } from './tools/get-rule';
import { validateRules } from './tools/validate-rules';
import { errorResult } from './tools/common';
import { coverageText } from './resources/coverage-resource';
import { documentationText } from './resources/docs-resource';
import { ruleListText, ruleText } from './resources/rules-resource';
import { safeError } from './security/redaction';
import { writeAudit } from './logging/audit-log';
import { diagnostic } from './logging/diagnostics';
import { RateLimiter } from './security/rate-limit';

export function createServer(config = loadConfig()): McpServer {
  if (config.rulesPath) {
    const builtIn = ['unrestricted-filesystem-access-001','unrestricted-shell-exec-001','missing-tool-arg-validation-001','missing-tool-auth-001','missing-destructive-action-confirmation-001','excessive-tool-permissions-001','unbounded-tool-output-001','tool-ssrf-001','sensitive-data-in-resources-001','unsafe-server-instructions-001','missing-audit-logging-001','missing-tool-rate-limiting-001','tool-description-prompt-injection-001'];
    const loaded = new Set(require('../engine/loader').loadRules(config.ruleDirectory).map((r: { id: string }) => r.id));
    const missing = builtIn.filter(id => !loaded.has(id));
    if (missing.length) diagnostic(`${missing.length} built-in MCP rules are not loaded because a custom rulesPath is active`);
  }
  const server = new McpServer({ name: 'agent-security', version: '0.9.0' }, { capabilities: { tools: {}, resources: {} } });
  
  if (config.allowedClientIds && config.allowedClientIds.length > 0) {
    const clientId = process.env.X_AGENT_ID || process.env.MCP_CLIENT_ID;
    if (!clientId || !config.allowedClientIds.includes(clientId)) {
      throw new Error("client not authorized");
    }
  }

  const rateLimiter = config.scanRateLimitPerMinute ? new RateLimiter(config.scanRateLimitPerMinute) : null;
  const currentClientId = process.env.X_AGENT_ID || process.env.MCP_CLIENT_ID || 'anonymous';

  const wrap = (name: string, fn: (args: any) => any) => async (args: any) => { 
    if (name === 'scan_project' && rateLimiter && !rateLimiter.checkLimit(currentClientId)) {
      return errorResult('rate limit exceeded');
    }
    const started = Date.now(); try { const response = fn(args); writeAudit(config, { tool: name, input: args, outcome: 'success', durationMs: Date.now() - started }); return response; } catch (error) { writeAudit(config, { tool: name, input: args, outcome: 'error', durationMs: Date.now() - started }); return errorResult(safeError(error)); } };
  const enabled = (name: string) => config.enabledTools.includes(name);
  if (enabled('scan_project')) server.registerTool('scan_project', { description: 'Scan an allowed project for security findings.', inputSchema: scanProjectZod }, wrap('scan_project', (args) => scanProject(args, config)));
  if (enabled('inspect_runtime_event')) server.registerTool('inspect_runtime_event', { description: 'Inspect one runtime event for security findings.', inputSchema: runtimeZod }, wrap('inspect_runtime_event', (args) => inspectRuntimeEventTool(args, config)));
  if (enabled('list_rules')) server.registerTool('list_rules', { description: 'List available security rules.', inputSchema: {} }, wrap('list_rules', () => listRules(config)));
  if (enabled('get_rule')) server.registerTool('get_rule', { description: 'Get one security rule.', inputSchema: ruleZod }, wrap('get_rule', (args) => getRule(args, config)));
  if (enabled('validate_rules')) server.registerTool('validate_rules', { description: 'Validate the configured rule set.', inputSchema: {} }, wrap('validate_rules', () => validateRules(config)));
  if (config.loggingLevel === 'audit') diagnostic('audit logging is enabled');
  server.registerResource('rules', 'security://rules', { description: 'Security rule summaries', mimeType: 'application/json' }, async () => ({ contents: [{ uri: 'security://rules', mimeType: 'application/json', text: ruleListText(config) }] }));
  server.registerResource('coverage', 'security://coverage', { description: 'Agent threat coverage', mimeType: 'text/markdown' }, async () => ({ contents: [{ uri: 'security://coverage', mimeType: 'text/markdown', text: coverageText() }] }));
  server.registerResource('rule', new ResourceTemplate('security://rules/{ruleId}', { list: undefined }), { description: 'Security rule details', mimeType: 'application/json' }, async (uri, variables) => ({ contents: [{ uri: uri.href, mimeType: 'application/json', text: ruleText(config, String(variables.ruleId)) }] }));
  server.registerResource('documentation', new ResourceTemplate('security://documentation/{document}', { list: undefined }), { description: 'Allowlisted project documentation', mimeType: 'text/markdown' }, async (uri, variables) => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: documentationText(String(variables.document)) }] }));
  return server;
}

if (require.main === module) {
  createServer().connect(new StdioServerTransport()).catch(error => { console.error(safeError(error)); process.exitCode = 1; });
}

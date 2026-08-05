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

export function createServer(config = loadConfig()): McpServer {
  const server = new McpServer({ name: 'agent-security', version: '0.9.0' }, { capabilities: { tools: {}, resources: {} } });
  const wrap = (fn: (args: any) => any) => async (args: any) => { try { return fn(args); } catch (error) { return errorResult(safeError(error)); } };
  const enabled = (name: string) => config.enabledTools.includes(name);
  if (enabled('scan_project')) server.registerTool('scan_project', { description: 'Scan an allowed project for security findings.', inputSchema: scanProjectZod }, wrap((args) => scanProject(args, config)));
  if (enabled('inspect_runtime_event')) server.registerTool('inspect_runtime_event', { description: 'Inspect one runtime event for security findings.', inputSchema: runtimeZod }, wrap((args) => inspectRuntimeEventTool(args, config)));
  if (enabled('list_rules')) server.registerTool('list_rules', { description: 'List available security rules.', inputSchema: {} }, wrap(() => listRules(config)));
  if (enabled('get_rule')) server.registerTool('get_rule', { description: 'Get one security rule.', inputSchema: ruleZod }, wrap((args) => getRule(args, config)));
  if (enabled('validate_rules')) server.registerTool('validate_rules', { description: 'Validate the configured rule set.', inputSchema: {} }, wrap(() => validateRules(config)));
  server.registerResource('rules', 'security://rules', { description: 'Security rule summaries', mimeType: 'application/json' }, async () => ({ contents: [{ uri: 'security://rules', mimeType: 'application/json', text: ruleListText(config) }] }));
  server.registerResource('coverage', 'security://coverage', { description: 'Agent threat coverage', mimeType: 'text/markdown' }, async () => ({ contents: [{ uri: 'security://coverage', mimeType: 'text/markdown', text: coverageText() }] }));
  server.registerResource('rule', new ResourceTemplate('security://rules/{ruleId}', { list: undefined }), { description: 'Security rule details', mimeType: 'application/json' }, async (uri, variables) => ({ contents: [{ uri: uri.href, mimeType: 'application/json', text: ruleText(config, String(variables.ruleId)) }] }));
  server.registerResource('documentation', new ResourceTemplate('security://documentation/{document}', { list: undefined }), { description: 'Allowlisted project documentation', mimeType: 'text/markdown' }, async (uri, variables) => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: documentationText(String(variables.document)) }] }));
  return server;
}

if (require.main === module) {
  createServer().connect(new StdioServerTransport()).catch(error => { console.error(safeError(error)); process.exitCode = 1; });
}

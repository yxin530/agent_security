const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const Ajv = require('ajv');
const { listRules } = require('../../dist/mcp/tools/list-rules');
const { getRule } = require('../../dist/mcp/tools/get-rule');
const { validateRules } = require('../../dist/mcp/tools/validate-rules');
const { scanProject } = require('../../dist/mcp/tools/scan-project');
const { inspectRuntimeEventTool } = require('../../dist/mcp/tools/inspect-runtime-event');

const config = { ruleDirectory: path.resolve(__dirname, '../../rules'), allowedScanRoots: [path.resolve(__dirname, '../..')], maxScanSizeBytes: 50000000, scanTimeoutMs: 30000, maxEventBytes: 1000000, enabledRules: null, loggingLevel: 'silent', redactionEnabled: true };
const ajv = new Ajv();
function check(file, value) { const schema = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../mcp/schemas', file), 'utf8')); const valid = ajv.validate(schema, value); assert.equal(valid, true, ajv.errorsText()); }
function structured(response) { return response.structuredContent; }

test('MCP tool output contracts match published schemas', () => {
  check('list-rules-output.schema.json', structured(listRules(config)));
  check('get-rule-output.schema.json', structured(getRule({ ruleId: 'hardcoded-secret-001' }, config)));
  check('validate-rules-output.schema.json', structured(validateRules(config)));
  check('scan-project-output.schema.json', structured(scanProject({ target: path.resolve(__dirname, '../fixtures/hardcoded-secret-001') , format: 'json' }, config)));
  check('inspect-runtime-event-output.schema.json', structured(inspectRuntimeEventTool({ eventType: 'tool_call', eventData: { name: 'exec', args: { command: 'rm -rf /tmp/x' }, timestamp: '2026-08-05T00:00:00Z' } }, config)));
});

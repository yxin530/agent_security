const assert = require('node:assert/strict');
const test = require('node:test');
const { redactInput, partialPath } = require('../../dist/mcp/logging/redaction-rules');
const { safeError } = require('../../dist/mcp/security/redaction');
test('partial path redaction preserves basename', () => { assert.equal(partialPath('/home/user/.ssh/id_rsa'), '***/id_rsa'); });
test('field-aware redaction preserves safe keys and masks values', () => { const value = redactInput('inspect_runtime_event', { eventType: 'tool_call', eventData: { type: 'tool_call', name: 'exec', args: { command: 'secret' }, content: 'private' } }); assert.equal(value.eventType, 'tool_call'); assert.equal(value.eventData.name, 'exec'); assert.equal(value.eventData.args.command, '[redacted]'); assert.equal(value.eventData.content, '[redacted]'); });
test('unknown fields fail closed', () => { assert.equal(redactInput('get_rule', { ruleId: 'x', unknown: 'secret' }).unknown, '[redacted]'); });
test('safeError redacts detailed path-bearing errors', () => { assert.equal(safeError(new Error('Target must be an existing directory: /Users/example/secret-project')), 'request failed'); });
test('safeError preserves allowlisted policy errors', () => { assert.equal(safeError(new Error('target path is outside allowed scan roots')), 'target path is outside allowed scan roots'); });

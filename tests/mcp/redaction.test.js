const assert = require('node:assert/strict');
const test = require('node:test');
const { redactInput, partialPath } = require('../../dist/mcp/logging/redaction-rules');
test('partial path redaction preserves basename', () => { assert.equal(partialPath('/home/user/.ssh/id_rsa'), '***/id_rsa'); });
test('field-aware redaction preserves safe keys and masks values', () => { const value = redactInput('inspect_runtime_event', { eventType: 'tool_call', eventData: { type: 'tool_call', name: 'exec', args: { command: 'secret' }, content: 'private' } }); assert.equal(value.eventType, 'tool_call'); assert.equal(value.eventData.name, 'exec'); assert.equal(value.eventData.args.command, '[redacted]'); assert.equal(value.eventData.content, '[redacted]'); });
test('unknown fields fail closed', () => { assert.equal(redactInput('get_rule', { ruleId: 'x', unknown: 'secret' }).unknown, '[redacted]'); });

import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
export function result(value: unknown): CallToolResult { return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }], structuredContent: value as Record<string, unknown> }; }
export function errorResult(message: string): CallToolResult { return { isError: true, content: [{ type: 'text', text: message }] }; }

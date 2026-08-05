# Client configuration

Create `mcp.config.json` with explicit roots:

```json
{"allowedScanRoots":["/absolute/path/to/projects"],"redactionEnabled":true}
```

Register the binary in the MCP server section of Claude Desktop/Claude Code, Codex, or Cursor:

```json
{"command":"/absolute/path/to/node_modules/.bin/agent-security-mcp","env":{"AGENT_SECURITY_MCP_CONFIG":"/absolute/path/to/mcp.config.json"}}
```

The exact surrounding key is client-specific; the command and environment values are the same.

# MCP tools

Tools are request/response operations. `inspect_runtime_event` accepts exactly one event; use `agent-security-monitor` for streams or batches.

- `scan_project({"target":"/allowed/project","format":"json"})` returns versioned findings, severity summary, scan metadata, warnings, and rule metadata.
- `inspect_runtime_event({"eventType":"tool_call","eventData":{"name":"exec","args":{}}})` returns runtime findings.
- `list_rules({})` returns rule summaries.
- `get_rule({"ruleId":"hardcoded-secret-001"})` returns rule details.
- `validate_rules({})` validates the configured rule set.

All tool contracts are maintained under `mcp/schemas/`.

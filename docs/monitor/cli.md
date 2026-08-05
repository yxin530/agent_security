# Runtime monitor CLI

The monitor is opt-in and reads newline-delimited JSON events. It does not instrument an application or send data over the network.

Configure GitHub Packages first:

```ini
@yxin530:registry=https://npm.pkg.github.com
```

Run a captured event log:

```bash
agent-security-monitor --input tests/fixtures/runtime/tool-call.ndjson --format json

Supported event examples:

```json
{"type":"tool_call","name":"exec","args":{"command":"date"},"timestamp":"2026-08-05T00:00:00Z"}
{"type":"llm_input","content":"Summarize this document","timestamp":"2026-08-05T00:00:00Z"}
{"type":"llm_output","content":"Summary...","timestamp":"2026-08-05T00:00:00Z","model":"example"}
```

Use `--rules rule-id-1,rule-id-2` to restrict evaluation. Input may also be a JSON array; output remains newline-delimited findings.
```

Use `--input -` or omit `--input` to read stdin. Invalid or unknown events are warned to stderr and skipped. Exit code 1 means at least one runtime finding was emitted.

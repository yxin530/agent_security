# Runtime monitor CLI

The monitor is opt-in and reads newline-delimited JSON events. It does not instrument an application or send data over the network.

Configure GitHub Packages first:

```ini
@yxin530:registry=https://npm.pkg.github.com
```

Run a captured event log:

```bash
agent-security-monitor --input tests/fixtures/runtime/tool-call.ndjson --format json
```

Use `--input -` or omit `--input` to read stdin. Invalid or unknown events are warned to stderr and skipped. Exit code 1 means at least one runtime finding was emitted.

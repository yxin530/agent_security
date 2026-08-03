# PDPA security audit

This skill wraps these six rules through the deterministic engine: `hardcoded-secret-001`, `sql-injection-001`, `wildcard-cors-001`, `missing-rate-limit-001`, `pii-in-logs-001`, and `missing-breach-log-001`. It does not add detection logic.

Run from the project root:

```bash
npm run scan -- --target <path>
```

Do not fabricate findings. Report only what the engine emits. You may explain a reported finding, prioritize it, and suggest a fix, but a suspected issue not reported by the engine must be described as a proposal for a new or improved rule.

For each finding, include the rule ID, severity, file and line, a plain-language risk, the vulnerable snippet, a corrected snippet, remediation, and any `maps_to` values. When `maps_to.pdpa` is present, cite `docs/legal/pdpa-mapping.md`. Treat legal mappings as engineering references, not legal advice. Use “data controller” and “PDPA (as amended by the 2024 Amendment Act)”. Do not perform checks beyond these six rules.

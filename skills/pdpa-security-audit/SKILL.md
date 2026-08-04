# PDPA security audit

This skill wraps the deterministic rules in `rules/`, including the language variants listed in the README. It does not add detection logic.

Run from the project root:

```bash
npm run scan -- --target <path>
```

Do not fabricate findings. Report only what the engine emits. You may explain a reported finding, prioritize it, and suggest a fix, but a suspected issue not reported by the engine must be described as a proposal for a new or improved rule.

For each finding, include the rule ID, severity, file and line, a plain-language risk, the vulnerable snippet, a corrected snippet, remediation, and any `maps_to` values. When `maps_to.pdpa` is present, cite `docs/legal/pdpa-mapping.md`. Treat legal mappings as engineering references, not legal advice. Use “data controller” and “PDPA (as amended by the 2024 Amendment Act)”. Do not perform checks beyond the rules emitted by this engine.

# General security audit

This skill wraps the published `agent-security-engine` package and reports only findings emitted by its appsec and agent-threat rules.

Run:

```bash
npx agent-security-engine scan --target <path>
```

If the package is not installed, `npx` may fetch it once at install time; the scan itself runs offline. Do not fabricate findings. Report only what the engine emits.

For each finding, include the rule ID, severity, file and line, plain-language risk, vulnerable snippet, corrected snippet, remediation, and OWASP/OWASP LLM/MITRE ATLAS mappings when present. Omit PDPA seksyen references entirely. This skill contains no detection logic and must not add checks beyond engine output.

# Agent Security Engine

Deterministic, tested security rules and AI-agent skills for Malaysian developers building SaaS and web applications with AI coding agents.

The project uses a hybrid design:

- YAML rules are the detection source of truth.
- The TypeScript engine evaluates rules without an LLM or network call.
- Skills tell AI coding agents how to run the engine and explain emitted findings.

## Install and run

```bash
npm ci
npm run scan -- --target <path>
npm run validate:rules
npm run test:rules
```

The scanner exits with code 0 when no findings are emitted and code 1 when findings are present. Use `--format json` for structured output.

## Rules

| Rule | Severity | OWASP | PDPA mapping |
|---|---|---|---|
| `hardcoded-secret-001` | critical | A07:2021 | Section 25 |
| `sql-injection-001` | high | A03:2021 | — |
| `wildcard-cors-001` | high | A05:2021 | — |
| `missing-rate-limit-001` | medium | A04:2021 | — |
| `pii-in-logs-001` | high | A09:2021 | Section 9 |
| `missing-breach-log-001` | medium | A09:2021 | Section 12B |

Read the [PDPA mapping notes](docs/legal/pdpa-2024-mapping.md) and the [PDPA security audit skill](skills/pdpa-security-audit/SKILL.md) before relying on legal mappings or agent-generated explanations.

This is a security review aid, not legal advice. The v0.1 engine is regex-based and intentionally limited to JavaScript and TypeScript targets except where a rule explicitly supports Python.

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
| `sql-injection-js-001`, `sql-injection-php-001`, `sql-injection-go-001` | high | A03:2021 | — |
| `wildcard-cors-js-001`, `wildcard-cors-php-001`, `wildcard-cors-go-001` | high | A05:2021 | — |
| `missing-rate-limit-js-001`, `missing-rate-limit-php-001`, `missing-rate-limit-go-001` | medium | A04:2021 | — |
| `pii-pattern-001` | high | A09:2021 | — |
| `pii-in-logs-js-001`, `pii-in-logs-py-001`, `pii-in-logs-php-001`, `pii-in-logs-go-001` | high | A09:2021 | — |
| `missing-breach-log-js-001` | medium | A09:2021 | Section 12B |

## Coverage

| Language | Shipped language-specific coverage | Planned |
|---|---|---|
| JavaScript/TypeScript | SQL injection, CORS, rate limiting, PII logs, breach-log heuristic | — |
| PHP/Laravel | SQL injection, CORS, rate limiting, PII logs | — |
| Go | SQL injection, CORS, rate limiting, PII logs | — |
| Python | PII log-call variant; SQL injection remains v0.1-supported | — |
| Ruby, Java, Rust, C#/.NET | None | Future versions |

Read the [PDPA mapping notes](docs/legal/pdpa-2024-mapping.md) and the [PDPA security audit skill](skills/pdpa-security-audit/SKILL.md) before relying on legal mappings or agent-generated explanations.

This is a security review aid, not legal advice. The v0.2 engine is regex-based and only claims the language/framework coverage shown above.

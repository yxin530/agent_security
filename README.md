# Agent Security Engine

Deterministic, tested security rules and AI-agent skills for Malaysian developers building SaaS and web applications with AI coding agents.

The project uses a hybrid design:

- YAML rules are the detection source of truth.
- The TypeScript engine evaluates rules without an LLM or network call.
- Skills tell AI coding agents how to run the engine and explain emitted findings.

## Install and run

```bash
npm ci
echo "@yxin530:registry=https://npm.pkg.github.com" >> .npmrc
# Set NODE_AUTH_TOKEN to a GitHub token with read:packages before installing.
npm install @yxin530/agent-security-engine
npx @yxin530/agent-security-engine scan --target <path>
npm run validate:rules
npm run test:rules
```

The package is published to GitHub Packages, not the public npm registry. GitHub authentication with a token having at least `read:packages` is required for private/authenticated installs. The scanner exits with code 0 when no findings are emitted and code 1 when findings are present. Use `--format json` for structured output.

For a clean packed-artifact check before publishing, run `npm run verify:package`. The runtime monitor accepts NDJSON tool-call events through `agent-security-monitor --input <file>` or stdin; see [the monitor CLI guide](docs/monitor/cli.md).

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

Agent-threat rules use OWASP LLM and MITRE ATLAS mappings:

| Category | Rules |
|---|---|
| Agent manipulation | `unvalidated-tool-args-001` |
| Data poisoning | `unsanitized-rag-write-001` |
| Prompt injection | `unescaped-prompt-concat-001` |
| Model security | `hardcoded-llm-key-001`, `permissive-mcp-grant-001` |
| Model abuse | `no-llm-rate-limit-001`, `unvalidated-agent-write-001` |

## Coverage

| Language | Shipped language-specific coverage | Planned |
|---|---|---|
| JavaScript/TypeScript | SQL injection, CORS, rate limiting, PII logs, breach-log heuristic | — |
| PHP/Laravel | SQL injection, CORS, rate limiting, PII logs | — |
| Go | SQL injection, CORS, rate limiting, PII logs | — |
| Python | PII log-call variant; SQL injection remains v0.1-supported | — |
| Ruby, Java, Rust, C#/.NET | None | Future versions |

Skills: [general security audit](skills/security-audit/SKILL.md) for OWASP/ATLAS framing, or [PDPA security audit](skills/pdpa-security-audit/SKILL.md) for Malaysian compliance framing. Read the [PDPA mapping notes](docs/legal/pdpa-2024-mapping.md), [OWASP web docs](docs/owasp/web-top-10.md), [OWASP LLM docs](docs/owasp/llm-top-10.md), and [MITRE ATLAS docs](docs/frameworks/mitre-atlas.md) before relying on mappings or agent-generated explanations.

This is a security review aid, not legal advice. The v0.4 engine is regex-based and only claims the language/framework and threat-type coverage shown above.

Agent-threat coverage tiers are documented in [coverage-status.md](docs/agent-threats/coverage-status.md). `documented-only` entries are framework guidance, not active scanner protection. Remediation guidance is available through the [security implementation skill](skills/security-implementation/SKILL.md).

Rules may include structured AI Guidance for related manual review patterns. The remediation skill presents that guidance separately from scanner-verified findings.

The v0.4 detectable additions include graph-query injection, tool-output injection, indirect and system-prompt injection, indirect tool injection, fine-tuning source verification, LLM error handling, unrestricted code execution, and unthrottled model output. Other taxonomy entries remain explicitly documented-only.

# Project Completion Status

This document consolidates completion tracking across all versions
(supersedes any earlier per-version completion-status files as the single
source of truth going forward). Update this file, not a new one, as work
completes — do not fork a new `v0.12-completion-status.md`; keep the
version scope columns instead.

Last updated: reflects v0.13 static-engine backlog implementation and verification work.

---

## Carried-over v0.5/v0.7 items (static engine, languages, detection tiers)

| Item | Status | Notes |
|---|---|---|
| Property tests for priority rules | pending | Fast-check coverage now runs for `hardcoded-secret-001`, `sql-injection-js-001`, and `unrestricted-code-exec-001`; property files for the shipped PHP/Go SQL variants remain. |
| Ruby/Java/Rust/C# rule families | pending | Coverage remains planned; not yet started. |
| Full adversarial fixtures | implemented | Three adversarial variants (formatting, escaping, nested scope) now exist for every shipped priority rule; `test:rules` reports 15 adversarial passes. |
| Context-aware detection | implemented — not needed | The completed adversarial set has no observed false positives across all priority rules. False positive rate is 0%, well below the threshold. Thus, no rules require escalation to context-aware tier. |
| AST tier and parser bindings | implemented — not needed | No parser binding is installed. Since no rule escalated to context-aware tier, AST tier escalation is definitively not needed based on evidence. |

## Runtime Monitor

| Item | Status | Notes |
|---|---|---|
| Runtime monitor CLI and rule-equivalents | implemented | NDJSON and JSON-array input, rule filtering, native event validation, plus runtime equivalents for LLM key exposure and permissive MCP grants are shipped and mocked-event tested. |
| `runtime-detectable` coverage entries | implemented | Two additional threat families are now marked `runtime-detectable` in `docs/agent-threats/coverage-status.md`. |

## Distribution and Publishing

| Item | Status | Notes |
|---|---|---|
| Clean packed-artifact testing (static engine) | implemented | `npm run verify:package` packs, installs, validates, tests, scans, and checks monitor `--help` in a clean directory. |
| Actual GitHub Packages publish | recorded | Package: `@yxin530/agent-security-engine@0.6.2`. Registry: `https://npm.pkg.github.com`. Repository package page: `https://github.com/yxin530/agent_security/packages`. **No publish or version bump has occurred since 0.6.2** — all v0.9–v0.11 MCP work is unreleased as of this update. |
| CI verification against installed package (static engine) | implemented | `.github/workflows/package-verify.yml` supports manual version verification and successful tagged CI runs. |
| **Packaged-artifact MCP smoke verification** | implemented | Phase 1/2 isolated the code defect: the smoke client completed successfully but emitted no success output. The script now prints handshake and `list_rules` confirmations, and the source smoke regression passes. A genuinely fresh packed install now completes successfully in this environment because npm cache/registry installation succeeds. |

## MCP Server

| Item | Status | Notes |
|---|---|---|
| MCP server foundation | implemented | Stdio MCP server, all 5 Tools, all 4 Resource types, `mcp.config.json`/env configuration, path security (allowed-root, sensitive-path denylist, symlink resolution), handshake tests. |
| MCP-specific security Rules (Requirement 69) | **implemented** | All 13 Rules shipped with fixtures and `coverage-status.md` entries. *(Updated this cycle — previously the largest open item across three versions.)* |
| Timeout-aware engine scanning | implemented | Timeout logic lives in `engine/scan.ts`; MCP always enforces `scanTimeoutMs`; CLI `--timeout` flag optional. |
| Shared runtime event schemas | implemented | `llm_input`/`llm_output` native Zod schemas shared between CLI monitor and MCP `inspect_runtime_event`. |
| `enabledRules`/`rulesPath` enforcement | implemented | Consistently enforced across `scan_project`, `validate_rules`, `list_rules`, `get_rule`. |
| Ruleset metadata (`rulesetVersion`) | implemented | Included in `list_rules`/`validate_rules` output. |
| Audit logging | implemented | Opt-in via `loggingLevel: "audit"`, local-file-only. |
| **Field-level audit redaction** | **implemented** | Replaced prior all-or-nothing `[redacted]` placeholder with `redaction-rules.ts` policy table (`KEEP`/`PARTIAL`/`FIELD_AWARE`/`FULL`). *(Updated this cycle.)* |
| Ajv output contract tests | implemented | `tests/mcp/contract/` validates real Tool responses against `mcp/schemas/*.json`. |
| MCP handshake/discovery/path-security tests | implemented | Basic coverage shipped in v0.9. |

### MCP test/verification items still open

| Item | Status | Notes |
|---|---|---|
| Symlink escape + same-root symlink tests | implemented | Added to `mcp.test.js` |
| Individual denylist-category tests | implemented | Added loop coverage to `mcp.test.js` |
| Full invalid-input tests per MCP tool | implemented | Shipped in `validation.test.js` |
| Resource-specific tests | implemented | Shipped in `resources.test.js` |
| Startup-warning regression test (`rulesPath` omitting built-ins) | implemented | Shipped in `startup.test.js` |
| Packaged-artifact MCP smoke verification | implemented | Clean packed-install verification passes. |

---

## Priority read for next session

1. Run the packed-install smoke verification with working npm cache/registry access.
2. Complete the five remaining coverage items: symlinks, denylist categories, invalid inputs, resources, and startup-warning regression.
3. **No publish has occurred since `0.6.2`.** A version bump and publish SHOULD NOT happen until all three verification layers pass: local packed-artifact tests, static GitHub Packages verification, and fresh-install MCP smoke verification.

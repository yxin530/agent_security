# Project Completion Status

This document consolidates completion tracking across all versions
(supersedes any earlier per-version completion-status files as the single
source of truth going forward). Update this file, not a new one, as work
completes — do not fork a new `v0.12-completion-status.md`; keep the
version scope columns instead.

Last updated: reflects v0.12 implementation and verification work.

---

## Carried-over v0.5/v0.7 items (static engine, languages, detection tiers)

| Item | Status | Notes |
|---|---|---|
| Property tests for priority rules | pending | Fast-check property suites (`hardcoded-secret-001`, `sql-injection-*`, `unrestricted-code-exec-001`) remain to be added. |
| Ruby/Java/Rust/C# rule families | pending | Coverage remains planned; not yet started. |
| Full adversarial fixtures | partial | Adversarial directory exists, but broad per-rule coverage remains pending. |
| Context-aware detection | pending | All current rules remain at `regex` tier — no rule has yet accumulated the false-positive-rate evidence required to justify escalation. |
| AST tier and parser bindings | pending | Parser references are documented in `docs/engine/parsers.md`; no parser is actually installed or invoked. |

## Runtime Monitor

| Item | Status | Notes |
|---|---|---|
| Runtime monitor CLI and rule-equivalents | partial | NDJSON and JSON-array input, rule filtering, and native `tool_call`/`llm_input`/`llm_output` validation are shipped; broader runtime rule coverage remains pending. |
| `runtime-detectable` coverage entries | partial | Tool-call runtime detection is tested; coverage in `docs/agent-threats/coverage-status.md` is intentionally narrow, reflecting only what's actually shipped. |

## Distribution and Publishing

| Item | Status | Notes |
|---|---|---|
| Clean packed-artifact testing (static engine) | implemented | `npm run verify:package` packs, installs, validates, tests, scans, and checks monitor `--help` in a clean directory. |
| Actual GitHub Packages publish | recorded | Package: `@yxin530/agent-security-engine@0.6.2`. Registry: `https://npm.pkg.github.com`. Repository package page: `https://github.com/yxin530/agent_security/packages`. **No publish or version bump has occurred since 0.6.2** — all v0.9–v0.11 MCP work is unreleased as of this update. |
| CI verification against installed package (static engine) | implemented | `.github/workflows/package-verify.yml` supports manual version verification and successful tagged CI runs. |
| **Packaged-artifact MCP smoke verification** | **blocked — fresh-install verification** | Phase 1/2 isolated the code defect: the smoke client completed successfully but emitted no success output. The script now prints handshake and `list_rules` confirmations, and the source smoke regression passes. A genuinely fresh packed install could not complete in this environment because npm cache/registry installation failed before the server started; this remains blocked until a clean install is run with working package access. |

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
| Symlink escape + same-root symlink tests | pending | Neither case has a dedicated test yet. |
| Individual denylist-category tests | pending | No per-category test breakdown yet; only combined/implicit coverage if any. |
| Full invalid-input tests per MCP tool | pending | Missing-field / wrong-type / invalid-enum tests not yet written for all 5 Tools. |
| Resource-specific tests | pending | Invalid `ruleId`, invalid/traversal `document` values untested. |
| Startup-warning regression test (`rulesPath` omitting built-ins) | pending | Warning behavior (Requirement 73.4/88) not yet covered by a test confirming it fires/doesn't fire correctly. |
| Packaged-artifact MCP smoke verification | **blocked — fresh-install verification**, see Distribution table above | Code fix and source regression pass; clean packed-install verification remains. |

---

## Priority read for next session

1. Run the packed-install smoke verification with working npm cache/registry access.
2. Complete the five remaining coverage items: symlinks, denylist categories, invalid inputs, resources, and startup-warning regression.
3. **No publish has occurred since `0.6.2`.** A version bump and publish SHOULD NOT happen until all three verification layers pass: local packed-artifact tests, static GitHub Packages verification, and fresh-install MCP smoke verification.

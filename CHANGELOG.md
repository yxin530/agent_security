# Changelog

## 0.10.0

- **M1: Correctness & Honesty**:
  - Engine now reports all matches per file (`ENG-01`), supporting `detection.report: first` (`ENG-02`) with accurate 1-indexed column locations pointing at non-negated matches (`ENG-06`).
  - Added deduplication (`ENG-03`) and stable 16-character SHA-256 finding fingerprints (`ENG-04`).
  - Implemented standard exit codes: `0` for clean, `1` for findings at or above `--fail-on` (default `high`), `2` for configuration/runtime errors (`ENG-05`).
  - Split `hardcoded-secret-001` into `secret-assignment-001`, `secret-provider-prefix-001`, `hardcoded-llm-key-001`, and added `dotenv-committed-001` with `aliases.json` compatibility mapping (`SEC-01`..`SEC-06`).
  - Enforced `FAKE`/`EXAMPLE` markers for all test secrets (`SEC-06`).
  - Tightened `missing-consent-collection-001` to identifier-like tokens to prevent false positives on bare `address`, `email`, `phone` (`PROF-03`).
  - Refactored MCP server: renamed `allowedClientIds` to `expectedClientIds` (documented as sanity check, not authentication) (`MCP-01`) and read version dynamically from `package.json` (`MCP-04`).
  - Enhanced runtime monitor with Malaysian IC date validation and comprehensive Malaysian phone detection (`MON-01`, `MON-02`).
  - Streamlined package distribution files list to exclude test fixtures (`REL-02`).
  - Single version source in `package.json` validated by `scripts/check-versions.js` (`REL-01`).
  - Added Limitations section to README and removed stale version claims (`DOC-01`, `DOC-02`).

## 0.9.4

- Fixed `ajv` schema validation errors caused by the addition of the new `confidence` and `detection_limitations` metadata fields.

## 0.9.3

- Added `confidence` and `detection_limitations` metadata to all Agent-Threat rules.
- Enhanced regex heuristics for `unescaped-prompt-concat-001`, `tool-output-injection-001`, and `unsanitized-rag-write-001` to reduce false positives.
- Synchronized `README.md` rule documentation with the active rule catalog.

## 0.9.2

- Fixed CI test fixtures and Python SQLi regex. Cleaned up stray rule bundle files causing package verification failures.

## 0.9.0

- **v0.19 Implementation (React/Next.js, Language Gap-Fill, ATLAS Backfill)**:
  - Added React/Next.js specific rules: `xss-react-dangerouslySetInnerHTML-001`, `sql-injection-nextjs-001`, `missing-nextjs-auth-001`, `nextjs-open-redirect-001`, `nextjs-exposed-env-001`.
  - Added language gap-fill rules for injection (`sql-injection-py-001`, `command-injection-js-001`, `command-injection-py-001`, `nosql-injection-js-001`), XSS (`xss-php-001`, `xss-reflected-py-001`), logging (`pii-in-logs-java-001`, `pii-in-logs-cs-001`), SSRF (`ssrf-pattern-py-001`, `ssrf-pattern-go-001`), cryptography (`weak-cipher-py-001`, `insecure-random-java-001`), and rate limiting (`missing-rate-limit-java-001`, `missing-rate-limit-py-001` - temporarily in `logging/`).
  - Added ATLAS technique metadata (`maps_to.atlas`) backfill for `missing-output-sanitisation-001` (AML.T0048) and `system-prompt-leakage-001` (AML.T0046).
  - Created `CONTRIBUTING.md` and updated `architecture.md` / `requirements.md` / `agent.md` to reflect new guidelines.

## 0.8.0

- **v0.18 Implementation (PDPA Completeness)**:
  - Added 6 new heuristic compliance rules mapping to PDPA 2010 (and 2024 Amendment) sections: `missing-consent-collection-001`, `missing-privacy-notice-001`, `unrestricted-pii-api-001`, `missing-data-ttl-001`, `missing-dsar-endpoint-001`, and `pii-sent-to-third-party-001`.
  - Capped severity of all PDPA rules to `medium` because heuristic compliance checks carry higher false-positive risk than syntactic vulnerability checks.
  - Updated `pdpa-2024-mapping.md` with new mappings.

## 0.7.1

- **v0.17 Implementation (OWASP LLM Updates)**:
  - Migrated `owasp_llm` mapping field in schema to an array format to support multiple mappings.
  - Added new LLM rule: `missing-output-sanitisation-001` (LLM05:2025).
  - Added new LLM rule: `system-prompt-leakage-001` (LLM07:2025).
  - Backfilled missing mappings (LLM04:2025) into `unsanitized-rag-write-001` and `graph-query-injection-001`.
  - Updated `llm-top-10.md` with new categories.

## 0.7.0

- **v0.16 Implementation (OWASP Web Top 10 Completeness)**:
  - Added new schema fields `cwe` and `mitre_attack`.
  - Added A01 Broken Access Control rule: `broken-object-level-authz-001`.
  - Added A02 Cryptographic Failures rules: `weak-cipher-001` and `insecure-random-001`.
  - Added A03 Injection (XSS) rules: `xss-reflected-js-001` and `xss-innerHTML-001`.
  - Added A10 SSRF rule: `ssrf-pattern-js-001`.
  - Documented A06 Vulnerable and Outdated Components as `documented-only`.

## 0.6.9

- **v0.15 Implementation**:
  - Added 6 new static security rules: `dependency-confusion-001`, `missing-output-validation-001`, `missing-breach-notification-001`, `session-fixation-001`, `insecure-auto-update-001`, and `i2p-endpoint-001`.
  - Implemented runtime heuristic PII pattern matching (Malaysian IC, Phone, Email) for `llm-output` events, mapping findings to PDPA Section 9.
  - Hardened MCP server by implementing per-client token-bucket rate limiting for project scans and enforcing client identity authorization (`X_AGENT_ID` or `MCP_CLIENT_ID`).
  - Added strict CI taxonomy integrity checks to ensure `detectable` and `runtime-detectable` threats are backed by implemented rules.
- Diagnosed and fixed the MCP packaged smoke-test's silent-success behavior by emitting explicit handshake and `list_rules` verification output.
- Evaluated and intentionally excluded `deepfake` and `human-trafficking` Threat-Types from static Rules because they lack source-code signatures (documented-only). Added `stolen-credential`, `darknet-control`, and `trojan` rules.

## 0.6.2

- Configured scoped GitHub Packages publishing as `@yxin530/agent-security-engine`.

## 0.6.1

- Fixed invalid package metadata placement so npm and CI can parse `package.json`.

## 0.6.0

- Added validated rule-embedded AI Guidance blocks for the priority rule families.
- Added AI-guidance backfill tracking and v0.5 completion tracking.
- Updated remediation-skill instructions to separate scanner findings from manual guidance.

## 0.5.0

- Fixed `scannedFiles`, which reported `0` in previous versions despite files being evaluated.
- Added detection-tier metadata and runtime finding source metadata.
- Added the opt-in runtime monitor module and parser-binding documentation.

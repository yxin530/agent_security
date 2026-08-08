# Changelog

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

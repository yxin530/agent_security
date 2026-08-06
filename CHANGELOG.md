# Changelog

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

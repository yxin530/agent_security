# Changelog

## Unreleased

- Diagnosed and fixed the MCP packaged smoke-test's silent-success behavior by emitting explicit handshake and `list_rules` verification output. A genuinely clean npm install remains environment-dependent when the registry/cache is unavailable.
- Evaluated and intentionally excluded `deepfake` and `human-trafficking` Threat-Types from static Rules because they lack source-code signatures (documented-only). Added `stolen-credential`, `darknet-control`, and `trojan` rules.
  - See architecture-v0.14.md for the complete detectability assessment.

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

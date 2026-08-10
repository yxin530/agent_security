# Contributing to Agent Security Engine

Thank you for your interest in contributing! This guide explains how to add rules, fix bugs, or improve documentation while keeping the project's quality discipline intact.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [How to Add a New Rule](#how-to-add-a-new-rule)
3. [Rule Authoring Policy](#rule-authoring-policy)
4. [How to Add a Language Variant](#how-to-add-a-language-variant)
5. [Testing Your Rule](#testing-your-rule)
6. [PR Description Requirements](#pr-description-requirements)
7. [Documentation Updates](#documentation-updates)
8. [ATLAS / OWASP Backfill](#atlas--owasp-backfill)

---

## Code of Conduct

Be respectful, evidence-based, and precise. Security is a domain where overclaiming causes direct harm (false confidence). Underclaiming is always preferable to asserting detection capability that doesn't exist.

---

## How to Add a New Rule

### Step 1 — Detectability Assessment (mandatory before writing YAML)

Before writing a single line of YAML, answer these questions in your PR description:

| Question | Answer |
|---|---|
| Does a reliable static pattern exist? | Yes / No / Narrow |
| What is the estimated false-positive surface? | Low / Medium / High |
| Is this a Content/Behavior Risk Category (no code signature)? | Yes → `documented-only` |
| Which languages/frameworks will ship in v1 of this rule? | |

If the answer to "static pattern exists" is **No**, create a `README.md` in the threat directory instead (see `rules/agent-threats/model-abuse/deepfake/` for an example). Do **not** create a YAML rule.

### Step 2 — Place the YAML File

Rules live under:

```
rules/
├── appsec/                     # Web application security rules
│   ├── access-control/
│   ├── cors/
│   ├── cryptography/
│   ├── data-lifecycle/
│   ├── injection/
│   ├── logging/
│   ├── pdpa/
│   ├── secrets-management/
│   ├── ssrf/
│   └── xss/
└── agent-threats/              # AI agent / LLM threat rules
    ├── agent-manipulation/
    ├── data-poisoning/
    ├── model-abuse/
    ├── model-security/
    ├── prompt-injection/
    └── supply-chain/
```

Name your file `<threat-slug>-<language-abbr>-001.yaml` for language-specific rules, or `<threat-slug>-001.yaml` for language-agnostic rules.

### Step 3 — Fill the Schema

All fields in `rules/schema.json` are validated. Required fields:

```yaml
id: <unique-rule-id>
title: "Human-readable title"
severity: critical | high | medium | low | informational
category: <category-string>
scope: language-agnostic | language-specific
detection_tier: regex | context-aware | ast
maps_to:
  owasp:
    - A0N:2021          # required; at least one
  # optional fields:
  owasp_llm: [LLM01:2025]
  atlas: "AML.T0051"    # must match ^AML\.T\d{4}$
  cwe: [CWE-79]
  pdpa: "Section N, Personal Data Protection Act 2010 (as amended)"
  mitre_attack: "T1234"
detection:
  extensions: [".js", ".ts"]
  file_patterns: ["**/*.js", "**/*.ts"]
  scope: line | file
  logic: AND | OR
  conditions:
    - pattern: "regex-here"
      flags: "i"           # optional
      negate: true         # optional; negates the condition
      description: "what this pattern matches"
description: >
  Plain-language description. State the false-positive surface level
  (low / medium / high) in the first two sentences.
remediation: "Specific, actionable alternative. Name the actual function/library."
ai_guidance:
  watch_for:
    - "Known false-positive pattern 1"
    - "Known false-positive pattern 2"
  references:
    - title: "OWASP Ref"
      url: "https://..."
  related_rule_ids: []
test_cases:
  - type: true_positive
    fixture: "tp.js"
    description: "What the TP tests"
    code: 'const bad = ...;'
  - type: true_negative
    fixture: "tn.js"
    description: "What the TN tests"
    code: 'const safe = ...;'
```

### Step 4 — Validate and Test

```bash
npm run validate:rules   # schema validation — must pass with 0 errors
npm run test:rules       # fixture tests — all TP/TN must pass
```

---

## Rule Authoring Policy

| Policy | Detail |
|---|---|
| **Severity cap — PDPA rules** | Never exceed `medium`. Compliance heuristics have a structurally higher false-positive rate. |
| **Severity cap — OWASP appsec** | `high` is allowed; `critical` only if false-positive surface is near-zero and the pattern is unambiguous. |
| **Severity cap — Agent-threat rules** | `high` by default; `critical` for unambiguous, narrow patterns (e.g. hardcoded LLM provider key). |
| **PDPA description language** | Must include: "This is a review signal, not a legal conclusion." |
| **XSS rules** | Must list at least two known false-positive patterns (template engines with auto-escaping, DOMPurify usage) in `ai_guidance.watch_for`. |
| **SSRF rules** | Must state in `description` that not all dynamic URLs are SSRF risks. |
| **CWE IDs** | Verify at https://cwe.mitre.org/ before writing. Format: `CWE-<digits>`. |
| **MITRE ATT&CK IDs** | Format: `T<4-digits>` or `T<4-digits>.<3-digits>`. |
| **ATLAS IDs** | Format: `AML.T<4-digits>`. Verify at https://atlas.mitre.org/techniques/. |
| **No forced rules** | If a threat has no reliable static pattern, create a `README.md` only. Never write a rule that fires on every file in a category just to show coverage. |

---

## How to Add a Language Variant

To add a new language variant of an existing rule (e.g. adding `sql-injection-kotlin-001.yaml`):

1. Copy the nearest existing variant as a starting point.
2. Update `id`, `detection.extensions`, `detection.file_patterns`, `detection.conditions` for the target language idioms.
3. Write both a TP and a TN fixture that use the **target language's idioms**, not a transliteration of the JS fixture.
4. Run `npm run validate:rules` and `npm run test:rules`.
5. Add the new rule to the README.md Coverage table.

---

## Testing Your Rule

Every rule must have at minimum:
- **1 true positive (TP)** — a code snippet that the rule should flag.
- **1 true negative (TN)** — a code snippet that shows the safe alternative and must **not** be flagged.

For higher-risk rules (severity `high` or `critical`), include adversarial variants:
- Obfuscated or reformatted versions of the TP that test the regex's robustness.
- An additional TN that tests the most common false-positive source listed in `ai_guidance.watch_for`.

---

## PR Description Requirements

Every PR implementing a new rule or rule family must include, in the PR body:

1. **Detectability assessment table** (see Step 1 above).
2. **The reason for the chosen severity level**.
3. **Language variants shipped vs. deferred** (and why deferred ones are deferred).
4. **False-positive surface statement** — Low / Medium / High with a brief justification.

PRs without a detectability assessment table will not be merged.

---

## Documentation Updates

When adding a new rule, also update:

- `README.md` — add the rule to the Rules table and the Coverage table if it's the first rule for a language.
- `docs/agent-threats/coverage-status.md` — if adding an agent-threat rule or changing a threat type's coverage tier.
- `docs/owasp/web-top-10.md` or `docs/owasp/llm-top-10.md` — if the rule maps to an OWASP category not yet listed.
- `docs/legal/pdpa-2024-mapping.md` — if adding a PDPA rule.

---

## ATLAS / OWASP Backfill

If you're adding `maps_to.atlas` to an existing rule (metadata-only):

1. Verify the ATLAS technique ID at https://atlas.mitre.org/techniques/.
2. Add the `atlas` field under `maps_to` in the YAML file.
3. Run `npm run validate:rules` to confirm the schema pattern `^AML\.T\d{4}$` accepts the value.
4. No detection logic changes are needed or permitted for a backfill-only PR.

---

*This is a security review aid, not a compliance tool. All rules are pattern heuristics, not legal advice or audit conclusions.*

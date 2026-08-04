# Requirements Document — v0.2 Addendum (Multi-Language Expansion)

This document adds to, and does not replace, the v0.1 requirements.md. All
v0.1 requirements remain in force unless explicitly superseded below.

## Glossary additions

- **Scope**: A required field on every Rule, valued `language-agnostic` or
  `language-specific`, declaring whether the rule runs against all text
  files or only files matching its `file_patterns`.
- **Rule Family**: The shared detection concept behind a group of
  language-specific rules (e.g. "sql-injection" is a family; `sql-injection-js-001`
  and `sql-injection-php-001` are variants within it).
- **Alias Map**: The file `rules/aliases.json` mapping any renamed v0.1 rule
  id to its v0.2 id, so historical references remain resolvable.

---

### Requirement 11: Rule Scope Field

**User Story:** As a contributor, I want every rule to explicitly declare whether it is language-agnostic or language-specific, so that the engine and validator can apply the correct file-matching behavior automatically.

#### Acceptance Criteria

1. THE Schema SHALL require a `scope` field on every rule with enumerated values `language-agnostic` and `language-specific`.
2. IF `scope` is `language-agnostic`, THEN THE Schema SHALL NOT require a `file_patterns` field, and THE Engine SHALL evaluate that rule against every scanned text file regardless of extension.
3. IF `scope` is `language-specific`, THEN THE Schema SHALL require a non-empty `file_patterns` array, and THE Engine SHALL evaluate that rule only against files whose path matches at least one declared pattern.
4. WHEN the Engine scans a target directory, THE Engine's file walker SHALL include every extension referenced by any loaded rule's `file_patterns`, plus (for language-agnostic rules) all files not excluded by a binary-file guard.
5. THE Engine SHALL apply a binary-file guard that skips files whose content is not valid UTF-8 text, to avoid evaluating language-agnostic rules against binaries.
6. THE Validator SHALL reject any rule file missing the `scope` field, reporting it as a schema violation per Requirement 1.5.

---

### Requirement 12: Rule ID Convention and Migration

**User Story:** As a contributor and as an existing user of v0.1 output, I want rule IDs to remain resolvable across the v0.1-to-v0.2 rename, so that no historical finding reference or badge silently breaks.

#### Acceptance Criteria

1. THE Rule ID for a `language-specific` rule SHALL follow the format `<rule-family>-<language>-<sequence>` (e.g. `sql-injection-js-001`).
2. THE Rule ID for a `language-agnostic` rule SHALL retain the flat format `<rule-family>-<sequence>` (e.g. `hardcoded-secret-001`), since only one variant exists.
3. THE file `rules/aliases.json` SHALL exist and SHALL map every v0.1 rule id that is renamed under this convention to its v0.2 id.
4. WHEN the Engine or Skill encounters a reference to an id present in the Alias Map, THE Engine or Skill SHALL resolve it to the current id before use.
5. THE Validator SHALL fail IF any entry in `rules/aliases.json` maps to an id that does not correspond to an existing rule file.

---

### Requirement 13: Language-Specific Rule Variants (v0.2 Set)

**User Story:** As a Malaysian vibe coder shipping in PHP or Go, I want the same detection categories available in v0.1 to also cover my language, so that the tool is useful regardless of stack.

#### Acceptance Criteria

1. THE Engine SHALL include `sql-injection-php-001`, detecting string concatenation (`.`) of a SQL keyword-anchored string with a variable in `.php` files, or interpolation of a variable inside a double-quoted SQL string.
2. THE Engine SHALL include `sql-injection-go-001`, detecting `fmt.Sprintf` or `+` concatenation of a SQL keyword-anchored string with a non-literal argument in `.go` files.
3. THE Engine SHALL include `wildcard-cors-php-001` and `wildcard-cors-go-001`, detecting framework-equivalent wildcard-CORS-with-credentials patterns (Laravel `config/cors.php` `allowed_origins: ['*']` combined with `supports_credentials: true`; Go `net/http` header-setting equivalent of Requirement 2.3).
4. THE Engine SHALL include `missing-rate-limit-php-001` and `missing-rate-limit-go-001`, detecting auth-path route registrations lacking a rate-limiting identifier, using framework-appropriate route-registration syntax (Laravel `Route::post`; Go `http.HandleFunc` / common router libraries).
5. EACH new language-specific rule SHALL include at least one `true_positive` and one `true_negative` test case with corresponding fixtures, per Requirement 3, before it may be merged.
6. EACH new language-specific rule's OWASP mapping SHALL match its v0.1 JS/TS equivalent in the same rule family (e.g. all `sql-injection-*` variants map to `A03:2021`); PDPA mapping SHALL only be added if independently verified per Requirement 8 — it SHALL NOT be assumed to carry over automatically from the JS/TS variant.

---

### Requirement 14: Split of `pii-in-logs-001`

**User Story:** As a maintainer, I want the PII-in-logs detection separated into its language-agnostic pattern-matching part and its language-specific log-call-detection part, so that the pattern half automatically benefits every language without rule duplication.

#### Acceptance Criteria

1. THE rule `pii-in-logs-001` SHALL be split into a language-agnostic sub-check (email/IC/phone regex matching within any string literal) and language-specific sub-checks identifying log-call syntax per language (`console.log`/`console.error`/`console.warn` for JS/TS; `print`/`logging.*` for Python; `error_log`/`Log::*` for PHP; `log.*`/`fmt.Println` with a logger context for Go).
2. THE language-agnostic sub-check SHALL be published as rule `pii-pattern-001` with `scope: language-agnostic`.
3. EACH language-specific log-call sub-check SHALL be published as `pii-in-logs-<language>-001` with `scope: language-specific`, referencing `pii-pattern-001`'s pattern set in its `description` rather than duplicating the regex inline.
4. THE Alias Map SHALL map the v0.1 `pii-in-logs-001` id to `pii-in-logs-js-001` (its closest v0.2 equivalent), per Requirement 12.3.

---

### Requirement 15: Documentation and Claims Accuracy

**User Story:** As a developer choosing whether to trust this tool, I want the README and skill files to accurately state which languages are covered by which tier, so I don't assume protection that hasn't been fixture-tested.

#### Acceptance Criteria

1. THE README SHALL state, per rule family, which languages have language-specific variants shipped versus planned versus not yet supported.
2. THE README SHALL NOT use unqualified language such as "supports all languages"; any coverage claim SHALL distinguish language-agnostic tier coverage from language-specific tier coverage.
3. WHEN a new language-specific rule variant is merged, THE README's coverage table SHALL be updated in the same pull request, enforced via a CI check that greps the coverage table for the new rule id (fails the build if absent).
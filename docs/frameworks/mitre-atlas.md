# MITRE ATLAS mappings

These entries are plain-language references for agent-threat mappings, not imperative advice.

- `AML.T0020` Poison Training Data: adversarial or untrusted data influences an AI system's learned or retrieved behavior. → Covered by `unsanitized-rag-write-001`, `graph-query-injection-001`
- `AML.T0040` ML Supply Chain Compromise: an ML pipeline component (dataset, model, library) is substituted with a malicious version. → `documented-only` at this tier; see `dependency-confusion-001` for the narrow package-naming variant.
- `AML.T0043` Craft Adversarial Data: crafted inputs are used to influence an AI system or its resource use. → Covered by `dependency-confusion-001`
- `AML.T0046` Exfiltration via ML API: model or API access exposes sensitive material. → Covered by `hardcoded-llm-key-001`, `system-prompt-leakage-001`
- `AML.T0047` ML-Enabled Product Abuse: an AI product's exposed capability is abused for unintended harmful use cases. → `documented-only`; overlaps with `model-abuse/malicious-use` family. No reliable static pattern.
- `AML.T0048` External Harms: an AI system's exposed capability can produce harmful external effects. → Covered by `missing-output-sanitisation-001`, `xss-react-dangerouslySetInnerHTML-001`
- `AML.T0051` LLM Prompt Injection: crafted content alters the model's instructions or action selection. → Covered by `unescaped-prompt-concat-001`, `indirect-prompt-injection-001`
- `AML.T0058` Backdoor ML Model: a poisoned or backdoored model is introduced into the pipeline. → `documented-only`; overlaps with `malicious-fine-tuning` family. No reliable static signature at the code level.

Source: [MITRE ATLAS techniques](https://atlas.mitre.org/techniques/).

## v0.19 taxonomy references

All entries below are framework documentation; the coverage tier is tracked in `docs/agent-threats/coverage-status.md`.

The v0.4 detectable types are mapped through their individual rule files: cross-agent, tool-injection, graph-query-injection, dataset-issues, direct/indirect/system-prompt/indirect-tool prompt injection, model-behavior, malicious-fine-tuning, model-catch-issue, malicious-use, malware-issues, and extraction-issues. The remaining taxonomy types are `documented-only` because reliable static detection is not currently established.

As of v0.19, the following ATLAS technique IDs are explicitly referenced in rule `maps_to.atlas` fields:

| ATLAS Technique | Coverage | Rule(s) |
|---|---|---|
| `AML.T0020` | `detectable` | `unsanitized-rag-write-001`, `graph-query-injection-001` |
| `AML.T0040` | `documented-only` | (see `dependency-confusion-001` for partial overlap) |
| `AML.T0043` | `detectable` (narrow) | `dependency-confusion-001` |
| `AML.T0046` | `detectable` | `hardcoded-llm-key-001`, `system-prompt-leakage-001` |
| `AML.T0047` | `documented-only` | — |
| `AML.T0048` | `detectable` | `missing-output-sanitisation-001`, `xss-react-dangerouslySetInnerHTML-001` |
| `AML.T0051` | `detectable` | `unescaped-prompt-concat-001`, `indirect-prompt-injection-001` |
| `AML.T0058` | `documented-only` | — |

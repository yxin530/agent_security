# MITRE ATLAS mappings

These entries are plain-language references for agent-threat mappings, not imperative advice.

- `AML.T0020` Poison Training Data: adversarial or untrusted data influences an AI system's learned or retrieved behavior.
- `AML.T0043` Craft Adversarial Data: crafted inputs are used to influence an AI system or its resource use.
- `AML.T0046` Exfiltration via ML API: model or API access exposes sensitive material.
- `AML.T0048` External Harms: an AI system's exposed capability can produce harmful external effects.
- `AML.T0051` LLM Prompt Injection: crafted content alters the model's instructions or action selection.

Source: [MITRE ATLAS techniques](https://atlas.mitre.org/techniques/).

## v0.4 taxonomy references

All entries below are framework documentation; the coverage tier is tracked in `docs/agent-threats/coverage-status.md`.

The v0.4 detectable types are mapped through their individual rule files: cross-agent, tool-injection, graph-query-injection, dataset-issues, direct/indirect/system-prompt/indirect-tool prompt injection, model-behavior, malicious-fine-tuning, model-catch-issue, malicious-use, malware-issues, and extraction-issues. The remaining taxonomy types are `documented-only` because reliable static detection is not currently established.

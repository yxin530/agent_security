# OWASP LLM Top 10 mappings

These entries describe the OWASP LLM categories used by agent-threat rules. They are references, not imperative advice.

- `LLM01:2025` Prompt Injection: crafted input changes an LLM application's intended behavior.
- `LLM02:2025` Sensitive Information Disclosure: an LLM system exposes sensitive information or credentials.
- `LLM03:2025` Supply Chain: compromised models, data, components, or dependencies affect an LLM application.
- `LLM04:2025` Data Poisoning: tampered data in training or retrieval stores compromises model behavior.
- `LLM05:2025` Improper Output Handling: LLM output is executed or rendered without adequate validation.
- `LLM06:2025` Excessive Agency: an LLM system receives excessive permissions or action scope.
- `LLM07:2025` System Prompt Leakage: an LLM system exposes its internal instructions to an untrusted user.
- `LLM08:2025` Vector and Embedding Weaknesses: weaknesses in vector or embedding stores affect retrieval integrity.
- `LLM09:2025` Misinformation: unreliable model outputs can create unsafe downstream behavior.
- `LLM10:2025` Unbounded Consumption: uncontrolled model use creates resource, cost, or availability abuse.

Source: [OWASP Top 10 for LLM Applications](https://owasp.org/www-project-top-10-for-large-language-model-applications/).

## v0.4 threat-type coverage

The following taxonomy entries are documented references; `detectable` means a tested static rule exists, while `documented-only` means no active scanner rule is claimed.

- `agent-manipulation/cross-agent` — detectable: trust boundaries between agents can pass unsafe tool arguments.
- `agent-manipulation/jailbreak` — documented-only: jailbreak behavior is context-dependent.
- `agent-manipulation/ai-ethics` — documented-only: ethical judgment is not a reliable regex target.
- `agent-manipulation/human-trust` — documented-only: deception and trust exploitation require context.
- `agent-manipulation/social-engineering` — documented-only: social-engineering intent is context-dependent.
- `data-poisoning/tool-injection` — detectable: tool output can become trusted model instructions.
- `data-poisoning/memory-issues` — documented-only: memory safety requires data-flow context.
- `data-poisoning/graph-query-injection` — detectable: graph query construction can inject untrusted syntax.
- `data-poisoning/dataset-issues` — detectable: untrusted content can enter retrieval or training stores.
- `prompt-injection/direct` — detectable: direct user input can alter prompt instructions.
- `prompt-injection/indirect` — detectable: fetched content can carry hidden instructions.
- `prompt-injection/jailbreak` — documented-only: prompt-specific jailbreak judgment is contextual.
- `prompt-injection/system-prompt` — detectable: user input can reach a system-role field.
- `prompt-injection/indirect-tool` — detectable: unlabeled tool output can alter model context.
- `model-security/model-behavior` — detectable: exposed provider keys weaken model-service security.
- `model-security/malicious-fine-tuning` — detectable: unverified training sources can alter a model.
- `model-security/model-catch-issue` — detectable: missing failure handling can create unsafe fallbacks.
- `model-abuse/self-harm` — documented-only: safety classification requires contextual judgment.
- `model-abuse/malicious-use` — detectable: unbounded model endpoints can enable abuse.
- `model-abuse/malware-issues` — detectable: unrestricted code execution expands harmful capability.
- `model-abuse/extraction-issues` — detectable: unthrottled output can support extraction.
- `model-abuse/money-laundering` — documented-only: financial-crime facilitation is domain-contextual.
- `model-abuse/deepfake` — documented-only: output-quality judgment requires content classification, not a static pattern.
- `model-abuse/human-trafficking` — documented-only: real-world harm category with no source-code signature.

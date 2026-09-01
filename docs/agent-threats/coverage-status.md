# Agent-threat coverage status

Coverage tiers describe what is shipped: `detectable` has a tested static rule; `documented-only` has framework guidance but no scanner rule; `planned` is a future backlog item.

| Threat-Type | Coverage Tier | Rule(s) |
|---|---|---|
| supply-chain/dependency-confusion | detectable | [dependency-confusion-001](../../rules/agent-threats/supply-chain/dependency-confusion/dependency-confusion-001.yaml) |
| agent-manipulation/cross-agent | runtime-detectable | [unvalidated-tool-args-001](../../rules/agent-threats/agent-manipulation/cross-agent/unvalidated-tool-args-001.yaml), `agent-security-monitor` |
| agent-manipulation/jailbreak | documented-only | — |
| agent-manipulation/ai-ethics | documented-only | — |
| agent-manipulation/human-trust | documented-only | — |
| agent-manipulation/social-engineering | documented-only | — |
| data-poisoning/tool-injection | detectable | [tool-output-injection-001](../../rules/agent-threats/data-poisoning/tool-injection/tool-output-injection-001.yaml) |
| data-poisoning/memory-issues | detectable | [agent-context-poisoning-001](../../rules/agent-threats/data-poisoning/memory-issues/agent-context-poisoning-001.yaml), [memory-write-without-integrity-001](../../rules/agent-threats/data-poisoning/memory-issues/memory-write-without-integrity-001.yaml) |
| data-poisoning/vector-isolation | detectable | [vector-store-tenant-isolation-001](../../rules/agent-threats/data-poisoning/vector-isolation/vector-store-tenant-isolation-001.yaml), [rag-retrieval-access-control-001](../../rules/agent-threats/data-poisoning/vector-isolation/rag-retrieval-access-control-001.yaml) |
| data-poisoning/graph-query-injection | detectable | [graph-query-injection-001](../../rules/agent-threats/data-poisoning/graph-query-injection/graph-query-injection-001.yaml) |
| data-poisoning/graph-query-injection | detectable | [graph-query-injection-001](../../rules/agent-threats/data-poisoning/graph-query-injection/graph-query-injection-001.yaml) |
| data-poisoning/dataset-issues | detectable | [unsanitized-rag-write-001](../../rules/agent-threats/data-poisoning/dataset-issues/unsanitized-rag-write-001.yaml) |
| prompt-injection/direct | detectable | [unescaped-prompt-concat-001](../../rules/agent-threats/prompt-injection/direct/unescaped-prompt-concat-001.yaml) |
| prompt-injection/indirect | detectable | [indirect-prompt-injection-001](../../rules/agent-threats/prompt-injection/indirect/indirect-prompt-injection-001.yaml) |
| prompt-injection/jailbreak | documented-only | — |
| prompt-injection/system-prompt | detectable | [system-prompt-injection-001](../../rules/agent-threats/prompt-injection/system-prompt/system-prompt-injection-001.yaml) |
| prompt-injection/indirect-tool | detectable | [indirect-tool-injection-001](../../rules/agent-threats/prompt-injection/indirect-tool/indirect-tool-injection-001.yaml) |
| model-security/model-behavior | runtime-detectable | [hardcoded-llm-key-001](../../rules/agent-threats/model-security/model-behavior/hardcoded-llm-key-001.yaml), `agent-security-monitor` |
| model-security/malicious-fine-tuning | detectable | [unverified-fine-tune-source-001](../../rules/agent-threats/model-security/malicious-fine-tuning/unverified-fine-tune-source-001.yaml) |
| model-security/model-catch-issue | runtime-detectable | [missing-llm-error-handling-001](../../rules/agent-threats/model-security/model-catch-issue/missing-llm-error-handling-001.yaml), [permissive-mcp-grant-001](../../rules/agent-threats/model-security/model-catch-issue/permissive-mcp-grant-001.yaml), [missing-output-validation-001](../../rules/agent-threats/model-security/model-catch-issue/missing-output-validation-001.yaml), [missing-output-sanitisation-001](../../rules/agent-threats/model-security/model-catch-issue/missing-output-sanitisation-001.yaml), [system-prompt-leakage-001](../../rules/agent-threats/model-security/model-catch-issue/system-prompt-leakage-001.yaml), `agent-security-monitor` |
| model-security/mcp-security | detectable | `unrestricted-filesystem-access-001`, `unrestricted-shell-exec-001`, `missing-tool-arg-validation-001`, `missing-tool-auth-001`, `missing-destructive-action-confirmation-001`, `excessive-tool-permissions-001`, `unbounded-tool-output-001`, `tool-ssrf-001`, `sensitive-data-in-resources-001`, `unsafe-server-instructions-001`, `missing-audit-logging-001`, `missing-tool-rate-limiting-001`, `tool-description-prompt-injection-001` |
| model-security/model-provenance | detectable | [model-integrity-verification-001](../../rules/agent-threats/model-security/model-provenance/model-integrity-verification-001.yaml), [training-data-provenance-missing-001](../../rules/agent-threats/model-security/model-provenance/training-data-provenance-missing-001.yaml) |
| supply-chain/tool-integrity | detectable | [tool-poisoning-001](../../rules/agent-threats/supply-chain/tool-integrity/tool-poisoning-001.yaml), [tool-schema-drift-001](../../rules/agent-threats/supply-chain/tool-integrity/tool-schema-drift-001.yaml) |
| sensitive-data | detectable | [embedding-sensitive-data-001](../../rules/agent-threats/sensitive-data/embedding-sensitive-data-001.yaml), [agent-credential-exposure-001](../../rules/agent-threats/sensitive-data/agent-credential-exposure-001.yaml), [sensitive-retrieval-in-prompt-001](../../rules/agent-threats/sensitive-data/sensitive-retrieval-in-prompt-001.yaml) |
| agent-autonomy | detectable | [high-impact-action-without-approval-001](../../rules/agent-threats/agent-autonomy/high-impact-action-without-approval-001.yaml), [agent-loop-budget-missing-001](../../rules/agent-threats/model-security/model-catch-issue/agent-loop-budget-missing-001.yaml) |
| agent-configuration | detectable | [agent-config-tampering-001](../../rules/agent-threats/agent-configuration/agent-config-tampering-001.yaml) |
| runtime-monitor/future | runtime-detectable (planned) | `prompt-obfuscation-001`, `agent-action-replay-001`, `recursive-agent-delegation-001`, `model-extraction-query-pattern-001` |
| appsec/data-lifecycle | detectable | [missing-breach-notification-001](../../rules/appsec/data-lifecycle/missing-breach-notification-001.yaml) |
| model-abuse/self-harm | documented-only | — |
| model-abuse/malicious-use | detectable | [no-llm-rate-limit-001](../../rules/agent-threats/model-abuse/malicious-use/no-llm-rate-limit-001.yaml) |
| model-abuse/malware-issues | detectable | [unrestricted-code-exec-001](../../rules/agent-threats/model-abuse/malware-issues/unrestricted-code-exec-001.yaml), `unvalidated-agent-write-001` |
| model-abuse/extraction-issues | detectable | [unthrottled-model-output-001](../../rules/agent-threats/model-abuse/extraction-issues/unthrottled-model-output-001.yaml) |
| model-abuse/money-laundering | documented-only | — |
| model-abuse/stolen-credential | detectable | [credential-stuffing-pattern-001](../../rules/agent-threats/model-abuse/stolen-credential/credential-stuffing-pattern-001.yaml), [session-fixation-001](../../rules/agent-threats/model-abuse/stolen-credential/session-fixation-001.yaml) |
| model-abuse/darknet-control | detectable | [onion-callback-endpoint-001](../../rules/agent-threats/model-abuse/darknet-control/onion-callback-endpoint-001.yaml), [i2p-endpoint-001](../../rules/agent-threats/model-abuse/darknet-control/i2p-endpoint-001.yaml) |
| model-abuse/trojan | detectable | [remote-payload-exec-001](../../rules/agent-threats/model-abuse/trojan/remote-payload-exec-001.yaml), [insecure-auto-update-001](../../rules/agent-threats/model-abuse/trojan/insecure-auto-update-001.yaml) |
| model-abuse/pii-leakage-in-output | runtime-detectable | `agent-security-monitor` |
| model-abuse/deepfake | documented-only | — |
| model-abuse/human-trafficking | documented-only | — |
| appsec/access-control | detectable | [broken-object-level-authz-001](../../rules/appsec/access-control/broken-object-level-authz-001.yaml) |
| appsec/cryptography | detectable | [weak-cipher-001](../../rules/appsec/cryptography/weak-cipher-001.yaml), [insecure-random-001](../../rules/appsec/cryptography/insecure-random-001.yaml) |
| appsec/xss | detectable | [xss-reflected-js-001](../../rules/appsec/xss/xss-reflected-js-001.yaml), [xss-innerHTML-001](../../rules/appsec/xss/xss-innerHTML-001.yaml) |
| appsec/vulnerable-components | documented-only | Requires CVE advisory feed and manifest parsing — beyond scope of offline regex engine. Use `npm audit` in CI. |
| appsec/ssrf | detectable | [ssrf-pattern-js-001](../../rules/appsec/ssrf/ssrf-pattern-js-001.yaml) |

The two `jailbreak` threat-types are intentionally distinct: agent-manipulation/jailbreak concerns agent decision/tool-use manipulation, while prompt-injection/jailbreak concerns jailbreak delivered through prompt injection.

# Human Trafficking Threat

**Coverage Tier:** `documented-only`

## Why static detection is not feasible

Static detection is not feasible for this Threat-Type because human trafficking is a real-world harm category with no source-code signature at all. There is no regex, AST pattern, or static heuristic that indicates an application facilitates human trafficking specifically, as opposed to any other illegal or legal coordination activity. Forcing a rule here would be pure theater.

## Risk Description

Human trafficking involves the exploitation of individuals for labor or commercial sex through force, fraud, or coercion. AI applications might be abused to coordinate logistics, generate deceptive recruiting materials, or obfuscate communications related to trafficking networks.

## Framework References

- **OWASP LLM Top 10:** [LLM09:2025 Misinformation](../../../../docs/owasp/llm-top-10.md)
- **MITRE ATLAS:** [AML.T0048 External Harms](../../../../docs/frameworks/mitre-atlas.md)

*Note: This Threat-Type may become partially `runtime-detectable` in a future version if a genuine behavioral signal is identified — but that is not designed or assumed here.*

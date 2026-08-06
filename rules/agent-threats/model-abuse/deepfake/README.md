# Deepfake Threat

**Coverage Tier:** `documented-only`

## Why static detection is not feasible

Static detection is not feasible for this Threat-Type because determining whether code produces a deepfake is a content/output-quality judgment, not a source-code pattern. A rule that flags "any code calling an image/video generation API" would have enormous false-positive rates against entirely legitimate generative-AI applications.

## Risk Description

Deepfakes involve the generation of highly realistic, manipulated media (audio, video, or images) that depict real individuals saying or doing things they never did. The primary risk is the creation of non-consensual synthetic media, misinformation, or impersonation materials used for fraud or social engineering.

## Framework References

- **OWASP LLM Top 10:** [LLM09:2025 Misinformation](../../../../docs/owasp/llm-top-10.md)
- **MITRE ATLAS:** [AML.T0048 External Harms](../../../../docs/frameworks/mitre-atlas.md)

*Note: This Threat-Type may become partially `runtime-detectable` in a future version if a genuine behavioral signal is identified (e.g., output-classification of generated media at the application layer) — but that is not designed or assumed here.*

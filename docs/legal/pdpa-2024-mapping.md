# PDPA mapping notes

This file records the sources used by rules that carry a `maps_to.pdpa` value. It is not legal advice. Rule findings are security review signals and do not establish that a legal breach occurred.

## Sources

- [Personal Data Protection Act 2010 (Act 709), official JPDP copy](https://www.pdp.gov.my/ppdpv1/wp-content/uploads/2024/07/UNDANG-UNDANG-MALAYSIA_AKTA_PERLINDUNGAN_DATA_PERIBADI_2010_709_MALAY_AND-ENG_V2022.pdf)
- [Personal Data Protection (Amendment) Act 2024, official JPDP page](https://www.pdp.gov.my/ppdpv1/en/akta/personal-data-protection-amendment-act-2024/)

## Rule mappings

| Rule | Mapping | Source note |
|---|---|---|
| `hardcoded-secret-001` | Section 25, Act 709 (as amended) | See the official Act 709 source above. The rule identifies exposed credential material; it does not determine statutory liability. |
| `pii-in-logs-001` | Section 9, Act 709 (as amended) | See the official Act 709 and 2024 Amendment sources above. The rule is a plaintext-logging heuristic and is not a legal conclusion. |
| `missing-breach-notification-001` | Section 12B, Amendment Act 2024 | The amendment source confirms the 2024 amendment; verify commencement and the exact application of Section 12B for the deployment context before relying on this mapping. |
| `pii-leakage-in-output` | Section 9, Act 709 (as amended) | Runtime detection of PII leakage patterns (PDPA Data Integrity Principle). Not a legal conclusion. |

No fines, enforcement outcomes, or legal conclusions are asserted here.

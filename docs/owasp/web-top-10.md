# OWASP Web Top 10 mappings

These are plain-language category notes for mappings used by appsec rules. They are references, not imperative advice.

- `A01:2021` Broken Access Control: missing or flawed enforcement of user permissions.
- `A02:2021` Cryptographic Failures: weak cryptography or missing encryption.
- `A03:2021` Injection: untrusted input changes an interpreter operation, including SQL construction.
- `A04:2021` Insecure Design: missing security controls in application design, such as abuse protections.
- `A05:2021` Security Misconfiguration: insecure or overly permissive configuration, including CORS.
- `A06:2021` Vulnerable and Outdated Components: (documented-only) relying on dependencies with known vulnerabilities. Use `npm audit` in CI.
- `A07:2021` Identification and Authentication Failures: exposed or mishandled authentication material.
- `A08:2021` Software and Data Integrity Failures: untrusted updates, data, or build inputs undermine integrity.
- `A09:2021` Security Logging and Monitoring Failures: insufficiently safe or useful security logging.
- `A10:2021` Server-Side Request Forgery (SSRF): fetching a remote resource without validating the user-supplied URL.

Source: [OWASP Top 10:2021](https://owasp.org/Top10/).

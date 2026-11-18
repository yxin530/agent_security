# MCP security model

The server refuses to start without explicit `allowedScanRoots`. Every scan target is realpath-resolved and checked against those roots before scanning. Sensitive segments such as `.git`, `.ssh`, `.aws`, `.azure`, `.gnupg`, `.npmrc`, `.docker`, `.kube`, `.config/gcloud`, `.git-credentials`, `.netrc`, and `.pypirc` are denied. Private-key files (`id_rsa*`, `*.pem`, `*.key`) are excluded from scans.

The scan walker applies the configured total-size limit once for both selection and scanning. Rule matching runs in worker threads with a hard timeout. MCP accepts one active scan and queues up to four more by default; excess requests return `scan queue full`. Runtime-event size is capped before its worker starts. Errors are redacted by default and do not echo rejected paths or file content. Documentation resources use an explicit allowlist and are not arbitrary file reads.

Stdio has no authentication layer: the process launcher is the trust boundary. `expectedClientIds` is a configuration sanity check only.

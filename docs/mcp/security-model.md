# MCP security model

The server refuses to start without explicit `allowedScanRoots`. Every scan target is realpath-resolved and checked against those roots before scanning. Sensitive segments such as `.git`, `.ssh`, `.aws`, `.azure`, `.gnupg`, `.npmrc`, and `.docker` are denied.

Configured maximum scan size and runtime-event size are enforced. Errors are redacted by default and do not echo rejected paths or file content. Documentation resources use an explicit allowlist and are not arbitrary file reads.

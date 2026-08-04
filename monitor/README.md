# Runtime Monitor

The runtime monitor is an opt-in library. Developers explicitly pass tool-call or LLM I/O events to `inspectRuntimeEvent`; it is never invoked by `scan`, never passively instruments applications, and never sends observed data over the network.

Runtime findings use `source: "runtime"` and should be treated separately from static findings.

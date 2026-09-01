# Runtime Agent Attacks and Monitor Design

This document outlines the design for the v0.20 runtime monitor rules, which target agent orchestration and obfuscation patterns that cannot be detected by static analysis.

## Normalized Event Schema

To support the runtime rules, the monitor expects events to be normalized into the following schema fields:

- `actor`: The entity initiating the action (user, agent, system).
- `tenant`: The tenant namespace or ID for the action context.
- `trust_label`: The inferred or explicitly assigned trust level (e.g., untrusted, trusted, admin).
- `tool_name`: The name of the tool being executed.
- `tool_version`: The version of the tool being executed.
- `action_class`: The category of the action (e.g., destructive, read-only, mutating, IPC).
- `approval_state`: The current approval state (e.g., approved, pending, none).
- `nonce` / `correlation_id`: A unique identifier tracing a multi-turn agent session or action chain.
- `parent_agent`: For multi-agent systems, the ID of the delegating or orchestrator agent.
- `depth`: The recursion or delegation depth.
- `budget`: The remaining step/token budget for the agent loop.
- `provenance`: The origin source or signature metadata of the event payload.

## Planned Runtime Rules

The following four runtime rule designs will consume the normalized event schema:

### 1. `prompt-obfuscation-001`
Detects runtime payloads where the prompt content features high entropy, excessive encoding (Base64, hex), or adversarial formatting designed to evade static signature matching.

### 2. `agent-action-replay-001`
Detects when the exact same tool invocation (same tool, same arguments) is repeated abnormally by an agent in a tight loop, or when a high-impact action is replayed with a stale `nonce` / `correlation_id`.

### 3. `recursive-agent-delegation-001`
Detects when an agent delegates tasks to a sub-agent where the `depth` exceeds a safe threshold, potentially leading to infinite recursion or unbounded resource consumption (Denial of Wallet).

### 4. `model-extraction-query-pattern-001`
Detects sequences of queries from a single `actor` or `tenant` designed to map the model's decision boundary or extract its weights/parameters (e.g., rapid, high-frequency queries with minor permutations).

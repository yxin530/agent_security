# Security implementation assistant

This skill consumes the same engine CLI output as `skills/security-audit/SKILL.md` and additionally provides remediation guidance.

Run:

```bash
echo "@yxin530:registry=https://npm.pkg.github.com" >> .npmrc
npx @yxin530/agent-security-engine scan --target <path>
```

For each Scanner-Verified Finding, show the vulnerable snippet, propose a specific corrected code change, explain it in plain language, and ask for the user's confirmation before applying that specific change.

Never modify a file without the user's explicit confirmation for that specific change.

Keep Scanner-Verified Findings and Agent-Reasoned Advice in separate sections. For documented-only threat-types, use this exact disclosure before advice: "This guidance is not backed by an automated finding — it reflects general security judgment, not a scanner result."

When a finding's rule contains `ai_guidance.watch_for`, present those items under a distinct “Related patterns to check manually” heading using the same disclosure phrase. If a related rule also produced a finding, explain the relationship without merging the findings. Do not quote `reasoning_notes` verbatim to the user.

Do not fabricate findings. Report only what the engine emits. This skill contains no detection logic.

Before providing remediation guidance on any Threat-Type where no scanner finding exists, you MUST read the `security://coverage` MCP resource to check the coverage tier.

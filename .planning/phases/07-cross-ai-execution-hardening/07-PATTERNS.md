# Phase 7: Cross-AI Execution Hardening - Patterns

## Target Files and Closest Analogs

| Target file / area | Role | Closest existing analog | Why it matters |
|---|---|---|---|
| `get-shit-done/workflows/execute-phase.md` | Main cross-AI routing and recovery workflow surface | Itself | Already contains the optional cross-AI delegation step; Phase 7 should harden, not replace it |
| `tests/cross-ai-execution.test.cjs` | Cross-AI regression surface | Itself | Best place to lock routing, config, and malformed-output guardrails without overfitting runtime-specific behavior |
| `get-shit-done/workflows/review.md` | External AI stdin invocation pattern | Itself | Shows how this repo already drives external AI CLIs with stdin + timeout wrappers |
| `get-shit-done/workflows/ship.md` | External command failure handling analog | Itself | Demonstrates prompt piping, stderr capture, timeout handling, and warning-oriented failure behavior |
| `sdk/src/query/runtime-model-contract.ts` | Runtime capability truth | Itself | Phase 7 must respect direct runtime support and only use cross-AI when direct binding is unavailable |
| `sdk/src/query/runtime-model-validation.ts` | Strict binding diagnostics | Itself | Already encodes “cross-AI is explicit remediation, not silent fallback” |
| `sdk/src/query/config-mutation.ts` | Supported config mutation surface | Itself | Existing allowlist already covers `workflow.cross_ai_execution`, `workflow.cross_ai_command`, and `workflow.cross_ai_timeout` |

## Established Code Patterns

### Adapter-first pattern
- Runtime/provider special behavior should live in capability and adapter layers first.
- The Hermes-specific mixed-provider support belongs in runtime capability classification, not in broad workflow rewrites.

### Workflow-preserving pattern
- Existing markdown workflows are already a major upstream sync surface.
- Prefer tightening semantics around current steps instead of inserting large new branches or re-architecting execution flow.

### External command via stdin pattern
- `review.md` and `ship.md` already use prompt piping through stdin instead of shell interpolation.
- Phase 7 should mirror that pattern for safety and consistency.

### Orchestrator-owned state pattern
- Shared state files stay local and orchestrator-owned.
- External AI output is treated as candidate execution output, not authoritative shared-state mutation.

## Integration Points

### Direct-binding boundary
- `sdk/src/query/runtime-model-contract.ts`
- `sdk/src/query/runtime-model-validation.ts`
- Any init/runner path that decides whether explicit direct execution is valid

### Cross-AI routing boundary
- `get-shit-done/workflows/execute-phase.md`
- CLI flags `--cross-ai` and `--no-cross-ai`
- Config values `workflow.cross_ai_execution`, `workflow.cross_ai_command`, `workflow.cross_ai_timeout`
- Plan frontmatter `cross_ai: true`

### Result handling boundary
- Candidate SUMMARY.md content emitted by external command
- Dirty working tree warnings
- Retry / skip / abort handling after timeout, failure, or malformed output

## Pattern Guidance for Planning

- Do not replace direct Hermes-native mixed-provider execution with cross-AI delegation when direct binding is already valid.
- Keep routing deterministic: CLI flag first, config second, plan frontmatter lower priority.
- Reuse existing stdin + timeout + stderr capture patterns from review/ship workflows.
- Introduce at most a small reusable helper for routing/result validation if workflow markdown alone would be too hard to regression-test.
- Treat malformed or incomplete external output as failure, not partial success.
- Preserve orchestrator-owned summary/state finalization rather than delegating shared-state truth to the external AI command.

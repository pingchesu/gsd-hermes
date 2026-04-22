# Phase 7: Cross-AI Execution Hardening - Discussion Log

**Mode:** discuss
**Date:** 2026-04-22

## Summary

Phase 7 discussion focused on four core decisions: the minimum acceptable external summary contract, auto-recovery behavior for failures, routing precedence, and ownership of state/commit updates when external AI is involved.

## Captured Decisions

### External command contract
- The user chose a middle-ground contract.
- `cross_ai_command` does not need the full internal SUMMARY shape.
- It must still provide at least:
  - clear completion summary
  - what changed
  - verification results
  - failures/deviations when applicable

### Failure and recovery behavior
- The user chose automatic recovery.
- Certain failure classes may auto-retry or auto-fallback.
- Human intervention should happen only after retries still fail or risk increases.

### Activation and routing rules
- The user chose the active routing model.
- CLI flag priority is highest.
- Config comes next and may proactively drive routing behavior.
- Plan frontmatter has lower priority than CLI and config.

### State and commit ownership
- The user chose orchestrator-first ownership.
- Shared state updates remain orchestrator-owned.
- External execution may produce code/results, but orchestrator is the source of truth for phase/project state transitions.

## Notes

- The user wants a practical external contract, not a brittle one.
- The user prefers fewer interruptions during failure handling.
- The user wants routing to be deterministic and config-driven.
- The user does not want shared planning/state consistency delegated to external AI.

## Deferred to Later Phases

- Broader workflow-wide rollout beyond cross-AI hardening
- Deep backend redesign not required for this phase

---

*Phase: 07-cross-ai-execution-hardening*
*Discussion logged: 2026-04-22*

# Phase 6: Strict Binding Enforcement - Discussion Log

**Mode:** discuss
**Date:** 2026-04-22

## Summary

Phase 6 discussion focused on where fail-fast validation should happen, how detailed the error messages should be, how conservative migration behavior should remain, and how far execution-path integration should go in this phase.

## Captured Decisions

### Validation trigger points
- The user chose a conservative trigger strategy.
- Do not add new blocking validation in `config-set`.
- Do not move fail-fast to generic init-time config editing flows.
- Fail-fast should happen when plan/execute is actually about to run.

### Error diagnostics
- The user chose the most explicit diagnostic style.
- Every fail-fast error must include:
  - agent
  - runtime
  - configured/resolved model
  - failure reason
  - suggested fix
  - whether `cross_ai_execution` is a valid alternative

### Legacy config compatibility
- The user wants compatibility preserved unless an unsupported explicit model is requested.
- Legacy configs should not start failing just because Phase 6 becomes stricter.
- `resolve_model_ids: "omit"` remains valid runtime-default behavior.

### Execution integration boundary
- The user chose the middle integration boundary.
- Add fail-fast checks in workflow entry paths.
- Add an execution-time guard in `phase-runner`.
- Do not deeply rewrite `session-runner` in this phase.

## Notes

- The user wants runtime enforcement to be real, but not at the cost of broad config-editing breakage.
- The user prefers an operator-first CLI experience where failures are explicit and actionable.
- The user is intentionally deferring deeper cross-AI runtime behavior and backend redesign to later phases.

## Deferred to Later Phases

- `cross_ai_execution` hardening and malformed-output handling
- broader workflow-wide rollout and documentation cleanup
- deeper `session-runner` / backend unification

---

*Phase: 06-strict-binding-enforcement*
*Discussion logged: 2026-04-22*

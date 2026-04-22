# Phase 6: Strict Binding Enforcement - Discussion Log

**Mode:** discuss
**Date:** 2026-04-22

## Summary

Phase 6 discussion focused on where fail-fast validation should trigger, how explicit the error output should be, how conservative backward compatibility should remain, and how far execution-time integration should go in this phase.

## Captured Decisions

### Validation trigger points
- The user chose the conservative trigger strategy.
- Do not add new blocking validation in `config-set`.
- Do not move fail-fast into generic config editing or passive init-time flows.
- Trigger fail-fast only when planning or execution is actually about to run.

### Error diagnostics
- The user chose the most detailed diagnostic style.
- Every fail-fast error must include:
  - agent
  - runtime
  - configured/resolved model
  - failure reason
  - suggested fix
  - whether `cross_ai_execution` is a valid alternative

### Legacy config compatibility
- The user wants compatibility preserved unless an unsupported explicit model is requested.
- Existing configs should keep working when they do not explicitly request an unsupported binding.
- `resolve_model_ids: "omit"` remains a valid runtime-default state.

### Execution integration boundary
- The user chose the middle integration boundary.
- Add fail-fast checks in workflow entry paths.
- Add a second safety guard in `phase-runner`.
- Do not deeply rewrite `session-runner` in this phase.

## Notes

- The user wants real enforcement, but not at the cost of broad config-editing breakage.
- The user prefers actionable operator-facing diagnostics over concise generic errors.
- The user explicitly does not want `cross_ai_execution` to become an implicit fallback in this phase.

## Deferred to Later Phases

- `cross_ai_execution` hardening and malformed-output handling
- broader workflow-wide rollout and docs cleanup
- deep `session-runner` / backend unification

---

*Phase: 06-strict-binding-enforcement*
*Discussion logged: 2026-04-22*

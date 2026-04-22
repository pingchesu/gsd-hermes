# Phase 5: Runtime Model Contract - Discussion Log

**Mode:** discuss
**Pacing:** batch
**Date:** 2026-04-22

## Summary

The discussion focused on Phase 5 contract boundaries rather than implementation details. The user clarified how strict the runtime-model contract should be, where fail-fast behavior should trigger, and how much of `cross_ai_execution` belongs in this phase.

## Captured Decisions

### Batch 1
1. **Source of truth**
   - User chose: SDK first, legacy CJS follows SDK semantics.
2. **Unknown / partially covered agents**
   - User chose: fail fast instead of fallback.
3. **`resolve_model_ids: "omit"` semantics**
   - User chose: empty model is a valid runtime-default binding.
4. **Cross-AI in Phase 5**
   - User chose: Phase 5 only defines `cross_ai_execution` as a valid execution mode; hardening belongs to Phase 7.

### Batch 2
1. **Capability representation**
   - User chose: explicit runtime capability registry/table/type.
2. **Fail-fast timing**
   - User chose: detect and fail in config/init flow before actual spawn.
3. **Migration strategy**
   - User chose: preserve existing behavior unless the user explicitly requests an unsupported binding.
4. **Error contract**
   - User chose: Phase 5 should include the error-message contract shape.

## Notes

- The user wants enforceable config semantics: if a model is configured for an agent, the system should either honor it or fail clearly.
- The user explicitly rejected silent fallback.
- The user is comfortable deferring deeper `cross_ai_execution` operational work to later phases as long as the contract layer acknowledges it now.

## Deferred to Later Phases

- Cross-AI hardening and malformed-output handling
- Workflow-wide propagation beyond the Phase 5 contract layer
- Broader migration/documentation rollout

---

*Phase: 05-runtime-model-contract*
*Discussion logged: 2026-04-22*

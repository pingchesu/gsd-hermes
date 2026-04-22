# Phase 8: Workflow Integration and Migration Safety - Context

**Gathered:** 2026-04-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply the new runtime-model semantics consistently across workflows, documentation, and tests while keeping existing non-Claude runtime installs on a safe upgrade path. This phase is the broad rollout and cleanup phase for the contract, strict validation, Hermes multi-provider direct binding, and the explicit cross-AI fallback path.

It should make the user-facing and maintainer-facing surfaces consistent without redesigning the project into a heavily divergent Hermes-only workflow system.

</domain>

<decisions>
## Implementation Decisions

### Rollout Scope
- **D-01:** Phase 8 should use the broad rollout option: align all discoverable workflow, init, docs, and test surfaces that expose or depend on runtime/model/cross-AI semantics.
- **D-02:** Even with broad rollout, implementation should still prefer centralized adapter/seam changes over bespoke per-workflow rewrites wherever possible.
- **D-03:** Broad rollout means drift cleanup is part of the phase, not deferred.

### Migration Strategy
- **D-04:** Migration should stay at the medium-aggressive level: unsupported configurations still fail fast, but the project should add clear warnings, upgrade guidance, and recommended replacement config patterns.
- **D-05:** Phase 8 must not silently rewrite or auto-mutate user config files as part of migration safety.
- **D-06:** Migration UX should help users understand whether they should use direct binding, `inherit`, `resolve_model_ids: "omit"`, or `cross_ai_execution`, but the final config change remains user-controlled.

### Documentation Strategy
- **D-07:** Phase 8 should perform broad documentation alignment, including `CONFIGURATION`, `USER-GUIDE`, `FEATURES`, `COMMANDS`, and relevant translated docs where drift exists.
- **D-08:** Even with broad documentation updates, documentation should still converge toward a clear canonical hierarchy so future drift is less likely.
- **D-09:** The docs must clearly distinguish these paths:
  - direct explicit binding
  - `inherit`
  - runtime-default binding via `resolve_model_ids: "omit"`
  - explicit external fallback via `cross_ai_execution`

### Runtime / Model Visibility
- **D-10:** Phase 8 should use high visibility: binding/runtime/cross-AI state should be broadly queryable and visible, not only shown on failures.
- **D-11:** Key user-visible surfaces such as progress, settings/config inspection, and init-facing payloads should expose enough runtime-model state for debugging and operations.
- **D-12:** High visibility must remain structured and operator-useful rather than noisy or ad hoc.

### Upstream Compatibility Guardrail
- **D-13:** Even though rollout is broad, the phase should preserve the fork's upstream-friendly architecture: centralize semantics in adapter/query/contract seams and use workflow/doc propagation mainly to reflect that truth, not to invent runtime-specific logic in many places.
- **D-14:** Hermes-specific support should continue to live in the Hermes adapter seam, with broad workflow changes focused on semantic propagation and documentation consistency rather than fork-only behavior changes.

### Claude's Discretion
- Exact canonical documentation hierarchy, as long as future drift risk is materially reduced.
- Exact list/order of workflow and docs surfaces to touch first, as long as broad rollout is achieved within the phase boundary.
- Exact formatting of status/inspection payloads, as long as runtime-model state becomes genuinely visible and useful.

</decisions>

<specifics>
## Specific Ideas

- The user wants provider switching to work in practice, but without making the fork painful to keep synced with upstream.
- The user explicitly accepted a larger downstream diff in Phase 8 if that is what it takes to align all runtime/model/cross-AI surfaces in one pass.
- The user wants migration help to be explicit and actionable, but not automatic.
- The user prefers high observability into binding/runtime/cross-AI state so debugging and maintenance are easier.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone and phase requirements
- `.planning/ROADMAP.md` — Phase 8 goal, success criteria, and milestone-wide validation matrix.
- `.planning/REQUIREMENTS.md` — Phase 8 requirements `WDI-01`, `WDI-02`, `WDI-03`, `WDI-04`, `MIG-01`, `MIG-02`, `MIG-03`.
- `.planning/PROJECT.md` — milestone-level product intent and fork maintenance constraints.

### Prior phase decisions that Phase 8 must propagate, not reopen
- `.planning/phases/05-runtime-model-contract/05-CONTEXT.md` — canonical contract semantics and strict binding intent.
- `.planning/phases/06-strict-binding-enforcement/06-CONTEXT.md` — fail-fast boundaries and conservative validation policy.
- `.planning/phases/07-cross-ai-execution-hardening/07-CONTEXT.md` — explicit cross-AI fallback semantics, routing priority, and orchestrator ownership.
- `.planning/phases/07-cross-ai-execution-hardening/07-01-SUMMARY.md` — cross-AI routing/result contract hardening.
- `.planning/phases/07-cross-ai-execution-hardening/07-02-SUMMARY.md` — ownership/docs clarification and preserved direct Hermes path.

### Runtime-model implementation surfaces
- `sdk/src/query/runtime-model-contract.ts` — current canonical runtime capability and binding semantics.
- `sdk/src/query/runtime-model-validation.ts` — strict validation, routing/result helper logic, and operator-facing diagnostics.
- `sdk/src/query/init.ts` — init payload boundary where visibility and propagation may need expansion.
- `sdk/src/query/config-query.ts` — config/runtime-model query surface.
- `sdk/src/query/config-mutation.ts` — supported config mutation surface for runtime-model and cross-AI settings.
- `sdk/src/phase-runner.ts` — execution-time propagation surface.
- `sdk/src/init-runner.ts` — project-init propagation surface.

### Workflow and documentation rollout surfaces
- `get-shit-done/workflows/execute-phase.md` — current hardened cross-AI execution semantics.
- `get-shit-done/workflows/progress.md` — likely visibility/reporting surface.
- `get-shit-done/workflows/settings.md` — likely runtime/model settings visibility surface.
- `docs/CONFIGURATION.md` — configuration schema and semantics reference.
- `docs/USER-GUIDE.md` — user-facing runtime/model guidance.
- `docs/FEATURES.md` — product-level capability statements.
- `docs/COMMANDS.md` — command-surface expectations and drift checks.
- `docs/fork-ownership.md` — seam guidance for keeping downstream changes upstream-friendly.

### Regression surfaces
- `tests/cross-ai-execution.test.cjs` — cross-AI and mixed-provider behavior guardrail.
- `sdk/src/query/init.test.ts` — init payload and validation propagation.
- `sdk/src/query/config-query.test.ts` — contract/query semantics.
- `tests/bug-1829-inherit-model-profile.test.cjs` — legacy compatibility around inherit/omit semantics.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `sdk/src/query/runtime-model-contract.ts` already centralizes most runtime/model truth and is the best place to avoid semantic drift.
- `sdk/src/query/runtime-model-validation.ts` already contains structured diagnostics plus cross-AI routing/result helpers that can become the common semantic source for rollout.
- `tests/cross-ai-execution.test.cjs`, `sdk/src/query/init.test.ts`, and `sdk/src/query/config-query.test.ts` already form the core regression net for Phase 8 propagation.
- `docs/fork-ownership.md` already defines the Hermes adapter seam philosophy that this phase should preserve.

### Established Patterns
- Runtime/model semantics now live in SDK-side contract/query layers first, with workflows and docs reflecting them afterward.
- Hermes direct mixed-provider binding is now a first-class direct path, while `cross_ai_execution` remains explicit fallback rather than universal routing.
- `resolve_model_ids: "omit"` and `inherit` are already treated as meaningfully distinct paths, not generic omissions.
- Workflow markdown remains an upstream-sensitive surface, so broad rollout should prefer canonical helper semantics plus documentation alignment instead of scattered logic forks.

### Integration Points
- `init` queries, settings/progress-style workflows, and execution workflows are the highest-value rollout points for semantic visibility.
- Documentation drift is currently likely across main docs and translated docs, especially around non-Claude runtimes, `inherit`, and `resolve_model_ids: "omit"`.
- Migration safety work should connect fail-fast errors to docs/guidance surfaces without automatically editing config.

</code_context>

<deferred>
## Deferred Ideas

- Automatic config rewrites or migration mutators — outside this phase; user explicitly does not want silent or automatic config mutation.
- Large runtime/backend redesign beyond semantic propagation — outside this phase.
- New runtime additions beyond inherited upstream/runtime seam support — outside milestone scope.

</deferred>

---

*Phase: 08-workflow-integration-and-migration-safety*
*Context gathered: 2026-04-23*

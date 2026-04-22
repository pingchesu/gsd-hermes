# Phase 6: Strict Binding Enforcement - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Add fail-fast validation so unsupported runtime/model combinations are rejected before planning or execution proceeds, with actionable diagnostics for explicit, inherited, and runtime-default bindings. This phase should enforce the Phase 5 contract in workflow/runner entry points without broadening into Phase 7 cross-AI hardening or Phase 8 full workflow-wide rollout.

</domain>

<decisions>
## Implementation Decisions

### Validation trigger points
- **D-01:** Phase 6 should not add new blocking validation to `config-set` or general init-time config mutation.
- **D-02:** Fail-fast validation should trigger only when a plan or execution flow is actually about to run, so the user gets blocked before real execution but not while merely editing config.
- **D-03:** `plan-phase` and `execute-phase` entry paths are the primary fail-fast gates for this phase.

### Error diagnostics
- **D-04:** Every fail-fast error must be highly explicit and include the agent, runtime, configured or resolved model, failure reason, suggested fix, and whether `cross_ai_execution` is a valid alternative.
- **D-05:** Error output should be optimized for operator action, not terse CLI brevity.
- **D-06:** Phase 6 should define a reusable error-shape contract rather than ad hoc strings per caller.

### Compatibility policy
- **D-07:** Only explicitly unsupported model selections should block execution in this phase.
- **D-08:** Legacy configurations that do not explicitly request unsupported bindings should keep existing behavior.
- **D-09:** `resolve_model_ids: "omit"` runtime-default behavior remains valid and must not be treated as an execution error by itself.

### Execution integration boundary
- **D-10:** Phase 6 should implement fail-fast checks in workflow entry paths and also add an execution-time guard in `phase-runner`.
- **D-11:** Phase 6 should not deeply rewrite `session-runner`; leave deeper execution backend unification for later work unless a minimal adjacent fix is strictly necessary.
- **D-12:** `cross_ai_execution` may appear in suggested fixes, but this phase must not harden or expand that path beyond recommendation-level handling.

### Claude's Discretion
- Exact module placement for shared validation helpers, as long as they consume the Phase 5 contract.
- Whether the workflow-facing guard is implemented in dedicated helper functions or directly in `plan-phase` / `execute-phase` orchestration support code.
- The exact formatting of multi-line error output, provided the required fields remain visible and structured.

</decisions>

<specifics>
## Specific Ideas

- The user wants the system to "噴錯讓我知道" as soon as a real plan/execute run would use an unsupported binding.
- The user explicitly chose a conservative integration boundary: block at runtime entry points first, not at config editing time.
- The user wants precise operator-facing diagnostics, not vague validation failures.
- The user wants `cross_ai_execution` surfaced as an escape hatch in errors, but not implemented as implicit fallback.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase and milestone requirements
- `.planning/ROADMAP.md` — Phase 6 goal, success criteria, dependency on Phase 5, and scope boundary relative to Phases 7 and 8.
- `.planning/REQUIREMENTS.md` — Phase 6 requirements `SBV-01`, `SBV-02`, `SBV-03`, `SBV-04`.
- `.planning/PROJECT.md` — milestone goal and high-level product intent for strict per-agent model enforcement.

### Prior phase outputs
- `.planning/phases/05-runtime-model-contract/05-CONTEXT.md` — locked Phase 5 decisions that Phase 6 must respect.
- `.planning/phases/05-runtime-model-contract/05-RESEARCH.md` — Phase 5 findings on current runtime/model semantics, parity, and migration constraints.
- `.planning/phases/05-runtime-model-contract/05-01-SUMMARY.md` — SDK-first contract work already completed.
- `.planning/phases/05-runtime-model-contract/05-02-SUMMARY.md` — legacy CJS parity work already completed.

### Runtime-model implementation surface
- `sdk/src/query/runtime-model-contract.ts` — canonical Phase 5 runtime-model contract.
- `sdk/src/query/config-query.ts` — current resolver entry point that now adapts the contract.
- `sdk/src/query/init.ts` — init payload generation that must not silently flatten unsupported states.
- `sdk/src/phase-runner.ts` — target location for execution-time guard in this phase.
- `sdk/src/session-runner.ts` — boundary file to avoid over-expanding in this phase.

### Operator-facing docs
- `docs/CONFIGURATION.md` — documented user semantics for model settings and `cross_ai_execution`.
- `docs/USER-GUIDE.md` — runtime-facing user expectations and remediation language.

[If no external specs: "No external specs — requirements fully captured in decisions above"]
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `sdk/src/query/runtime-model-contract.ts` already contains the structured binding contract from Phase 5.
- `sdk/src/query/config-query.ts` already adapts structured contract results and is the natural place to reuse validation helpers.
- `sdk/src/phase-runner.ts` is the right execution-time orchestration seam for a final pre-run guard.
- `sdk/src/query/init.ts` already provides workflow entry payloads that Phase 6 can enrich or validate against.

### Established Patterns
- The repo now distinguishes explicit, inherit, and runtime-default binding semantics at the contract layer.
- `config-set` and config loading are intentionally permissive enough that runtime-facing checks should happen closer to execution.
- `cross_ai_execution` is already a documented config surface, but hardening is intentionally deferred.
- Phase 5 already made SDK the source of truth, so Phase 6 should consume that contract rather than rebuild validation logic separately.

### Integration Points
- `plan-phase` should fail fast before planning proceeds when the resolved planner/checker/research bindings are unsupported.
- `execute-phase` should fail fast before plan execution proceeds when the resolved executor/verifier bindings are unsupported.
- `phase-runner` should provide an execution-time safety guard in case a caller reaches execution without going through the expected workflow gate.

</code_context>

<deferred>
## Deferred Ideas

- Full `cross_ai_execution` command/output validation and routing hardening — Phase 7.
- Broad workflow-wide propagation across all model-passing surfaces and docs migration rollout — Phase 8.
- Deep `session-runner` backend redesign — later phase unless a minimal fix proves unavoidable.

</deferred>

---

*Phase: 06-strict-binding-enforcement*
*Context gathered: 2026-04-22*

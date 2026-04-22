# Phase 6: Strict Binding Enforcement - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Add fail-fast validation so unsupported runtime/model combinations are rejected before planning or execution proceeds, with actionable diagnostics for explicit, inherited, and runtime-default bindings. This phase enforces the Phase 5 runtime-model contract at real workflow/runtime entry points, but does not expand into Phase 7 cross-AI hardening or Phase 8 broad rollout and cleanup.

</domain>

<decisions>
## Implementation Decisions

### Validation Trigger Points
- **D-01:** Phase 6 must not introduce new blocking validation in `config-set` or other config editing flows.
- **D-02:** Fail-fast validation must trigger only when a plan or execute flow is actually about to run.
- **D-03:** The primary validation gates for this phase are `plan-phase` and `execute-phase` entry paths.

### Error Diagnostics
- **D-04:** Every fail-fast error must include the agent, runtime, configured or resolved model, failure reason, suggested fix, and whether `cross_ai_execution` is a valid alternative.
- **D-05:** Error output should optimize for operator action and diagnosis, not terse CLI brevity.
- **D-06:** Phase 6 should use a reusable structured error-shape contract rather than ad hoc strings per caller.

### Compatibility Policy
- **D-07:** Only explicitly unsupported model selections should block execution in this phase.
- **D-08:** Legacy configurations that do not explicitly request unsupported bindings should preserve current behavior.
- **D-09:** `resolve_model_ids: "omit"` remains valid runtime-default behavior and must not be treated as an error by itself.

### Execution Integration Boundary
- **D-10:** Phase 6 should add fail-fast validation in workflow entry paths and a second safety guard in `phase-runner`.
- **D-11:** Phase 6 should not deeply rewrite `session-runner`; only a minimal adjacent fix is allowed if absolutely necessary for correctness.
- **D-12:** `cross_ai_execution` may appear in suggested fixes, but this phase must not harden or broaden cross-AI behavior beyond recommendation-level handling.

### Claude's Discretion
- Exact helper/module placement for the validation layer, as long as it consumes the Phase 5 contract instead of duplicating semantics.
- Exact wire format for structured errors, as long as all required diagnostic fields remain visible.
- Whether the workflow-facing checks are implemented in dedicated helper functions or local orchestration support code, as long as the checks stay consistent.

</decisions>

<specifics>
## Specific Ideas

- The user wants the system to "噴錯讓我知道" when a real plan/execute run would use an unsupported binding.
- The user explicitly prefers conservative integration: do not break config-editing flows just to surface errors earlier.
- The user wants high-detail, operator-friendly diagnostics instead of generic validation failures.
- The user wants `cross_ai_execution` suggested as an escape hatch when applicable, but not silently used as fallback.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase and milestone requirements
- `.planning/ROADMAP.md` — Phase 6 goal, success criteria, dependency on Phase 5, and boundary relative to Phases 7 and 8.
- `.planning/REQUIREMENTS.md` — Phase 6 requirements `SBV-01`, `SBV-02`, `SBV-03`, `SBV-04`.
- `.planning/PROJECT.md` — milestone-level strict model enforcement intent.

### Phase 5 outputs that define current truth
- `.planning/phases/05-runtime-model-contract/05-CONTEXT.md` — locked Phase 5 decisions that Phase 6 must enforce, not reopen.
- `.planning/phases/05-runtime-model-contract/05-RESEARCH.md` — current runtime/model semantics, migration constraints, and validation architecture from Phase 5.
- `.planning/phases/05-runtime-model-contract/05-01-SUMMARY.md` — SDK-first contract implementation already completed.
- `.planning/phases/05-runtime-model-contract/05-02-SUMMARY.md` — legacy CJS parity implementation already completed.

### Runtime-model implementation surfaces
- `sdk/src/query/runtime-model-contract.ts` — canonical runtime-model contract introduced in Phase 5.
- `sdk/src/query/config-query.ts` — current SDK resolver adapter over the contract.
- `sdk/src/query/init.ts` — workflow/init payload boundary that must not flatten unsupported states silently.
- `sdk/src/phase-runner.ts` — target location for execution-time guard in this phase.
- `sdk/src/session-runner.ts` — explicit boundary file to avoid over-expanding in this phase.
- `get-shit-done/bin/lib/model-profiles.cjs` — legacy parity surface already aligned to contract semantics.

### Operator-facing docs and expectations
- `docs/CONFIGURATION.md` — current documented model-setting and `cross_ai_execution` semantics.
- `docs/USER-GUIDE.md` — runtime-facing remediation and expected behavior surface.

[If no external specs: "No external specs — requirements fully captured in decisions above"]
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `sdk/src/query/runtime-model-contract.ts` already contains the contract data and structured binding semantics from Phase 5.
- `sdk/src/query/config-query.ts` already adapts structured contract outcomes and is the natural place to reuse validation helpers.
- `sdk/src/query/init.ts` is already the pre-run workflow payload seam for plan-phase.
- `sdk/src/phase-runner.ts` is the natural runtime guard seam for execute-time defense in depth.

### Established Patterns
- The repo now distinguishes explicit, inherit, and runtime-default semantics at the contract layer.
- Config editing is intentionally more permissive than runtime execution, which supports the chosen conservative validation trigger strategy.
- `cross_ai_execution` exists as documented config surface, but hardening is intentionally deferred to Phase 7.
- SDK is now the source of truth for runtime-model semantics; Phase 6 should consume that instead of recreating resolution logic.

### Integration Points
- `plan-phase` should block before planning proceeds when resolved planner/checker/research bindings are explicitly unsupported.
- `execute-phase` should block before execution proceeds when executor/verifier bindings are explicitly unsupported.
- `phase-runner` should add a final execution-time guard so direct SDK paths cannot bypass the intended validation.

</code_context>

<deferred>
## Deferred Ideas

- Full `cross_ai_execution` hardening, command/output validation, and routing behavior — Phase 7.
- Broad workflow-wide rollout across all model-passing surfaces and full docs cleanup — Phase 8.
- Deep `session-runner` redesign or backend unification — later phase unless a minimal correctness fix becomes unavoidable.

</deferred>

---

*Phase: 06-strict-binding-enforcement*
*Context gathered: 2026-04-22*

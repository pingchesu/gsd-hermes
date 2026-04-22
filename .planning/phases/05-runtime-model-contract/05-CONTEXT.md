# Phase 5: Runtime Model Contract - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Define the canonical runtime capability contract plus shared model resolution and validation foundations for Phase 5 only. This phase establishes the SDK-first source of truth for runtime/model semantics, the allowed binding states, and the fail-fast contract shape that later phases will enforce and propagate. It does not yet harden `cross_ai_execution` behavior or perform full workflow-wide rollout.

</domain>

<decisions>
## Implementation Decisions

### Source of Truth
- **D-01:** The Phase 5 runtime-model contract must use the SDK as the primary source of truth, with legacy CJS behavior updated afterward to match SDK semantics.
- **D-02:** Phase 5 should introduce an explicit runtime capability contract as a clear shared data structure (registry/table/type), not leave capability rules scattered across resolver logic.

### Binding Semantics
- **D-03:** `resolve_model_ids: "omit"` producing an empty model is a valid runtime-default binding state, not an invalid or missing model.
- **D-04:** The contract must preserve three distinct binding states throughout resolution and validation: explicit model binding, inherited binding, and runtime-default binding.
- **D-05:** Unknown agents or agents not fully represented in the profile/capability tables must fail fast rather than silently falling back.

### Validation Boundary
- **D-06:** Fail-fast validation should happen as early as possible in config/init flows, before any real agent spawn or downstream execution attempt.
- **D-07:** Migration safety must preserve current behavior for existing projects unless they explicitly request an unsupported binding.
- **D-08:** Existing non-Claude configurations that rely on runtime-default behavior must keep working if they do not explicitly request unsupported models.

### Error Contract
- **D-09:** Phase 5 must define the error-message contract shape, including agent, runtime, configured or resolved model, rejection reason, and suggested fix.
- **D-10:** Error handling should be structured and reusable across later phases instead of ad hoc per workflow.

### Cross-AI Scope Boundary
- **D-11:** In Phase 5, `cross_ai_execution` should only be recognized as a valid execution mode in the contract model; actual cross-AI hardening and behavioral enforcement belong to Phase 7.

### Claude's Discretion
- Exact naming of the runtime capability registry type/module.
- Whether the shared contract lands first in `sdk/src/query/` or in a new shared SDK runtime-model module, as long as SDK remains the source of truth.
- The exact internal representation for structured validation results, provided it can express the locked distinctions above.

</decisions>

<specifics>
## Specific Ideas

- The user wants config semantics to be enforceable: if a model is configured for an agent, the system should either honor it or fail clearly.
- The user explicitly does not want silent fallback behavior.
- The user wants unsupported provider/runtime/model combinations to surface immediate errors rather than "pass through and hope" execution.
- The user accepted `cross_ai_execution` as the formal explicit cross-provider route, but only after the contract layer clearly represents it.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone and phase requirements
- `.planning/ROADMAP.md` — Phase 5 goal, success criteria, dependency boundary, and file hotspots.
- `.planning/REQUIREMENTS.md` — Phase 5 requirements `RMC-01`, `RMC-02`, `RMC-03` and the surrounding milestone constraints.
- `.planning/PROJECT.md` — Milestone goal and the product-level requirement for strict runtime/model semantics.

### Current SDK runtime-model behavior
- `sdk/src/query/config-query.ts` — Current SDK `resolveModel` logic and existing binding semantics.
- `sdk/src/query/init.ts` — Current SDK init payload generation that consumes resolved models.
- `sdk/src/query/helpers.ts` — Runtime detection helpers and current runtime-scoped SDK utilities.
- `sdk/src/query/config-mutation.ts` — Current SDK config mutation surface and allowlist gaps relevant to runtime/cross-AI config.
- `sdk/src/session-runner.ts` — Current Anthropic-centric execution path that later phases must account for.

### Legacy CJS parity targets
- `get-shit-done/bin/lib/core.cjs` — Current legacy `resolveModelInternal()` behavior and config loading semantics.
- `get-shit-done/bin/lib/init.cjs` — Legacy init payloads that currently depend on `resolveModelInternal()`.
- `get-shit-done/bin/lib/config-schema.cjs` — Legacy config key schema, including `cross_ai_execution` keys.

### Product and config documentation
- `docs/CONFIGURATION.md` — User-facing semantics for `model_profile`, `resolve_model_ids`, `model_overrides`, and `cross_ai_execution`.
- `docs/USER-GUIDE.md` — Runtime-facing guidance for non-Claude model behavior and current intended user flows.
- `docs/FEATURES.md` — Product-level capability statements and constraints that this contract must remain compatible with.

[If no external specs: "No external specs — requirements fully captured in decisions above"]
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `sdk/src/query/config-query.ts`: already contains the most relevant SDK-side model resolution logic and tests for `model_overrides` and `resolve_model_ids: "omit"`.
- `sdk/src/query/helpers.ts`: already detects the invoking runtime and provides a natural anchor for a runtime capability contract.
- `sdk/src/query/init.ts`: already assembles resolved model outputs for planning/execution workflows and is the right place to fail early in later integration.
- `get-shit-done/bin/lib/core.cjs`: legacy parity target with a concrete `resolveModelInternal()` implementation to compare against while SDK becomes source of truth.

### Established Patterns
- Runtime detection already follows `GSD_RUNTIME -> config.runtime -> default` precedence on the SDK side.
- Current system already treats `resolve_model_ids: "omit"` as intentional runtime-default behavior in both docs and tests.
- Current docs and roadmap distinguish Phase 5 contract work from later cross-AI hardening, so the phase should not overreach into Phase 7 behavior.
- Config and runtime behavior are currently split across SDK, legacy CJS, workflow markdown, and docs, which is the main architectural constraint this phase should reduce.

### Integration Points
- New contract work should connect SDK resolution (`sdk/src/query/config-query.ts`) with SDK init payload generation (`sdk/src/query/init.ts`) before touching workflow-wide propagation.
- Legacy parity work must later connect the SDK source of truth to `get-shit-done/bin/lib/core.cjs` and `get-shit-done/bin/lib/init.cjs`.
- Error-contract design must be consumable by later validation and execution layers, especially init/query surfaces and strict-binding enforcement in Phase 6.

</code_context>

<deferred>
## Deferred Ideas

- Full `cross_ai_execution` command/output/timeout hardening — Phase 7.
- Workflow-wide propagation across every model-passing workflow — Phase 8.
- Migration messaging, upgrade guidance, and broad doc rollout — Phase 8.
- Detailed enforcement of malformed external execution output — Phase 7.

</deferred>

---

*Phase: 05-runtime-model-contract*
*Context gathered: 2026-04-22*

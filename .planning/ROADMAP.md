# Roadmap: GSD Hermes v1.2 Cross-Provider Agent Execution

## Milestones

- In progress: **v1.2 Cross-Provider Agent Execution** — planned phases 5-8.
- Complete: **v1.1 Upstream Sync and Release** — Phases 1-4, shipped 2026-04-22. Archive: `.planning/milestones/v1.1-ROADMAP.md`
- Complete: **v1.0 Initial Hermes Fork Launch** — shipped initial npm package and Hermes runtime support. See `.planning/MILESTONES.md`.

## Current Milestone: v1.2 Cross-Provider Agent Execution

**Status:** Draft for approval

**Milestone:** v1.2 Cross-Provider Agent Execution
**Created:** 2026-04-22
**Goal:** Enforce per-agent model binding across runtimes, fail fast on unsupported model/runtime combinations, and support `cross_ai_execution` as the explicit cross-provider execution path.

## Phase Summary

| Phase | Name | Goal | Requirements |
|-------|------|------|--------------|
| 5 | Runtime Model Contract | Define and implement the canonical runtime capability contract plus shared model resolution and validation foundations | RMC-01, RMC-02, RMC-03 |
| 6 | Strict Binding Enforcement | Enforce fail-fast runtime-model validation with actionable diagnostics for explicit, inherited, and runtime-default bindings | SBV-01, SBV-02, SBV-03, SBV-04 |
| 7 | Cross-AI Execution Hardening | Make `cross_ai_execution` the validated explicit path for cross-provider execution when direct binding is unavailable | XAI-01, XAI-02, XAI-03, XAI-04 |
| 8 | Workflow Integration and Migration Safety | Propagate strict semantics across init/workflows/docs/tests while preserving safe upgrades for existing non-Claude installs | WDI-01, WDI-02, WDI-03, WDI-04, MIG-01, MIG-02, MIG-03 |

## Phase 5: Runtime Model Contract

**Goal:** Define one canonical runtime capability contract and shared model-resolution path that both SDK and legacy CJS surfaces use.

**Requirements:** RMC-01, RMC-02, RMC-03

**Depends on:** None

**Success criteria:**
1. A single runtime capability contract exists for supported runtimes and covers explicit binding, `inherit`, runtime-default binding, and `cross_ai_execution` support.
2. A shared resolution path can derive effective agent bindings from `model_overrides`, `model_profile`, `inherit`, and `resolve_model_ids`.
3. SDK and legacy CJS resolve the same config matrix to equivalent results.
4. Unknown or partially covered agent types have an explicit policy instead of accidental fallback behavior.

**Primary files likely involved:**
- `sdk/src/query/config-query.ts`
- `sdk/src/config.ts`
- `sdk/src/query/helpers.ts`
- `get-shit-done/bin/lib/core.cjs`
- `get-shit-done/bin/lib/model-profiles.cjs`
- `sdk/src/query/config-query.test.ts`

**Wave 1** *(foundational planning wave)*
- Plan `05-01` — SDK-first runtime model contract foundation

**Wave 2** *(blocked on Wave 1 completion)*
- Plan `05-02` — legacy CJS parity and regression coverage

**Cross-cutting constraints:**
- Preserve the semantic difference between explicit model binding, inherited binding, and runtime-default binding.
- Treat `resolve_model_ids: "omit"` as valid runtime-default behavior, not missing configuration.
- Recognize `cross_ai_execution` in the contract surface without claiming Phase 7 hardening is complete.
- Avoid silent fallback for unknown or partially covered agents.

## Phase 6: Strict Binding Enforcement

**Goal:** Add fail-fast validation so unsupported runtime/model combinations are rejected before agent execution with actionable diagnostics.

**Requirements:** SBV-01, SBV-02, SBV-03, SBV-04

**Depends on:** Phase 5

**Success criteria:**
1. Explicit unsupported model bindings fail before execution starts.
2. Profile-derived resolved models also fail before execution when unsupported by the active runtime.
3. Validation preserves the semantic difference between explicit binding, inherited binding, and runtime-default binding.
4. Errors identify the agent, runtime, configured or resolved model, rejection reason, and suggested fix.
5. No silent downgrade to runtime default occurs when strict binding was requested.

**Primary files likely involved:**
- `sdk/src/query/config-query.ts`
- `sdk/src/query/init.ts`
- `sdk/src/session-runner.ts`
- `sdk/src/phase-runner.ts`
- `get-shit-done/bin/lib/verify.cjs`
- `tests/bug-1829-inherit-model-profile.test.cjs`
- `sdk/src/query/config-query.test.ts`

## Phase 7: Cross-AI Execution Hardening

**Goal:** Turn `cross_ai_execution` into the explicit validated path for cross-provider execution when direct runtime binding cannot be honored.

**Requirements:** XAI-01, XAI-02, XAI-03, XAI-04

**Depends on:** Phase 6

**Success criteria:**
1. Required cross-AI config fields are manageable through supported config surfaces.
2. Phase execution can explicitly route eligible work through `cross_ai_execution` instead of relying on unsupported direct binding.
3. Misconfigured cross-AI execution fails early with actionable fixes.
4. External command timeout, malformed output, and partial execution are detected and surfaced.
5. Cross-AI execution does not silently report success on incomplete or invalid external results.

**Primary files likely involved:**
- `sdk/src/query/config-mutation.ts`
- `sdk/src/phase-runner.ts`
- `sdk/src/init-runner.ts`
- `get-shit-done/workflows/execute-phase.md`
- `tests/cross-ai-execution.test.cjs`
- `docs/CONFIGURATION.md`

## Phase 8: Workflow Integration and Migration Safety

**Goal:** Apply the new runtime-model semantics consistently across workflows, documentation, and tests while keeping existing non-Claude runtime installs on a safe upgrade path.

**Requirements:** WDI-01, WDI-02, WDI-03, WDI-04, MIG-01, MIG-02, MIG-03

**Depends on:** Phase 7

**Success criteria:**
1. Init payloads expose runtime-model validation results needed by planning and execution workflows.
2. Workflows that pass model settings use the shared semantics consistently instead of special-casing only execute-phase.
3. Docs explain explicit binding, `inherit`, runtime-default binding, and `cross_ai_execution` clearly.
4. Regression tests cover runtime-model resolution, strict validation, cross-AI routing, and migration-safe legacy configs.
5. Existing non-Claude installs using `resolve_model_ids: "omit"` continue to work when no unsupported explicit binding is requested.
6. Upgrade guidance explains how to fix configs that become invalid under strict validation.

**Primary files likely involved:**
- `sdk/src/query/init.ts`
- `sdk/src/query/config-mutation.ts`
- `get-shit-done/workflows/*.md`
- `docs/CONFIGURATION.md`
- `docs/USER-GUIDE.md`
- `docs/FEATURES.md`
- `tests/*.test.cjs`
- `sdk/src/query/*.test.ts`

## Validation Matrix

| Gate | Required | Command / Evidence |
|------|----------|--------------------|
| Shared resolver parity | Yes | Config-matrix tests for SDK and legacy CJS resolve-model behavior |
| Strict validation | Yes | Tests proving unsupported runtime/model combos fail before execution |
| Cross-AI routing | Yes | Tests for `workflow.cross_ai_execution` and `cross_ai_command` handling |
| Workflow propagation | Yes | Init/workflow tests covering model semantics outside execute-phase |
| Migration safety | Yes | Tests proving valid legacy `resolve_model_ids: "omit"` configs still work |
| Documentation updates | Yes | Updated configuration/user-guide/features docs |

## Next Action

If approved, start with Phase 5: Runtime Model Contract.

# Phase 10 Summary: Runtime Binding Receipt Surface

**Date:** 2026-04-26
**Milestone:** v1.4 Hermes Runtime Model Binding Receipts
**Status:** Complete

## Objective

Make model binding intent visible at GSD entry points before spawning agents, with structured metadata that separates GSD resolver truth from runtime enforcement proof.

Phase 10 intentionally does **not** claim Hermes provider/wire-level enforcement. It creates the receipt surface and conservative proof vocabulary that Phase 11/12 will use to implement and verify actual runtime binding.

## Completed Plans

### 10-01 — Shared receipt projection

Implemented a shared runtime/model receipt projection while preserving legacy flat model-token behavior.

Key outcomes:
- SDK `runtime-model-contract.ts` now serializes structured runtime model receipts.
- Legacy CJS `model-profiles.cjs` mirrors the SDK receipt shape via `toBindingReceipt` / `serializeRuntimeModelResolution`.
- Existing `*_model` / init token behavior remains backward compatible.
- Receipt fields distinguish resolver intent from proof:
  - `configured_model`
  - `resolved_model`
  - `model_token`
  - `source`
  - `binding_kind`
  - `provider_family`
  - `resolved_by_gsd`
  - `passed_to_runtime`
  - `runtime_enforced`
  - `suggested_fix`

### 10-02 — Init payload receipts + parity

Added structured receipt payloads to both SDK and legacy CJS init surfaces.

Key outcomes:
- `init.plan-phase` exposes `model_binding_receipts` for:
  - `researcher / gsd-phase-researcher`
  - `planner / gsd-planner`
  - `checker / gsd-plan-checker`
- `init.execute-phase` exposes `model_binding_receipts` for:
  - `executor / gsd-executor`
  - `verifier / gsd-verifier`
- Flat fields remain intact:
  - `researcher_model`, `planner_model`, `checker_model`
  - `executor_model`, `verifier_model`
- SDK/CJS parity is covered by focused init tests and runtime-model parity tests.

### 10-03 — Workflow transcript surface + docs

Updated Hermes-visible workflow instructions so receipts are displayed before Task dispatch / fallback decisions.

Key outcomes:
- `/gsd-plan-phase` workflow now parses and displays `model_binding_receipts` before researcher/planner/checker Task dispatch.
- `/gsd-execute-phase` workflow now parses and displays `model_binding_receipts` before executor/verifier Task dispatch and cross-AI fallback decisions.
- `docs/hermes-compatibility.md` documents the conservative proof boundary.
- Guard tests ensure workflows/docs keep the receipt wording and do not imply runtime proof.

## Conservative Runtime Proof Boundary

Phase 10 receipts are deliberately conservative:

- `resolved_by_gsd=true` means the GSD resolver selected a model/binding.
- `passed_to_runtime=true` means GSD has an explicit model token ready to pass.
- `runtime_enforced=unknown` is **not** runtime proof.

Actual Hermes child-agent/provider enforcement remains Phase 11/12 scope.

## Validation

Commands run successfully:

```bash
npm run build:sdk
(cd sdk && npx vitest run src/query/config-query.test.ts -t 'runtime/model receipts|runtime-default bindings|unknown-agent bindings')
(cd sdk && npx vitest run src/query/init.test.ts -t 'initExecutePhase|initPlanPhase')
node --test tests/runtime-model-parity.test.cjs
node --test tests/init.test.cjs
npm run test:hermes
node --test tests/workflow-size-budget.test.cjs
npm test
```

Final full-suite result:

```text
npm test → PASS
# tests 5593
# suites 1002
# pass 5593
# fail 0
```

Notes:
- `npm run build:sdk` emits the existing Node engine warning because the local runtime is Node v20 while SDK package metadata requests Node >=22.
- `npm ci` reports existing audit findings; no dependency changes were introduced for Phase 10.

## Commits

- `710878b1 test(10-01): add failing runtime binding receipt SDK tests`
- `5a542cfd feat(10-01): add runtime model receipt projection`
- `0a1d1d11 feat(10-01): mirror binding receipts in legacy runtime contract`
- `f762ed30 test(10-02): require SDK init binding receipts`
- `5c3f80f0 feat(10-02): emit SDK init binding receipts`
- `09c45e03 test(10-02): require legacy init binding receipts`
- `88b1f198 feat(10-02): emit legacy init binding receipts`
- `f4172755 test(10-03): guard runtime binding receipt wording`
- `0ba811a0 docs(10-03): surface runtime binding receipt status`
- `d6da40c0 fix(test): accept gsd-hermes 1.4 version line`
- `02c93dcc fix(10-03): keep execute workflow under size budget`

## Next Route

Proceed to Phase 11: Hermes Per-Agent Binding Channel.

Phase 11 should identify and implement/prove the real Hermes runtime binding path, or fail fast before spawn when a configured model cannot be enforced.

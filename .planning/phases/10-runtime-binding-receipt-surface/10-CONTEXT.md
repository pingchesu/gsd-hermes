# Phase 10 Context — Runtime Binding Receipt Surface

**Phase:** 10 — Runtime Binding Receipt Surface
**Milestone:** v1.4 Hermes Runtime Model Binding Receipts
**Mode:** Hermes text/sequential planning fallback; do not rely on per-agent Task(model) correctness while planning this milestone.

## Goal

Add structured model binding receipts to `init.plan-phase`, `init.execute-phase`, and the corresponding workflow transcript surfaces so users can see GSD resolver intent and runtime proof status before subagents spawn.

## Requirements Covered

- RCPT-01: `gsd-sdk query init.plan-phase <phase>` shows structured binding metadata for researcher, planner, checker.
- RCPT-02: `gsd-sdk query init.execute-phase <phase>` shows structured binding metadata for executor, verifier.
- RCPT-03: `/gsd-plan-phase` and `/gsd-execute-phase` show concise binding receipt before subagents spawn.
- RCPT-04: Receipt output distinguishes `resolved_by_gsd`, `passed_to_runtime`, and `runtime_enforced`.

## Locked Decisions

1. Preserve flat model fields (`planner_model`, `executor_model`, etc.) for compatibility.
2. Add structured receipts as additive JSON fields.
3. Receipts must be present in both SDK and legacy CJS init surfaces to keep golden parity.
4. `runtime_enforced` must be conservative in Phase 10: default to `unknown` unless real runtime proof exists.
5. Do not use subagent self-reporting as model proof.
6. Do not print credentials, API keys, tokens, passwords, or connection strings.
7. Keep changes narrow and upstream-sync friendly: helper functions and small workflow-doc rendering changes, not broad workflow rewrites.

## Implementation Areas

- `sdk/src/query/runtime-model-contract.ts`
  - Add receipt builder/serializer helper or extend existing serializer with receipt projection.
- `sdk/src/query/init.ts`
  - Add plan-phase and execute-phase receipt payloads.
- `get-shit-done/bin/lib/model-profiles.cjs`
  - Mirror receipt projection helper for legacy CJS.
- `get-shit-done/bin/lib/init.cjs`
  - Add receipt payloads to legacy init output.
- `get-shit-done/workflows/plan-phase.md`
  - Parse/render receipt before researcher/planner/checker spawning.
- `get-shit-done/workflows/execute-phase.md`
  - Parse/render receipt before executor/verifier spawning.
- Tests:
  - `sdk/src/query/config-query.test.ts`
  - `sdk/src/query/init.test.ts`
  - `sdk/src/golden/golden.integration.test.ts`
  - `tests/runtime-model-parity.test.cjs`
  - `tests/init.test.cjs`

## Validation Commands

Use these commands during execution:

```bash
npm run build:sdk
node --test tests/runtime-model-parity.test.cjs tests/init.test.cjs
npm test
```

Use SDK Vitest commands from `sdk/package.json` by running `(cd sdk && npx vitest run <relative-test-path>)`; do not pass Jest-only serial-run flags.

## Acceptance Notes

This phase is complete when receipts are visible and tested. It is not complete by proving Hermes runtime enforcement; that is Phase 11/12 scope.

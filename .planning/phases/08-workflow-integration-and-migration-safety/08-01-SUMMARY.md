# Plan 08-01 Summary

## Outcome
Completed Phase 08 Plan 08-01 by adding additive structured runtime-model metadata to canonical init/query payloads, surfacing that visibility through progress/settings workflow guidance, and preserving existing token-oriented fields for compatibility.

## What changed
- Added a reusable runtime-model serialization helper in `sdk/src/query/runtime-model-contract.ts` so canonical query/init seams can emit the same structured binding metadata without workflow-local semantic duplication.
- Expanded `sdk/src/query/init.ts` with `buildRuntimeModelMetadata()` and threaded additive `runtime_model` payloads into high-value init surfaces while preserving existing `*_model` token fields.
- Extended `sdk/src/query/init-complex.ts` progress payloads with the same structured runtime/model/cross-AI visibility for planner/executor reporting.
- Updated `sdk/src/query/config-query.ts` so `resolve-model` returns legacy fields plus nested structured runtime-model metadata.
- Added SDK tests covering additive metadata, Hermes mixed-provider visibility, progress payload visibility, and resolve-model structured metadata.
- Updated `get-shit-done/workflows/progress.md` to treat `runtime_model` as the canonical runtime/model/cross-AI visibility surface.
- Updated `get-shit-done/workflows/settings.md` to distinguish direct binding, inherit, runtime-default omission, and explicit `cross_ai_execution` fallback while pointing operators at canonical query surfaces.
- Extended `tests/bug-2506-settings-profile-nonclaude-warning.test.cjs` to lock the new settings guidance language.

## Files modified
- `sdk/src/query/runtime-model-contract.ts`
- `sdk/src/query/init.ts`
- `sdk/src/query/init-complex.ts`
- `sdk/src/query/config-query.ts`
- `sdk/src/query/init.test.ts`
- `sdk/src/query/config-query.test.ts`
- `get-shit-done/workflows/progress.md`
- `get-shit-done/workflows/settings.md`
- `tests/bug-2506-settings-profile-nonclaude-warning.test.cjs`
- `.planning/phases/08-workflow-integration-and-migration-safety/08-01-SUMMARY.md`

## Scope / deviations
- Kept semantics centralized in runtime-model/query/init seams; workflow changes only consume or reference canonical emitted metadata.
- Preserved existing token fields such as `planner_model`, `executor_model`, and `checker_model` for backward compatibility.
- Left unrelated local modifications in `.planning/STATE.md` and `.planning/config.json` untouched.

## Verification
Ran exactly:
- `cd /home/whiskey/workspace/project/central/v2/gsd-hermes/sdk && npx vitest run src/query/init.test.ts src/query/config-query.test.ts` ✅
- `cd /home/whiskey/workspace/project/central/v2/gsd-hermes && node --test tests/bug-2506-settings-profile-nonclaude-warning.test.cjs tests/config-schema-docs-parity.test.cjs && grep -q "runtime/model/cross-AI" get-shit-done/workflows/progress.md && grep -q "direct binding" get-shit-done/workflows/settings.md` ✅

## Issues encountered
- None.

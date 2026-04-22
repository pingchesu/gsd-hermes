# Phase 8 Research: Workflow Integration and Migration Safety

## What Phase 8 needs to do now

Phase 5 established the canonical runtime-model contract.
Phase 6 enforced fail-fast validation at real run entry points.
Phase 7 clarified two execution paths:
- direct runtime binding when the active runtime truly supports the configured provider/model
- explicit `cross_ai_execution` fallback when direct binding is unavailable

Phase 8 is not about inventing new semantics. It is the broad propagation phase that must make workflows, init payloads, docs, and regression coverage reflect the contract consistently, while keeping the fork upstream-friendly.

## Current repo state

### Good foundations already present
- `sdk/src/query/runtime-model-contract.ts` is the canonical semantic source for binding kind, source, resolved model, runtime capability, and cross-AI capability/config metadata.
- `sdk/src/query/runtime-model-validation.ts` already owns fail-fast diagnostics, cross-AI routing/result validation, and actionable remediation text.
- `sdk/src/query/init.ts` already resolves plan/execute models through the canonical contract, but mostly flattens those semantics into token-oriented payload fields.
- `get-shit-done/workflows/execute-phase.md` is already ahead of the rest of the workflow layer and now reflects hardened cross-AI semantics.
- `tests/cross-ai-execution.test.cjs`, `sdk/src/query/config-query.test.ts`, and `sdk/src/query/init.test.ts` already provide the core regression net.

### Important gaps Phase 8 must close
1. Init payload propagation is still too shallow.
   - Many workflows receive only `*_model` token strings rather than structured runtime/binding state.
   - This is not enough for the requested high-visibility operator surfaces.

2. Workflow surfaces are inconsistent.
   - `execute-phase` is semantically ahead.
   - `plan-phase`, `quick`, `verify-work`, `progress`, and `settings` still vary in how much runtime/model awareness they expose.

3. Documentation drift is still likely.
   - `docs/CONFIGURATION.md` is the strongest canonical source, but related docs can still diverge.
   - The project now needs one broad documentation alignment pass, especially around:
     - explicit binding
     - `inherit`
     - runtime-default via `resolve_model_ids: "omit"`
     - explicit external fallback via `cross_ai_execution`
     - Hermes direct mixed-provider binding

4. Migration guidance is present only in fragments.
   - The user wants clear warnings and upgrade guidance, but no automatic config rewriting.
   - Phase 8 must connect fail-fast semantics to visible remediation guidance.

## Recommended implementation shape

### 1. Add one shared init/runtime-model serialization seam
Best place: `sdk/src/query/init.ts` (possibly a nearby helper module if it becomes too large).

Recommended behavior:
- Preserve existing `*_model` token fields for compatibility.
- Add structured per-agent metadata alongside them, e.g. runtime / binding kind / source / configured model / resolved model / cross-AI visibility fields.
- Apply consistently to the highest-value init surfaces first:
  - `init.plan-phase`
  - `init.execute-phase`
  - `init.progress`
  - `init.quick`
  - any settings-facing or verification-facing init/query surfaces that materially expose runtime-model state

This satisfies the user's high-visibility preference without forcing workflows to reverse-engineer semantics from token strings.

### 2. Propagate through the existing workflow surfaces, not new ones
Highest-value workflow/doc surfaces to align:
- `get-shit-done/workflows/plan-phase.md`
- `get-shit-done/workflows/execute-phase.md`
- `get-shit-done/workflows/quick.md`
- `get-shit-done/workflows/verify-work.md`
- `get-shit-done/workflows/progress.md`
- `get-shit-done/workflows/settings.md`

Principle:
- reuse the query/init seam
- avoid adding workflow-local runtime/provider decision logic
- let workflows display/route based on canonical emitted metadata

### 3. Make docs/CONFIGURATION.md the canonical operator truth, then align outward
The user chose broad documentation alignment, but the repo still needs a hierarchy to avoid reintroducing drift.

Recommended hierarchy:
- `docs/CONFIGURATION.md` = canonical configuration and runtime-model semantics
- `docs/USER-GUIDE.md` = narrative/how-to and upgrade guidance, not a duplicate config table dump
- `docs/FEATURES.md` / `docs/COMMANDS.md` = capability/command statements aligned to canonical docs
- translated docs updated where drift is material to the changed semantics

### 4. Migration strategy should be additive and explicit
Phase 8 should:
- keep unsupported configs fail-fast
- add guidance and warning surfaces
- provide recommended replacement patterns
- never auto-edit config

Guidance should help users choose among:
- direct explicit binding
- `inherit`
- `resolve_model_ids: "omit"`
- `cross_ai_execution`

### 5. Keep upstream-friendliness by centralizing truth
The fork-ownership guidance is clear:
- keep semantics in adapter/query/contract seams
- use workflows/docs to reflect that truth
- avoid inventing many runtime-specific branches inside upstream-owned workflow markdown

That means Phase 8 should prefer:
- one shared serialization/visibility layer
- a small number of workflow updates to consume it
- a broad docs/test sync pass anchored to the canonical query layer

## Recommended wave split

### Wave 1 — init/query propagation and operator visibility foundation
Focus:
- add structured binding/runtime/cross-AI visibility to init/query payloads
- keep existing token fields for backward compatibility
- extend progress/settings-facing surfaces to consume the new metadata

Primary files likely involved:
- `sdk/src/query/init.ts`
- `sdk/src/query/init-complex.ts`
- `sdk/src/query/config-query.ts`
- `get-shit-done/workflows/progress.md`
- `get-shit-done/workflows/settings.md`
- `sdk/src/query/init.test.ts`
- `sdk/src/query/config-query.test.ts`

### Wave 2 — broad workflow + docs + migration alignment
Focus:
- align the remaining major workflows (`plan-phase`, `quick`, `verify-work`, and `execute-phase` as needed)
- align canonical docs and high-value derivative docs
- add migration guidance and regression coverage

Primary files likely involved:
- `get-shit-done/workflows/plan-phase.md`
- `get-shit-done/workflows/quick.md`
- `get-shit-done/workflows/verify-work.md`
- `docs/CONFIGURATION.md`
- `docs/USER-GUIDE.md`
- `docs/FEATURES.md`
- `docs/COMMANDS.md`
- `tests/runtime-model-parity.test.cjs`
- `tests/cross-ai-execution.test.cjs`
- `tests/bug-1829-inherit-model-profile.test.cjs`
- `tests/bug-2506-settings-profile-nonclaude-warning.test.cjs`
- `tests/config-schema-docs-parity.test.cjs`
- `tests/verify-health.test.cjs`

## Test focus

Must cover:
1. init payloads expose enough runtime-model metadata for workflows to avoid token-only assumptions
2. progress/settings surfaces display runtime/model/cross-AI state consistently
3. plan/quick/verify/execute workflows do not contradict each other about direct binding vs fallback
4. docs explain the four supported paths consistently:
   - explicit binding
   - `inherit`
   - runtime-default omission
   - explicit cross-AI fallback
5. unsupported configs still fail fast
6. valid legacy `resolve_model_ids: "omit"` configs still work
7. Hermes mixed-provider direct binding remains direct, not downgraded into cross-AI

## Recommended validation commands

Repo-level targeted CJS/integration checks:
```bash
cd /home/whiskey/workspace/project/central/v2/gsd-hermes && node --test tests/runtime-model-parity.test.cjs tests/cross-ai-execution.test.cjs tests/bug-1829-inherit-model-profile.test.cjs tests/bug-2506-settings-profile-nonclaude-warning.test.cjs tests/config-schema-docs-parity.test.cjs tests/verify-health.test.cjs
```

SDK targeted checks:
```bash
cd /home/whiskey/workspace/project/central/v2/gsd-hermes/sdk && npx vitest run src/query/config-query.test.ts src/query/init.test.ts src/query/config-mutation.test.ts
```

Broader gates before closeout:
```bash
cd /home/whiskey/workspace/project/central/v2/gsd-hermes && npm run test:hermes
cd /home/whiskey/workspace/project/central/v2/gsd-hermes && npm test
```

## Key planning conclusion

The best Phase 8 strategy is:
- centralize semantic truth in query/init adapter seams
- propagate that truth broadly through workflows and docs
- add migration guidance without automatic config mutation
- keep the fork upstream-friendly by reflecting canonical semantics rather than inventing new workflow-local runtime logic

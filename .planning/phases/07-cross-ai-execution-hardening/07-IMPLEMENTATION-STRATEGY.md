# Phase 7 Implementation Strategy — Hermes Multi-Provider Adapter First

Date: 2026-04-23
Status: proposed / executing

## Goal

Enable provider switching with the smallest possible downstream surface so `gsd-hermes` stays easy to sync with upstream `get-shit-done`.

## Guiding principle

Prefer adapter-layer truth over workflow rewrites.

Instead of teaching every workflow a new routing system first, treat `runtime: "hermes"` as a runtime capability adapter that can honor explicit model bindings across multiple providers when Hermes itself can route those model IDs.

This preserves:
- strict per-agent binding semantics from Phases 5/6
- fail-fast behavior for actually unsupported runtimes
- low divergence from upstream workflow markdown and orchestration logic

## Why this is the best first move

Current blocker is not only missing routing logic. The contract currently classifies Hermes too narrowly, so it rejects explicit Anthropic bindings before runtime execution even though Hermes is intended to be a cross-provider host runtime.

If Hermes is modeled correctly in the runtime capability contract:
- `runtime: hermes` + mixed `model_overrides` can work without inventing a large new execution path
- existing init/query/validation flows remain mostly unchanged
- upstream sync cost stays low because behavior lives in the Hermes adapter layer

## Scope for this slice

### In scope
1. Keep `hermes` as a supported runtime everywhere the SDK/query layer expects runtime identities.
2. Update runtime capability classification so Hermes supports explicit model families:
   - anthropic
   - openai
   - google
   - unknown passthrough
3. Add regression tests proving Hermes accepts mixed-provider explicit bindings.
4. Add init-level regression coverage so mixed-provider planner/researcher configs no longer fail-fast under `runtime: hermes`.
5. Document this as an adapter-layer behavior, not a broad workflow rewrite.

### Out of scope for this slice
1. New cross-AI orchestration backend.
2. Rewriting `execute-phase.md` to force external CLI delegation for Hermes.
3. Broad changes to upstream workflow structures.
4. Any silent fallback semantics.

## Expected behavior after this slice

With:
- `runtime: "hermes"`
- `model_overrides.gsd-planner = "claude-opus-4-7"`
- `model_overrides.gsd-plan-checker = "openai/gpt-5.4"`

The SDK should:
- accept both explicit bindings under Hermes
- preserve strict validation for other runtimes like `claude`, `codex`, `gemini` where appropriate
- still fail fast if a runtime truly cannot honor the configured provider/model

## Files to change

### Primary logic
- `sdk/src/query/runtime-model-contract.ts`
- `sdk/src/query/runtime-model-validation.ts` (only if error text or compatibility plumbing needs adjustment)
- `sdk/src/query/helpers.ts` (already patched for Hermes runtime identity)

### Tests
- `sdk/src/query/config-query.test.ts`
- `sdk/src/query/init.test.ts`
- `tests/cross-ai-execution.test.cjs`
- `sdk/src/query/helpers.test.ts` (already updated for Hermes runtime identity)

### Optional docs / planning artifacts
- `.planning/phases/07-cross-ai-execution-hardening/07-RESEARCH.md`
- `.planning/phases/07-cross-ai-execution-hardening/07-VALIDATION.md`
- `.planning/phases/07-cross-ai-execution-hardening/07-PATTERNS.md`

## Implementation steps

### Step 1 — Fix Hermes capability contract
Update `explicitModelFamiliesForRuntime()` so Hermes is explicitly modeled as multi-provider instead of falling into the generic fallback bucket.

Target behavior:
- `claude` => anthropic only
- OpenAI-style runtimes => openai only
- `gemini` => google only
- `hermes` => anthropic + openai + google + unknown

### Step 2 — Add contract-level tests
Add tests proving:
- Hermes accepts explicit Anthropic model strings
- Hermes accepts explicit OpenAI model strings
- Hermes accepts mixed bindings across agents
- non-Hermes runtimes still fail the same way as before

### Step 3 — Add init-layer regression coverage
Add/init tests proving `init.plan-phase` succeeds under a Hermes config with mixed-provider planner/researcher/checker overrides.

### Step 4 — Re-validate current user config scenarios
Re-run:
- Hermes + mixed provider config => should pass
- Codex + Claude explicit binding => should still fail fast
- Claude + OpenAI explicit binding => should still fail fast

### Step 5 — Only then evaluate whether Phase 7 still needs external cross-AI routing changes
If Hermes native multi-provider binding solves the practical user need, keep further cross-AI work focused on runtimes that genuinely need external CLI delegation.

This preserves maximum upstream compatibility by limiting downstream divergence to the Hermes adapter surface.

## Validation commands

From repo root:

```bash
cd sdk && npm run build
cd sdk && npx vitest run src/query/helpers.test.ts src/query/init.test.ts src/query/config-query.test.ts
node --test tests/cross-ai-execution.test.cjs
```

And manual spot checks:

```bash
gsd-sdk query init.plan-phase "7"
gsd-sdk query init.execute-phase "7"
```

## Risks

1. Hermes may need broader family support than the current regex-based model-family detector recognizes.
2. If Hermes runtime semantics are actually provider-restricted in some environments, adapter-level broadening must still remain truthful.
3. Existing tests may have encoded the older Phase 6 assumption that Hermes is not multi-provider yet.

## Decision

Proceed with Hermes capability-contract broadening first.
If that solves the real user workflow, keep Phase 7 external delegation work narrow and optional.

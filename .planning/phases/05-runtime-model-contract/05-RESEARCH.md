# Phase 5 Research: Runtime Model Contract

## Why this phase matters

Phase 5 needs to turn today's scattered model/runtime behavior into one canonical contract before Phase 6 adds fail-fast validation. Right now the repo has working pieces, but semantics are split across SDK query code, legacy CJS helpers, workflow docs, and tests.

## Current behavior snapshot

### SDK today

- `sdk/src/query/config-query.ts` is the closest existing source of truth for per-agent resolution.
- Resolution order is already useful and should be preserved:
  1. `model_overrides[agent]`
  2. `resolve_model_ids === "omit"` => `model: ""`
  3. profile lookup from `MODEL_PROFILES`
  4. `model_profile === "inherit"` => `model: "inherit"`
- Result shape is ad hoc: `{ model, profile }` plus optional `unknown_agent: true`.
- Unknown agents currently fall back to `{ model: 'sonnet', unknown_agent: true }` instead of failing.
- SDK `MODEL_PROFILES` only covers 18 agents and exposes `quality|balanced|budget|adaptive`; docs also claim `inherit` is a profile, and `configSetModelProfile()` only accepts `VALID_PROFILES`, so SDK profile mutation is already out of sync with docs/runtime expectations.
- `sdk/src/query/init.ts` consumes only the raw `model` string via `getModelAlias()`. It loses binding-state information before later workflow layers can validate it.
- `sdk/src/config.ts` is weakly typed for this area: `model_overrides`, `resolve_model_ids`, and `runtime` are not first-class typed fields even though query/helpers code depends on them.
- `sdk/src/query/config-mutation.ts` does not expose the newer legacy config schema surface for `workflow.cross_ai_execution`, `workflow.cross_ai_command`, or `workflow.cross_ai_timeout`.

### Legacy CJS today

- `get-shit-done/bin/lib/core.cjs:resolveModelInternal()` uses the same high-level precedence as SDK, but returns only a string.
- It additionally maps aliases through `MODEL_ALIAS_MAP` when `resolve_model_ids` is truthy.
- Unknown agents silently fall back to `'sonnet'`.
- `get-shit-done/bin/lib/init.cjs` injects resolved strings directly into init payloads (`executor_model`, `planner_model`, etc.), matching SDK's current loss of semantics.
- `get-shit-done/bin/lib/config-schema.cjs` already recognizes `workflow.cross_ai_execution`, `workflow.cross_ai_command`, and `workflow.cross_ai_timeout`, but the runtime/model resolver does not model cross-AI as a first-class execution capability yet.

### Runtime/docs behavior today

- `sdk/src/query/helpers.ts` already has the runtime registry for installation paths and runtime detection precedence: `GSD_RUNTIME -> config.runtime -> 'claude'`.
- Docs define three important user-facing behaviors that Phase 5 must preserve:
  - `resolve_model_ids: "omit"` means runtime-default binding, not missing config.
  - `model_profile: "inherit"` means follow the current session model.
  - `model_overrides` may contain aliases, `inherit`, or fully-qualified provider IDs.
- Docs also say 18 of 31 shipped agents have explicit profile rows; the rest should use runtime defaults unless overridden. Current code approximates that via silent fallback, but not as an explicit contract.
- `tests/bug-2516-inherit-model-execute-phase.test.cjs` proves a critical semantic: `"inherit"` must not be passed literally where omission is the real inheritance mechanism.

## Main gaps to solve in Phase 5

1. No canonical contract object exists; behavior is encoded in branching logic.
2. Resolution results are strings, not structured binding decisions.
3. SDK/CJS parity is informal and easy to drift.
4. Unknown and partially-covered agents silently degrade today, but Phase 5 decisions require explicit policy and fail-fast foundations.
5. Profile naming is inconsistent across SDK/docs (`adaptive` vs `inherit` support surface).
6. Cross-AI execution is present in schema/docs but absent from the runtime/model contract shape.

## Required contract design

Phase 5 should introduce a shared SDK-first module that answers two questions separately:

1. What binding was requested/resolved for this agent?
2. What execution capabilities does the active runtime support for that binding?

Suggested minimum shapes:

```ts
export type BindingKind = 'explicit' | 'profile' | 'inherit' | 'runtime-default';

export interface ResolvedAgentBinding {
  agent: string;
  runtime: Runtime;
  profile: string;
  bindingKind: BindingKind;
  configuredModel: string | null;   // direct override if present
  resolvedModel: string | null;     // alias/full ID/'inherit'/null for runtime-default
  modelToken: string | null;        // exact value to pass downstream, or null when omission is required
  source: 'override' | 'profile' | 'inherit-profile' | 'resolve-model-omit';
  knownAgent: boolean;
}

export interface RuntimeCapability {
  runtime: Runtime;
  supportsExplicitModel: boolean;
  supportsInheritBinding: boolean;
  supportsRuntimeDefaultBinding: boolean;
  supportsCrossAiExecution: boolean;
}
```

Important semantic rules:

- Preserve all three binding states end-to-end:
  - explicit model binding
  - inherited binding
  - runtime-default binding
- Treat `resolve_model_ids: "omit"` as `bindingKind: 'runtime-default'`, not empty-string magic.
- Represent inherit as a semantic binding, not just the literal string `'inherit'`.
- Unknown agents must stop being accidental `'sonnet'`; Phase 5 should at least return a structured unsupported/unknown outcome that Phase 6 can reject immediately.
- Contract must model `cross_ai_execution` capability now, but not implement routing/hardening yet.

## Suggested implementation seams

### 1. New shared SDK module

Add a focused module, e.g. `sdk/src/runtime-model-contract.ts` or `sdk/src/query/runtime-model.ts`, containing:

- runtime capability registry
- agent coverage policy
- profile table import/re-export
- shared resolver returning `ResolvedAgentBinding`
- adapter helpers for legacy string outputs

Keep SDK as source of truth; legacy CJS should call into a generated/shared equivalent or be ported to match behavior exactly.

### 2. Separate resolution from serialization

Refactor current `resolveModel()` into:

- `resolveAgentBinding(config, runtime, agent)` -> structured object
- `toLegacyResolvedModel(binding)` -> current `{ model, profile, unknown_agent? }`
- `toInitModelToken(binding)` -> exact string or omission/null for init/workflow payloads

This avoids leaking empty-string / `'inherit'` sentinel handling all over the repo.

### 3. Reuse `helpers.ts` runtime detection

Do not create a second runtime registry. The new contract should consume `Runtime` and `detectRuntime()` from `sdk/src/query/helpers.ts`.

### 4. Make config typing explicit

Extend `sdk/src/config.ts` types for at least:

- `runtime?: Runtime`
- `model_overrides?: Record<string, string>`
- `resolve_model_ids?: boolean | 'omit'`
- `workflow.cross_ai_execution|command|timeout`

This reduces `Record<string, unknown>` escapes around the contract.

### 5. Legacy CJS compatibility layer

Replace `resolveModelInternal()` body with the same algorithm/fixtures as SDK, but keep its public string return for now via adapter. That gets parity without forcing Phase 5 to rewrite every CJS consumer.

## Migration constraints

- Preserve current working non-Claude installs using `resolve_model_ids: "omit"` and no explicit unsupported override.
- Preserve current override precedence exactly.
- Do not silently reinterpret explicit configured models.
- Do not break existing init payload field names in Phase 5; add structured metadata alongside or behind helpers first.
- Be careful with `inherit`: some downstream surfaces require omission rather than passing the literal string.
- Docs/features still advertise `adaptive`; docs/config also advertise `inherit`. Phase 5 plan must either formally support both or intentionally normalize the surface with tests and doc follow-up. This is a real migration risk, not just cleanup.
- Legacy CJS schema includes cross-AI keys while SDK mutation layer does not; parity work should avoid making SDK the narrower config surface.

## Recommended Phase 5 deliverables

1. Canonical runtime capability registry in SDK.
2. Canonical structured binding resolver in SDK.
3. Adapter layer so current SDK query/init outputs still work.
4. Legacy CJS parity update to consume equivalent semantics.
5. Explicit unknown-agent policy encoded in contract/tests.
6. Contract representation for `cross_ai_execution` capability, even if not yet enforced in workflows.

## Testing strategy

### Unit tests

Add SDK unit coverage for structured resolution across a config matrix:

- known agent + balanced profile
- known agent + adaptive profile
- known agent + inherit profile
- known agent + override alias
- known agent + override fully-qualified model
- `resolve_model_ids: true`
- `resolve_model_ids: "omit"`
- override + omit together
- unknown agent
- agent without profile entry but in shipped roster policy
- runtime detection precedence (`GSD_RUNTIME` over `config.runtime`)

### Parity tests

Add a shared table-driven matrix that runs both:

- SDK structured resolver
- legacy CJS resolver/adapter

and asserts equivalent semantic outcomes, not just equivalent strings.

### Init contract tests

Verify init surfaces preserve semantics:

- runtime-default binding serializes to omission/empty token as intended
- inherit binding serializes correctly for downstream consumers
- no path accidentally turns `inherit` into a literal provider model ID

### Regression coverage to keep

- existing SDK `config-query.test.ts` override/omit behavior
- `tests/bug-2516-inherit-model-execute-phase.test.cjs`
- `tests/verify-health.test.cjs` acceptance of `model_profile: "inherit"`
- cross-AI schema presence tests in `tests/cross-ai-execution.test.cjs`

## Validation Architecture

A future `05-VALIDATION.md` should validate Phase 5 at four layers:

### 1. Contract correctness

Evidence:
- runtime capability registry enumerates supported runtimes from `helpers.ts`
- structured resolver distinguishes explicit / inherit / runtime-default
- unknown-agent policy is explicit in code and tests

### 2. SDK/CJS parity

Evidence:
- one config-matrix test file or fixture set exercised against both implementations
- equivalent semantic outputs for the same inputs

### 3. Migration safety

Evidence:
- fixtures showing existing `resolve_model_ids: "omit"` installs still resolve to runtime-default bindings
- overrides still win over omit/profile
- current init payload fields remain usable

### 4. Deferred-scope guardrails

Evidence:
- contract includes `supportsCrossAiExecution`, but no test in Phase 5 requires full routing
- validation proves representation exists without claiming Phase 7 behavior is done

Suggested commands/evidence sources:

- `cd sdk && npm test -- config-query config-mutation init`
- `npm test -- tests/cross-ai-execution.test.cjs tests/bug-2516-inherit-model-execute-phase.test.cjs tests/verify-health.test.cjs`
- review of new parity fixture file covering SDK and CJS outputs

## Planning takeaways

The least risky Phase 5 plan is: build one structured resolver in SDK, adapt old callers to it, then make CJS match through an adapter. The main thing to avoid is baking more sentinel-string behavior into init/workflow layers before the contract exists.
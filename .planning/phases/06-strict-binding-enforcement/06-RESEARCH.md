# Phase 6 Research: Strict Binding Enforcement

## What Phase 6 needs to do

Phase 5 already gives the repo a shared binding resolver and preserves four distinct states:
- explicit override
- profile-derived model
- inherit
- runtime-default (`resolve_model_ids: "omit"`)

Phase 6 should enforce that contract only at real run entry points:
- `init.plan-phase` / `/gsd-plan-phase`
- `init.execute-phase` / `/gsd-execute-phase`
- SDK `PhaseRunner` as defense in depth

It should not block config editing flows, and it should not silently route through `cross_ai_execution`.

## Current repo state

### Good foundations already present
- `sdk/src/query/runtime-model-contract.ts` is the canonical resolver.
- `sdk/src/query/config-query.ts` and `get-shit-done/bin/lib/model-profiles.cjs` already expose equivalent structured outcomes.
- `sdk/src/query/init.ts` already uses the contract for init model-token omission behavior.
- Tests already lock in explicit vs inherit vs runtime-default semantics.
- `verify.cjs` already accepts `inherit` as a valid profile, so Phase 6 should not treat inherit itself as invalid.

### Important gaps Phase 6 must close
1. No real fail-fast enforcement exists yet.
   - Current contract only rejects unknown agents.
   - `RUNTIME_CAPABILITIES` currently marks every runtime as supporting everything, so unsupported runtime/model combinations are not represented yet.

2. Workflow init payloads lose validation detail.
   - `init.plan-phase` and `init.execute-phase` only emit `*_model` token strings.
   - For inherit and runtime-default, both collapse to empty token at the workflow boundary, so the workflow cannot explain why the model is omitted.

3. SDK `PhaseRunner` can bypass workflow validation.
   - It uses `initPhaseOp()` and then directly calls `runPhaseStepSession()` / `runPlanSession()`.
   - No runtime/model preflight happens before research/plan/plan-check/execute/verify steps.

4. `session-runner.ts` still has pre-Phase-5 model logic.
   - `resolveModel()` uses a generic `model_profile` map (`balanced/quality/speed`) instead of the per-agent Phase 5 contract.
   - That is incompatible with strict enforcement and also drifts from current profile names (`budget`, `adaptive`, `inherit`).
   - Phase 6 should avoid a deep rewrite, but it needs a minimal fix so guarded SDK paths actually run with the intended per-agent binding.

## Recommended implementation shape

### 1. Add a reusable strict-binding validator next to the contract
Best placement: `sdk/src/query/runtime-model-validation.ts`

Reason:
- keeps Phase 5 resolution logic and Phase 6 enforcement logic separate
- lets `init.ts`, `phase-runner.ts`, and any future callers share one validator
- avoids duplicating binding interpretation in workflows or runner code

Recommended exports:
- `validateAgentBinding(config, agent): BindingValidationResult`
- `validateAgentBindings(config, agents): BindingValidationSummary`
- `formatBindingValidationError(summary): string`
- `assertAgentBindingsSupported(config, agents): void`

Recommended result shape:
- `ok: boolean`
- `runtime`
- `agent`
- `bindingKind`
- `source`
- `configuredModel`
- `resolvedModel`
- `reason`
- `suggestedFix`
- `crossAiExecutionSupported`
- `crossAiExecutionConfigured`
- `crossAiExecutionRecommended`

Use the existing `resolveAgentBinding()` result as input instead of recomputing semantics.

### 2. Add actual enforcement policy to the contract layer
Phase 6 needs a policy function that answers: “for this runtime, is this binding supported?”

Keep it conservative per D-07/D-09:
- `runtime-default` is valid by itself
- `inherit` is valid by itself
- block only when a real explicit/resolved model token is unsupported for the active runtime
- unknown-agent remains unsupported

Practical rule set for this repo:
- Claude runtime: explicit Anthropic aliases/full IDs are valid
- non-Claude runtimes using `resolve_model_ids: "omit"`: valid runtime-default path
- non-Claude runtimes with explicit profile-derived Claude model token: reject
- non-Claude runtimes with explicit override: allow only if the override is runtime-compatible; otherwise reject

For Phase 6 planning, the minimum viable implementation is string/prefix-based compatibility detection, not provider integration hardening. Example buckets:
- Claude-compatible: `opus`, `sonnet`, `haiku`, `claude-*`
- OpenAI/OpenRouter-style explicit IDs: `openai/...`, `gpt-*`, `o*`
- Gemini-style explicit IDs: `gemini*`, `google/...`

This policy should live in code, not docs/workflows, so later Phase 7 can reuse it.

### 3. Enforce at workflow init boundaries
Recommended behavior:
- `initPlanPhase()` validates:
  - `gsd-phase-researcher`
  - `gsd-planner`
  - `gsd-plan-checker` when `workflow.plan_check !== false`
- `initExecutePhase()` validates:
  - `gsd-executor`
  - `gsd-verifier` when `workflow.verifier !== false`

Recommended output behavior:
- fail the query itself with a structured `GSDError`
- include a readable multi-line message for terminal users
- optionally attach structured metadata in the error payload if the error class supports it

Why fail in init instead of later in markdown workflow logic:
- matches D-02/D-03 exactly
- keeps workflows simple
- gives one shared SDK/CJS behavior point
- avoids shipping new shell parsing logic for validation details

### 4. Add PhaseRunner defense-in-depth
`PhaseRunner` should call the same validator before:
- research/plan/plan-check block
- execute block

Recommended placement:
- one helper method in `phase-runner.ts`, e.g. `assertStepBindingsSupported(stepGroup)`
- call before the first relevant session starts

Agent groups:
- planning gate: `gsd-phase-researcher`, `gsd-planner`, optional `gsd-plan-checker`
- execution gate: `gsd-executor`, optional `gsd-verifier`

This satisfies D-10 and prevents SDK callers from bypassing workflow init validation.

### 5. Minimal adjacent fix for session-runner correctness
Do not rewrite `session-runner.ts` deeply in this phase.

Instead:
- stop relying on its internal generic `resolveModel()` for PhaseRunner hot paths
- in `phase-runner.ts`, resolve the concrete per-step agent binding with the Phase 5 contract
- pass `SessionOptions.model` explicitly when the binding is explicit/profile-derived
- pass `undefined` when the binding kind is `inherit` or `runtime-default`

Suggested step-to-agent mapping:
- research -> `gsd-phase-researcher`
- plan -> `gsd-planner`
- plan_check -> `gsd-plan-checker`
- execute -> `gsd-executor`
- verify -> `gsd-verifier`

This keeps `session-runner.ts` mostly untouched while making actual execution align with the validated binding.

## Error diagnostic contract

Every blocking error should include:
- agent
- runtime
- configured or resolved model
- binding kind/source
- failure reason
- suggested fix
- whether `cross_ai_execution` is a valid alternative

Recommended message style:

```text
Unsupported runtime/model binding before plan execution.

Agent: gsd-planner
Runtime: codex
Binding: profile
Resolved model: claude-opus-4-6
Reason: active runtime does not support this explicit model binding
Suggested fix: set resolve_model_ids to "omit" to use the runtime default, switch to model_profile "inherit", or configure a runtime-compatible model_overrides entry
Cross-AI alternative: available but not used automatically in Phase 6 (workflow.cross_ai_execution=false)
```

Important behavior notes:
- `resolve_model_ids: "omit"` alone must never error.
- `inherit` alone must never error.
- Error text should say whether the blocked value came from override vs profile resolution.
- Suggest `cross_ai_execution` only as an explicit next step, never as automatic fallback.

## Concrete file impact likely needed

Primary:
- `sdk/src/query/runtime-model-contract.ts`
- `sdk/src/query/runtime-model-validation.ts` (new)
- `sdk/src/query/init.ts`
- `sdk/src/phase-runner.ts`
- `sdk/src/query/config-query.test.ts`
- `sdk/src/query/init.test.ts`
- `sdk/src/phase-runner.test.ts`

Possible adjacent:
- `sdk/src/types.ts` if typed validation payloads/errors are surfaced
- `sdk/src/session-runner.ts` only if a tiny compatibility cleanup is unavoidable
- `tests/bug-1829-inherit-model-profile.test.cjs` for legacy safety coverage
- `tests/runtime-model-parity.test.cjs` if legacy-visible validation metadata is exposed

Probably not needed in Phase 6:
- workflow markdown files
- deep `session-runner` redesign
- `cross_ai_execution` command routing/hardening

## Test focus

Must cover:
1. explicit unsupported override blocks before plan execution
2. profile-derived unsupported model blocks before plan execution
3. explicit unsupported override blocks before execute execution
4. `inherit` remains valid and non-blocking
5. `resolve_model_ids: "omit"` remains valid and non-blocking
6. diagnostics include agent/runtime/model/reason/fix/cross-AI hint
7. `PhaseRunner` blocks the same invalid configs even without workflow init
8. valid legacy non-Claude config with runtime-default omission still passes

Good fixture combinations:
- `runtime: codex`, `model_profile: balanced` -> should block planner/executor because profile resolves to Claude models
- `runtime: codex`, `resolve_model_ids: "omit"` -> should pass
- `runtime: codex`, `resolve_model_ids: "omit"`, `model_overrides.gsd-planner: "openai/o3"` -> should pass
- `runtime: codex`, `resolve_model_ids: "omit"`, `model_overrides.gsd-planner: "claude-opus-4-6"` -> should block
- `runtime: claude`, `model_profile: balanced` -> should pass
- `runtime: claude`, `model_profile: inherit` -> should pass

## Validation Architecture

Phase 6 should produce enough structure for a later `VALIDATION.md`, but the validation artifact itself belongs to later workflow generation.

Recommended Phase 6 validation architecture:
- Layer 1: `resolveAgentBinding()` computes semantic binding state
- Layer 2: `validateAgentBinding(s)` checks runtime compatibility and produces structured diagnostics
- Layer 3: entry gates call the validator
  - `init.plan-phase`
  - `init.execute-phase`
  - `PhaseRunner` pre-step guard
- Layer 4: execution passes the already-validated explicit model token, or omits model for inherit/runtime-default

Validation assertions to capture in future `VALIDATION.md`:
- which agents are gated for planning vs execution
- which runtime/model combinations are intentionally blocked
- proof that inherit/runtime-default still work
- proof that explicit unsupported bindings fail before any agent session starts
- proof that `cross_ai_execution` is only suggested, not auto-invoked

## Main planning takeaway

The highest-value Phase 6 plan is:
1. add one shared validator over the Phase 5 contract
2. enforce it in `init.plan-phase` and `init.execute-phase`
3. add the same guard in `phase-runner.ts`
4. pass per-agent model selections explicitly from `phase-runner.ts` so execution matches validation
5. lock behavior with targeted tests around non-Claude runtimes, explicit overrides, inherit, and runtime-default omission

That is enough to satisfy SBV-01 through SBV-04 without prematurely expanding into Phase 7 routing work or a large session-runner rewrite.

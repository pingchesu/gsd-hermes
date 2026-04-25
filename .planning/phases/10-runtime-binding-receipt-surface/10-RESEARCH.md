# Phase 10 Research — Runtime Binding Receipt Surface

**Date:** 2026-04-25
**Phase:** 10 — Runtime Binding Receipt Surface
**Milestone:** v1.4 Hermes Runtime Model Binding Receipts
**Requirements:** RCPT-01, RCPT-02, RCPT-03, RCPT-04

## Scope

Phase 10 is the receipt-surface phase. It must make GSD's model-binding intent observable at SDK init and workflow boundaries without claiming Hermes child-agent enforcement is solved yet. The runtime enforcement channel itself belongs to Phase 11, and fail-fast enforcement/proof belongs to Phase 12.

## Problem Statement

The current project can resolve model overrides through `.planning/config.json`, and flat fields such as `planner_model` or `executor_model` can show the configured model token. That is not enough evidence that Hermes spawned subagents actually run with that model. Phase 10 must expose structured receipts that separate:

1. `resolved_by_gsd` — GSD config/runtime resolver outcome.
2. `passed_to_runtime` — whether the workflow has a concrete runtime token it intends to pass to subagent creation.
3. `runtime_enforced` — whether the runtime has provided proof that the child agent actually used the requested model.

For Phase 10, `runtime_enforced` should be `unknown` unless there is real runtime proof. Do not infer enforcement from `planner_model` strings or subagent self-reporting.

## Current Config Evidence

Project config currently uses Hermes runtime with explicit per-agent overrides:

- `runtime: hermes`
- `model_profile: inherit`
- `resolve_model_ids: omit`
- explicit overrides include:
  - `gsd-phase-researcher: claude-opus-4-7`
  - `gsd-planner: claude-opus-4-7`
  - `gsd-plan-checker: openai/gpt-5.4`
  - `gsd-executor: openai/gpt-5.4`
  - `gsd-verifier: openai/gpt-5.4`

This means Phase 10 must handle mixed provider families under Hermes and preserve configured tokens exactly in receipts.

## Codebase Findings

### SDK init queries

Relevant file: `sdk/src/query/init.ts`

- `initExecutePhase` currently returns flat model fields:
  - `executor_model`
  - `verifier_model`
- `initPlanPhase` currently returns flat model fields:
  - `researcher_model`
  - `planner_model`
  - `checker_model`
- These fields are produced through `getModelAlias(...)` and projected as strings.
- Existing workflow JSON consumers parse those flat keys, so Phase 10 must retain them for backwards compatibility.

### Runtime model contract

Relevant file: `sdk/src/query/runtime-model-contract.ts`

Existing useful pieces:

- `resolveAgentBinding(config, agent)` returns structured `RuntimeModelResolution`.
- `serializeRuntimeModelResolution(resolution)` returns serialized fields including:
  - `agent`
  - `status`
  - `known_agent`
  - `runtime`
  - `profile`
  - `binding_kind`
  - `source`
  - `configured_model`
  - `resolved_model`
  - `model_token`
  - `resolve_model_ids`
  - `cross_ai`
  - `runtime_capability`
  - rejection fields for unsupported bindings
- This is the right foundation for binding receipts.

Gap: current serialized contract is resolver-centric. It does not explicitly surface receipt truth fields such as `resolved_by_gsd`, `passed_to_runtime`, `runtime_enforced`, or user-facing enforcement status.

### Legacy CJS parity

Relevant files:

- `get-shit-done/bin/lib/init.cjs`
- `get-shit-done/bin/lib/model-profiles.cjs`
- `sdk/src/golden/golden.integration.test.ts`

Important constraint: golden tests compare SDK init output to legacy `gsd-tools.cjs` output for `init.plan-phase` and `init.execute-phase`. Any new receipt fields added to SDK init output must also be added to legacy CJS output or golden parity will fail.

### Existing tests

Relevant files:

- `sdk/src/query/init.test.ts`
- `sdk/src/query/config-query.test.ts`
- `tests/runtime-model-parity.test.cjs`
- `tests/init.test.cjs`
- `sdk/src/golden/golden.integration.test.ts`

Current tests cover:

- flat model fields exist
- model overrides win over profile and `resolve_model_ids: omit`
- inherit and runtime-default token projection
- SDK/CJS semantic parity
- SDK/CJS init JSON golden parity

Needed Phase 10 coverage:

- `init.plan-phase` includes structured binding receipts for researcher/planner/checker.
- `init.execute-phase` includes structured binding receipts for executor/verifier.
- flat fields remain unchanged.
- receipts distinguish resolver truth from runtime proof.
- SDK and CJS init outputs remain parity-compatible.

### Workflow surface

Relevant files:

- `get-shit-done/workflows/plan-phase.md`
- `get-shit-done/workflows/execute-phase.md`

Current workflow init parsing lists only flat model fields. Phase 10 should update workflow docs/prompts so Hermes users see a concise binding receipt before subagents spawn. Because Phase 11 will implement/enforce the real Hermes channel, Phase 10 should print the receipt and mark runtime proof conservatively.

## Recommended Receipt Shape

Add a new init field that is structured but compact, for example:

```json
{
  "model_binding_receipts": {
    "workflow": "plan-phase",
    "runtime": "hermes",
    "agents": {
      "researcher": {
        "agent": "gsd-phase-researcher",
        "configured_model": "claude-opus-4-7",
        "resolved_model": "claude-opus-4-7",
        "model_token": "claude-opus-4-7",
        "source": "override",
        "binding_kind": "explicit",
        "provider_family": "anthropic",
        "enforceability": "explicit-token-needs-runtime-proof",
        "resolved_by_gsd": true,
        "passed_to_runtime": true,
        "runtime_enforced": "unknown"
      }
    }
  }
}
```

Also consider role-specific convenience keys to reduce workflow parsing complexity:

- `researcher_binding_receipt`
- `planner_binding_receipt`
- `checker_binding_receipt`
- `executor_binding_receipt`
- `verifier_binding_receipt`

However, avoid duplicated data if possible. A single `model_binding_receipts.agents` object plus role mapping is likely enough.

## Receipt Semantics

Proposed fields:

- `agent`: canonical GSD agent name.
- `role`: workflow role (`researcher`, `planner`, `checker`, `executor`, `verifier`).
- `runtime`: detected runtime.
- `profile`: resolved profile input.
- `binding_kind`: `explicit`, `profile`, `inherit`, or `runtime-default`.
- `source`: `override`, `profile`, `inherit-profile`, or `resolve-model-omit`.
- `configured_model`: model token from config override, or null.
- `resolved_model`: resolver output, or null.
- `model_token`: token intended for runtime, or null.
- `provider_family`: detected family (`anthropic`, `openai`, `google`, `unknown`).
- `known_agent`: whether contract covers this agent.
- `resolved_by_gsd`: true only when the GSD resolver returned `status: resolved`.
- `passed_to_runtime`: true only when `model_token` is non-empty and intended to be passed through the workflow/runtime boundary.
- `runtime_enforced`: `unknown` in Phase 10 unless runtime proof is provided by a later phase.
- `enforceability`: short string suitable for CLI/transcript display:
  - `explicit-token-needs-runtime-proof`
  - `inherits-or-runtime-default`
  - `unsupported`
- `message` / `suggested_fix`: for unsupported cases.

## Boundary With Later Phases

Phase 10 must not attempt to solve the Hermes per-agent binding channel. It should make the missing proof visible. Phase 11 will identify and implement the actual channel. Phase 12 will add fail-fast validation and invalid-model/no-silent-fallback proof tests.

## Risk Notes

- Do not remove or rename flat model fields; existing workflows and tests depend on them.
- Do not silently treat explicit override as runtime-enforced.
- Do not use subagent self-reporting as proof.
- Keep CJS and SDK output aligned to preserve golden tests.
- Avoid leaking credentials in diagnostics; receipts should include model names, not API keys or request headers.

## Open Implementation Questions

1. Should receipts live only under `model_binding_receipts`, or also expose role-specific shortcut keys? Recommendation: one structured object first; add shortcuts only if workflow rendering becomes awkward.
2. Should `runtime_enforced` be boolean or enum? Recommendation: enum/string (`unknown`, `false`, `true`) because Phase 10 has resolver truth but not runtime proof.
3. Should provider family be derived from `configured_model`, `resolved_model`, or `model_token`? Recommendation: use the intended runtime token when present, otherwise `resolved_model`, otherwise `configured_model`.

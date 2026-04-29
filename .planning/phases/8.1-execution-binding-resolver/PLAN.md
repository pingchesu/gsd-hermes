---
phase: 8.1
title: Execution Binding Resolver
status: planned
created: 2026-04-29
milestone: v1.8 Provider-Routed Agent Execution
requirements:
  - ROUTE-01
  - ROUTE-02
  - ROUTE-03
  - ROUTE-04
  - ROUTE-05
---

# Phase 8.1: Execution Binding Resolver

## Objective

Introduce a single SDK-owned resolver that turns already-resolved `model_overrides` / model binding receipts into explicit execution bindings before any agent is spawned.

The resolver is the source of truth for this contract:

- `anthropic/claude-opus-4-7` and other Claude-family tokens route to `claude-cli` with `cli_model = claude-opus-4-7`.
- `openai/gpt-5.5` and other OpenAI/GPT-family tokens route to `codex-cli` with `cli_model = gpt-5.5`.
- `inherit`, omitted, and runtime-default bindings preserve current behavior unless provider-routed execution is explicitly enabled.
- Unsupported providers produce structured fail-fast diagnostics and never fall back to Claude, Codex, or parent runtime silently.

## Scope

### In

1. Add an SDK resolver module, likely `sdk/src/query/agent-execution-router.ts`.
2. Reuse existing provider-family detection from `sdk/src/query/runtime-model-contract.ts` where possible.
3. Extend `init.execute-phase` output with `agent_execution_bindings` when `workflow.agent_execution_router = "provider-cli"`.
4. Normalize provider-prefixed model tokens for CLI usage:
   - `anthropic/claude-opus-4-7` → `claude-opus-4-7`
   - `openai/gpt-5.5` → `gpt-5.5`
5. Add credential-free unit/init tests for resolver output and fail-fast diagnostics.

### Out

1. Actually spawning `claude -p` or `codex exec` — that belongs to Phase 8.2.
2. Full docs/release notes — that belongs to Phase 8.4.
3. npm publish or GitHub Release.

## Likely Files

- `sdk/src/query/runtime-model-contract.ts`
- `sdk/src/query/init.ts`
- `sdk/src/query/agent-execution-router.ts` (new)
- `tests/runtime-model-parity.test.cjs`
- `tests/init.test.cjs`
- `tests/agent-execution-router.test.cjs` (new, if current test structure supports it)

## Implementation Steps

1. Inspect current model binding receipt shape from `init.execute-phase` and existing tests.
2. Define `AgentExecutionBinding` shape with at least:
   - `agent`
   - `configured_model`
   - `provider_family`
   - `execution_driver`
   - `cli_model`
   - `source`
   - `strict`
   - `diagnostic`
3. Implement resolver behavior for:
   - Anthropic/Claude → `claude-cli`
   - OpenAI/GPT → `codex-cli`
   - inherit/omitted/default → preserve current behavior when router disabled
   - unknown provider under `provider-cli` → structured fail-fast binding/error
4. Wire resolver into `init.execute-phase` without changing actual command dispatch yet.
5. Add tests for Anthropic/OpenAI normalization, disabled-router compatibility, and unsupported provider diagnostics.
6. Run focused tests, then the Hermes compatibility gate if quick enough.

## Verification

Minimum gates for Phase 8.1:

```bash
npm test -- tests/agent-execution-router.test.cjs tests/init.test.cjs tests/runtime-model-parity.test.cjs
npm run test:hermes
```

If the repo test runner does not accept explicit test files, use the nearest supported focused command and document the fallback.

## Acceptance Criteria

- `gsd-sdk query init.execute-phase <phase>` exposes deterministic `agent_execution_bindings` when provider routing is enabled.
- `openai/gpt-5.5` maps to `codex-cli` / `gpt-5.5`.
- `anthropic/claude-opus-4-7` maps to `claude-cli` / `claude-opus-4-7`.
- Unknown providers fail fast with actionable diagnostics.
- Existing behavior remains unchanged when `workflow.agent_execution_router` is absent or not `provider-cli`.

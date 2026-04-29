---
phase: 8.1
title: Execution Binding Resolver
status: complete
completed: 2026-04-29
requirements:
  - ROUTE-01
  - ROUTE-02
  - ROUTE-03
  - ROUTE-04
  - ROUTE-05
---

# Phase 8.1 Summary: Execution Binding Resolver

## Completed

Implemented SDK-owned provider-routed execution bindings for explicit per-agent model overrides.

## Key Changes

- Added `sdk/src/query/agent-execution-router.ts`.
- Extended `init.execute-phase` with `agent_execution_bindings` when `workflow.agent_execution_router = "provider-cli"`.
- Added strict routing behavior:
  - Anthropic/Claude explicit bindings → `claude-cli` with normalized CLI model.
  - OpenAI/GPT explicit bindings → `codex-cli` with normalized CLI model.
  - Unknown/non-explicit bindings → `unsupported` diagnostic, no fallback driver.
- Added `workflow.agent_execution_router` to config schemas and minimal configuration docs to satisfy schema/docs parity.
- Added `tests/agent-execution-router.test.cjs` covering direct resolver behavior and init output.

## Verification

- `npm run build:sdk && node --test tests/agent-execution-router.test.cjs` — pass, 6/6.
- `npm run test:hermes` — pass.
- `npm test` — pass, 5927/5927.
- `npm run lint:tests` — pass.
- Live SDK check:
  - `node bin/gsd-sdk.js query init.execute-phase 8.1`
  - `executor` binding: `openai/gpt-5.5` → `codex-cli` / `gpt-5.5`.
  - `verifier` binding: `anthropic/claude-opus-4-7` → `claude-cli` / `claude-opus-4-7`.

## Next

Proceed to Phase 8.2: update `/gsd-execute-phase` dispatch to consume `agent_execution_bindings` and actually spawn the selected CLI driver with preflight and receipts.

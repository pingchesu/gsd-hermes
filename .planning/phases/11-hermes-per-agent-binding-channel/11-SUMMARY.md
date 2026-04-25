# Phase 11 Summary: Hermes Per-Agent Binding Channel

**Status:** Complete  
**Completed:** 2026-04-26  
**Route:** `/gsd-execute-phase 11`  
**Execution mode:** Hermes inline/degraded orchestration, with direct repository edits and verification.

## What changed

Phase 11 implemented the child-agent binding channel needed for GSD/Hermes per-agent model overrides to reach Hermes spawned agents instead of silently inheriting the parent model.

### 1. Hermes Agent binding channel

Updated the local Hermes Agent checkout at `/home/whiskey/.hermes/hermes-agent` so `delegate_task` exposes and propagates explicit child model overrides:

- Direct single-child calls can pass `delegate_task(model=...)`.
- Batch calls can pass heterogeneous `tasks[].model` values.
- Model precedence is now:
  1. `tasks[i].model`
  2. top-level `model`
  3. `delegation.model`
  4. parent-agent inheritance
- Empty strings and `inherit` mean no explicit override at that level, preserving existing inheritance behavior.
- `run_agent.py` forwards the tool argument into `delegate_task(...)`.
- Delegate tests assert child `AIAgent(model=...)` construction receives the expected model for direct and batch cases.

This is Phase 11 child-construction proof. Provider wire-level request proof remains Phase 12 scope.

### 2. GSD runtime binding channel receipts and validation

Updated GSD runtime-model contract/validation surfaces so Hermes receipts and validation distinguish child-construction channel availability from provider-level enforcement:

- Added `runtime_binding_channel` metadata to structured model binding receipts.
- Hermes explicit override receipts now expose:
  - `kind: hermes-delegate-task-model`
  - `available: true`
  - `proof_level: child-construction`
- `runtime_enforced` remains `unknown`; Phase 11 does not claim provider wire-level proof.
- Added fail-fast validation support for explicit Hermes overrides when the delegate model channel is unavailable, returning actionable diagnostics with agent, runtime, configured model, rejection reason, and suggested fix.
- Preserved existing flat fields such as `planner_model`, `executor_model`, etc.
- Kept SDK and legacy CJS parity.

### 3. Workflow and compatibility docs

Updated Hermes compatibility and workflow wording to make the proof boundary explicit:

- `runtime_enforced=unknown` is not provider proof.
- Hermes child-construction binding is represented by `runtime_binding_channel.kind=hermes-delegate-task-model` and `proof_level=child-construction`.
- Explicit model tokens should flow through `delegate_task(model=...)` or `tasks[].model`.
- If that channel is unavailable, GSD should stop on a pre-spawn validation error instead of spawning and silently falling back.

## Verification

### Hermes Agent

Ran in `/home/whiskey/.hermes/hermes-agent`:

```bash
.venv/bin/python -m pytest tests/tools/test_delegate.py tests/agent/test_auxiliary_codex_responses_conversion.py -q && \
.venv/bin/python -m py_compile tools/delegate_tool.py run_agent.py tests/tools/test_delegate.py agent/auxiliary_client.py tests/agent/test_auxiliary_codex_responses_conversion.py
```

Result: `121 passed, 24 warnings`.

### GSD targeted gates

Ran in `/home/whiskey/workspace/project/central/v2/gsd-hermes`:

```bash
npm run build:sdk
cd sdk && npx vitest run src/query/init.test.ts src/query/config-query.test.ts
node --test tests/init.test.cjs tests/runtime-model-parity.test.cjs tests/workflow-size-budget.test.cjs tests/hermes-docs.test.cjs
```

Results:

- SDK build passed.
- Vitest passed: `63 passed`.
- Node targeted tests passed: `216 passed`.

### Full suite

Ran:

```bash
npm test
```

Result:

- `5593` tests passed.
- `1002` suites passed.
- `0` failures.

## Important boundaries

- Phase 11 proves the Hermes child `AIAgent(model=...)` construction path, not the provider request payload.
- Provider wire-level `model=...` diagnostics and invalid-model no-silent-fallback smoke tests remain Phase 12 scope.
- The local Hermes Agent patch may require restarting Hermes CLI/gateway processes before an already-running process loads it.
- Existing unrelated Hermes Agent dirty file `web/package-lock.json` was not touched or staged.

## Outcome

Phase 11 is complete. The next route is `/gsd-plan-phase 12` to plan fail-fast validation and provider-proof tests.

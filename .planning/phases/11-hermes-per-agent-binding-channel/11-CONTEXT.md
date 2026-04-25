# Phase 11 Context — Hermes Per-Agent Binding Channel

## Mission

Implement or prove the real Hermes child-agent model binding path for GSD-originated per-agent model overrides. If a configured explicit model cannot be carried into Hermes child construction, fail before spawning any subagent.

Phase 11 is not about adding more resolver receipts; Phase 10 already did that. Phase 11 is about the runtime binding channel between GSD workflow intent and Hermes child `AIAgent(model=...)` construction.

## Requirement mapping

| Requirement | Phase 11 responsibility |
| --- | --- |
| BIND-01 | Identify and document the authoritative Hermes binding path. |
| BIND-02 | Ensure explicit GSD overrides construct Hermes child `AIAgent` with the expected model instead of inheriting `parent_agent.model`. |
| BIND-03 | Preserve per-task model bindings in batch/multi-agent spawns. |
| BIND-04 | Emit a clear pre-spawn validation error when the binding path is unavailable or unsupported. |

## Current repo state

- Runtime config: `.planning/config.json` has `runtime: "hermes"`, `model_profile: "inherit"`, `resolve_model_ids: "omit"`, and explicit `model_overrides`.
- Phase 10 closeout is committed at `f20a5a52 docs(10): close runtime binding receipt phase`.
- Live `gsd-sdk query init.plan-phase 11` output shows explicit binding receipts for researcher/planner/checker with `passed_to_runtime=true` and `runtime_enforced=unknown`.
- `.planning/phases/11-hermes-per-agent-binding-channel/` is the Phase 11 directory.

## Current Hermes source truth

Checked source: `/home/whiskey/.hermes/hermes-agent/tools/delegate_tool.py`

Important current behavior:

- `DELEGATE_TASK_SCHEMA` does not expose `model` at top-level or per-task.
- `delegate_task(...)` signature does not accept `model`.
- Registry handler does not pass `model`.
- `run_agent.py::_dispatch_delegate_task(...)` does not pass `model`.
- `_resolve_delegation_credentials(...)` reads global `delegation.model` from Hermes config.
- `_build_child_agent(..., model, ...)` already constructs `AIAgent(model=effective_model)` with `effective_model = model or parent_agent.model`.
- Batch construction passes the same `creds["model"]` to every child today.

Therefore the smallest binding seam is to add a model argument before `_build_child_agent`, not to redesign child construction.

## Implementation posture

Prefer this order:

1. Patch Hermes Agent's `delegate_task` schema/signature/dispatch to support `model` and `tasks[].model`.
2. Add Hermes Agent unit tests that prove child construction receives top-level and per-task model tokens.
3. Update GSD/Hermes workflows or generated skill adapter guidance so Hermes runtime uses `delegate_task(..., model=receipt.model_token)` instead of relying on Claude-style `Task(model=...)` semantics.
4. Add pre-spawn capability validation in GSD so explicit Hermes model overrides fail fast if the active Hermes delegate schema lacks the model field.

## Binding semantics to preserve

- Explicit model token:
  - non-empty model string should reach Hermes child construction exactly as configured/resolved.
- Inherit binding:
  - empty, null, absent, or literal `inherit` from GSD should omit the child model and preserve parent inheritance.
- Runtime-default binding:
  - no explicit model token should not fabricate a model; it may remain runtime default/inherit depending on the runtime path.
- Batch binding:
  - per-task `model` beats top-level `model`.
  - top-level `model` beats global `delegation.model`.
  - `delegation.model` remains the global default when no per-call/per-task model is specified.
  - parent model inheritance remains the fallback.

## Files likely to change during execution

Hermes Agent sibling repo:

- `/home/whiskey/.hermes/hermes-agent/tools/delegate_tool.py`
- `/home/whiskey/.hermes/hermes-agent/run_agent.py`
- `/home/whiskey/.hermes/hermes-agent/tests/tools/test_delegate.py`

GSD Hermes repo:

- `sdk/src/query/runtime-model-contract.ts`
- `sdk/src/query/runtime-model-validation.ts`
- `get-shit-done/bin/lib/model-profiles.cjs`
- `get-shit-done/bin/lib/init.cjs`
- `get-shit-done/workflows/plan-phase.md`
- `get-shit-done/workflows/execute-phase.md`
- `tests/runtime-model-parity.test.cjs`
- `tests/init.test.cjs`
- possibly new focused tests under `tests/` for Hermes binding-channel/pre-spawn diagnostics
- `docs/hermes-compatibility.md`

## Verification commands

Hermes Agent focused verification:

```bash
cd /home/whiskey/.hermes/hermes-agent
.venv/bin/python -m pytest tests/tools/test_delegate.py -q
.venv/bin/python -m py_compile tools/delegate_tool.py run_agent.py
```

GSD Hermes focused verification:

```bash
cd /home/whiskey/workspace/project/central/v2/gsd-hermes
npm run build:sdk
cd sdk && npx vitest run src/query/config-query.test.ts src/query/init.test.ts
cd .. && node --test tests/runtime-model-parity.test.cjs tests/init.test.cjs
npm run test:hermes
```

Full gate when feasible:

```bash
npm test
```

## Proof boundary

Phase 11 acceptance should require child-construction proof:

- static schema includes `model` and `tasks[].model`;
- dispatch pass-through includes `model`;
- mocked `AIAgent` constructor receives expected model values for single and batch calls;
- GSD pre-spawn validation rejects explicit overrides when that seam is absent.

Provider wire-level proof remains Phase 12 unless Phase 11 intentionally adds sanitized provider request instrumentation. Do not treat subagent self-report as proof.

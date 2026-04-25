# Phase 11 Research — Hermes Per-Agent Binding Channel

## Research question

Phase 10 made GSD runtime/model binding receipts visible, but left `runtime_enforced` conservative (`unknown`). Phase 11 must identify the actual Hermes channel that can bind a spawned child agent to a per-agent model, or define a pre-spawn failure path when that channel is absent.

Requirements covered: BIND-01, BIND-02, BIND-03, BIND-04.

## Inputs inspected

- `.planning/REQUIREMENTS.md` — Phase 11 owns BIND-01..BIND-04.
- `.planning/ROADMAP.md` — Phase 11 success criteria and planned 11-01..11-03 plan split.
- `.planning/config.json` — current Hermes runtime config uses explicit per-agent `model_overrides`:
  - researcher/planner: `claude-opus-4-7`
  - checker/executor/verifier and several auditors: `openai/gpt-5.4`
- Phase 10 artifacts:
  - `10-RESEARCH.md`
  - `10-CONTEXT.md`
  - `10-SUMMARY.md`
  - `docs/hermes-compatibility.md`
- GSD runtime/model code:
  - `sdk/src/query/runtime-model-contract.ts`
  - `sdk/src/query/runtime-model-validation.ts`
  - `get-shit-done/bin/lib/model-profiles.cjs`
  - `get-shit-done/bin/lib/init.cjs`
  - `tests/runtime-model-parity.test.cjs`
  - `tests/init.test.cjs`
- GSD workflow surfaces:
  - `get-shit-done/workflows/plan-phase.md`
  - `get-shit-done/workflows/execute-phase.md`
- Existing regression context:
  - `tests/bug-2256-model-overrides-transport.test.cjs`
  - `tests/bug-2516-inherit-model-execute-phase.test.cjs`
  - `tests/issue-2517-runtime-aware-profiles.test.cjs`
- Hermes runtime source checked out at `/home/whiskey/.hermes/hermes-agent`:
  - `tools/delegate_tool.py`
  - `run_agent.py`
  - `tests/tools/test_delegate.py`

## Key findings

### F-01 — GSD resolver and receipts are already producing explicit model intent

Live init output for Phase 11 shows structured receipts:

- `researcher` / `gsd-phase-researcher`: configured/resolved/model_token = `claude-opus-4-7`, source `override`, binding `explicit`, provider family `anthropic`, `passed_to_runtime=true`, `runtime_enforced=unknown`.
- `planner` / `gsd-planner`: configured/resolved/model_token = `claude-opus-4-7`, source `override`, binding `explicit`, provider family `anthropic`, `passed_to_runtime=true`, `runtime_enforced=unknown`.
- `checker` / `gsd-plan-checker`: configured/resolved/model_token = `openai/gpt-5.4`, source `override`, binding `explicit`, provider family `openai`, `passed_to_runtime=true`, `runtime_enforced=unknown`.

This proves resolver intent and workflow-handoff intent only. It does not prove Hermes child construction or provider request behavior.

### F-02 — Current Hermes delegate_task source has no per-call `model` schema field

In `/home/whiskey/.hermes/hermes-agent/tools/delegate_tool.py`, `DELEGATE_TASK_SCHEMA` exposes:

- top-level: `goal`, `context`, `toolsets`, `tasks`, `role`, `acp_command`, `acp_args`
- per-task: `goal`, `context`, `toolsets`, `acp_command`, `acp_args`, `role`

It does not expose a top-level or per-task `model` field in the checked source. The registry handler similarly passes `goal`, `context`, `toolsets`, `tasks`, `max_iterations`, `acp_command`, `acp_args`, `role`, and `parent_agent`, but no `model`.

Impact: a GSD workflow can display `model="{planner_model}"` in Claude-style `Task(...)` examples, but Hermes `delegate_task` cannot currently receive that model token as a first-class per-call argument.

### F-03 — Current Hermes child construction can bind a model, but only if a model reaches `_build_child_agent`

`tools/delegate_tool.py::_build_child_agent(...)` already has a `model: Optional[str]` parameter and constructs children with:

```python
effective_model = model or parent_agent.model
child = AIAgent(..., model=effective_model, ...)
```

So the child-construction seam exists. The missing channel is upstream of it: `delegate_task(...)` currently passes `model=creds["model"]`, where `creds` comes from `_resolve_delegation_credentials(cfg, parent_agent)`.

### F-04 — Existing `delegation.model` is global, not per-agent or per-task

`_resolve_delegation_credentials(...)` reads `cfg.get("model")`, i.e. `delegation.model` from Hermes config. That value applies to every child spawned by a `delegate_task` call.

Consequences:

- Single child can use a configured global delegation model.
- Batch children all receive the same `creds["model"]`.
- Different GSD agents in the same workflow cannot receive different configured models through this path.
- If `delegation.model` is unset, the child inherits `parent_agent.model`.

This matches the milestone root cause: explicit per-agent overrides can resolve in GSD but still not affect Hermes child construction.

### F-05 — ACP args are a possible transport-specific escape hatch, but not sufficient as the canonical GSD binding seam

Hermes delegate_task already supports `acp_command` and `acp_args` at both top-level and per-task levels. In `_build_child_agent`, `override_acp_args` becomes `effective_acp_args`, and when `override_acp_command` is provided the provider is forced to `copilot-acp`.

This can carry a CLI-specific `--model` argument for an ACP subprocess, but it is not a general Hermes direct-provider binding path:

- It depends on a subprocess ACP transport being selected.
- It does not bind direct Hermes `AIAgent(..., provider=..., model=...)` children unless translated back into `model`.
- It is awkward for mixed-provider batches where each task needs a different GSD model token.

ACP `--model` remains a useful compatibility path, but Phase 11 should use a direct `delegate_task.model` / `tasks[].model` field as the canonical seam and keep ACP args as optional transport details.

### F-06 — `run_agent.py` has a single delegate dispatch pass-through that must be updated

`run_agent.py::_dispatch_delegate_task(function_args)` is the single call site for delegate tool dispatch. Its docstring says new `DELEGATE_TASK_SCHEMA` fields only need to be added there to reach all invocation paths.

Current pass-through includes no `model`. Therefore Phase 11 implementation must update this function, not just `tools/delegate_tool.py`.

### F-07 — Hermes already surfaces child model metadata in runtime-visible places once construction is correct

`tools/delegate_tool.py` records child model in several runtime-observable structures:

- `effective_model_for_cb = model or getattr(parent_agent, "model", None)` feeds progress callbacks.
- active subagent registry entries include `"model": getattr(child, "model", None)`.
- final result entries include `"model": child.model` when string.

These are useful child-construction proof surfaces after the model binding reaches `_build_child_agent`. They are not provider wire-level proof, but they are stronger than subagent self-report.

### F-08 — Provider request proof remains Phase 12 territory

Phase 11 can prove that Hermes constructs `AIAgent(model=expected_model)` for each child. It should not overclaim wire-level proof unless tests inspect the provider request path directly.

Preferred proof hierarchy remains:

1. Provider request / wire-level `model=...`
2. Hermes child agent construction / runtime registry model metadata
3. Static schema/code checks
4. Subagent self-report — not proof

Phase 11 should set the stage for Phase 12 no-silent-fallback and provider diagnostics tests. Provider wire-level proof remains Phase 12 unless Phase 11 deliberately adds sanitized request instrumentation.

### F-09 — Current GSD runtime capability semantics overclaim unless tied to actual Hermes channel availability

`runtime-model-contract.ts` currently marks Hermes `supportsExplicitModel: true`, and receipts show `runtime_capability.supports_explicit_model=true`, but `runtime_enforced=unknown`.

After Phase 11, this should become conditional:

- If the installed/target Hermes delegate schema supports `model`, explicit model binding can be considered handoff-enforceable at child-construction level.
- If not, explicit overrides must fail before spawn rather than silently continuing with `parent_agent.model`.

A safe implementation should provide a runtime capability/seam check instead of a blanket Hermes true.

### F-10 — Existing tests provide useful guardrails but not the Phase 11 proof

Existing tests cover:

- Config resolver and receipt parity (`runtime-model-parity.test.cjs`, SDK init tests).
- Codex/OpenCode install-time model override transport (`bug-2256-model-overrides-transport.test.cjs`).
- Claude-style `inherit` omission guidance (`bug-2516-inherit-model-execute-phase.test.cjs`).
- Runtime-aware profile resolution (`issue-2517-runtime-aware-profiles.test.cjs`).

Missing tests for Phase 11:

- Hermes `DELEGATE_TASK_SCHEMA` exposes `model` at top-level and `tasks[].model`.
- `run_agent._dispatch_delegate_task` passes `model` through.
- `delegate_task(goal=..., model=...)` constructs child `AIAgent(model=expected)`.
- `delegate_task(tasks=[...model A..., ...model B...])` constructs different children with different models.
- GSD workflow/init receipts either map explicit model tokens into Hermes delegate_task model fields or fail before spawn if the field is unavailable.

## Decision

Use a direct Hermes `delegate_task` model field as Phase 11's canonical binding channel:

- Add `model` to top-level `delegate_task` schema and function signature.
- Add `model` to `tasks[].model` for batch/multi-agent spawns.
- Plumb `model` through `run_agent._dispatch_delegate_task` and registry handler.
- Resolve effective per-task child model as:
  1. `tasks[i].model` if provided and non-empty.
  2. top-level `model` if provided and non-empty.
  3. `delegation.model` from Hermes config.
  4. `parent_agent.model` inheritance.
- Keep `inherit` as an omission/null behavior; do not pass literal `"inherit"` into `AIAgent(model=...)`.
- Add tests in Hermes Agent proving child construction uses the requested model.
- Update GSD/Hermes workflow guidance and receipt semantics so explicit Hermes overrides are either passed via `delegate_task(..., model=...)` or rejected pre-spawn if the runtime seam is absent.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Broad workflow rewrites increase upstream-sync cost. | Keep GSD changes in runtime receipt/capability helpers and concise Hermes-specific dispatch guidance. Avoid rewriting core workflow structure. |
| Provider wire-level proof is conflated with child construction proof. | Use receipt/proof terms carefully: Phase 11 proves child construction; Phase 12 owns provider request diagnostics. |
| Literal `"inherit"` reaches Hermes `AIAgent(model=...)`. | Normalize `inherit` and empty strings to `None` before child construction; preserve prior inheritance behavior. |
| Batch calls accidentally use top-level/global model for every task. | Add batch tests with two different task models and assert two different `AIAgent(model=...)` calls. |
| Hermes runtime source and packaged runtime differ. | Add static/version or schema detection guard in GSD so absence of `delegate_task.model` causes pre-spawn actionable failure. |
| Secrets leak in diagnostics. | Tests and docs must assert/request metadata excludes API keys, tokens, cookies, passwords, and connection strings. |

## Open questions for execution

1. Should the Hermes Agent patch be carried as a sibling repo change first, then copied into any packaged dependency/reference? Plan 11-01 should keep this explicit.
2. Should GSD detect the Hermes delegate schema dynamically, or should it gate by documented minimum Hermes Agent version? Prefer schema/capability detection when available; version gating is acceptable only if schema detection is impractical.
3. Should Phase 11 update `runtime_enforced` from `unknown` to a new child-construction value, or leave `runtime_enforced` reserved for provider proof? Preferred: keep `runtime_enforced=unknown` until provider proof, and add/consume a narrower `child_constructed_model` / `runtime_binding_channel` proof field if needed. If schema must remain small, document that Phase 11 proof is construction-level only and Phase 12 changes enforcement status.

# Track v1.4 Hermes runtime model binding receipts and fail-fast enforcement

## Root cause

GSD resolver/config surfaces could show explicit per-agent `model_overrides`, but the pre-fix Hermes child delegation path did not expose a per-call child `model` binding. That meant Hermes-spawned subagents could inherit the parent/default model even when GSD showed `source=override` and `binding=explicit`.

Resolver truth was therefore not the same as runtime truth.

## Static evidence

Pre-fix, Hermes `delegate_task` did not expose a per-call child model field for GSD to populate. `delegation.model` was only a global fallback/default, so a GSD-specific planner/executor override could not be proven at child construction.

Fix evidence to cite in PR:

- Hermes Agent schema/implementation now accepts direct `delegate_task(model=...)`.
- Batch delegation now accepts per-task `tasks[].model`.
- GSD receipts now expose `runtime_binding_channel.kind=hermes-delegate-task-model` and `proof_level=child-construction`.

## Runtime evidence

Runtime construction evidence to cite in PR:

- Hermes tests assert planner-style `delegate_task(model="openai/o4-mini")` constructs child `AIAgent(model="openai/o4-mini")`.
- Batch tests assert heterogeneous `tasks[].model` values reach their respective child `AIAgent` instances.
- Invalid explicit model strings reach child construction unchanged and do not inherit parent/default model.
- Provider diagnostics tests assert model/provider metadata can be exposed only after credential redaction.

## Fix summary

- Add structured plan/execute binding receipts so `/gsd-plan-phase` and `/gsd-execute-phase` show effective runtime/model intent before child dispatch.
- Add Hermes child binding channel support through `delegate_task(model=...)` and batch `tasks[].model`.
- Add fail-fast validation so unsupported explicit bindings fail before spawn instead of silently falling back.
- Add regression tests proving invalid explicit model tokens are preserved and cannot be hidden by parent/default fallback.
- Add safe provider diagnostics that preserve model/provider metadata while redacting credentials.

## Proof boundary

This tracker distinguishes evidence layers:

1. GSD resolver proof — config override resolves to a configured/resolved model token.
2. Workflow receipt proof — init payload/transcript displays binding receipt before dispatch.
3. Hermes child-construction proof — child `AIAgent(model=...)` receives the intended token.
4. Provider diagnostics — sanitized metadata can expose provider/model fields without secrets.
5. Provider wire-level enforcement — not overclaimed unless future live provider request instrumentation proves provider-side `model=` dispatch.

## Acceptance criteria

- [ ] `gsd-sdk query init.plan-phase <phase>` emits structured binding metadata for researcher/planner/checker agents.
- [ ] `gsd-sdk query init.execute-phase <phase>` emits structured binding metadata for executor/verifier agents.
- [ ] Hermes `/gsd-plan-phase` and `/gsd-execute-phase` transcript instructions display concise binding receipts before dispatch.
- [ ] Explicit Hermes model overrides reach child construction through `delegate_task(model=...)` or `tasks[].model`.
- [ ] Unsupported explicit binding paths fail fast with actionable diagnostics before subagent spawn.
- [ ] Invalid explicit model token tests prove no silent fallback to parent/default model.
- [ ] Safe provider diagnostics redact API keys, tokens, passwords, authorization headers, and credential-bearing URLs.
- [ ] README, COMMANDS.md, CONFIGURATION.md, Hermes compatibility docs, CHANGELOG, and release notes explain strict Hermes model binding semantics.
- [ ] PR CI passes before release.
- [ ] Release version uses the next publishable v1.4 patch version because `gsd-hermes@1.4.0` already exists.

## Validation commands

```bash
npm run build:sdk
cd sdk && npx vitest run src/query/init.test.ts src/query/config-query.test.ts
cd .. && node --test tests/init.test.cjs tests/runtime-model-parity.test.cjs tests/workflow-size-budget.test.cjs tests/hermes-docs.test.cjs
npm run test:hermes
npm test
```

Hermes Agent targeted validation:

```bash
cd /home/whiskey/.hermes/hermes-agent
.venv/bin/python -m pytest tests/tools/test_delegate.py tests/agent/test_auxiliary_codex_responses_conversion.py tests/agent/test_provider_diagnostics.py -q
.venv/bin/python -m py_compile tools/delegate_tool.py run_agent.py agent/provider_diagnostics.py agent/redact.py tests/tools/test_delegate.py tests/agent/test_provider_diagnostics.py
```

## Release note

`gsd-hermes@1.4.0` already exists as the upstream-sync package. Preflight also found local `v1.4.1`–`v1.4.29` tags, so this tracker should ship as the next local-safe v1.4 patch release, selected `gsd-hermes@1.4.30` / GitHub Release `v1.4.30`, unless the maintainer explicitly selects a different semver.

# Phase 12 Summary — Fail-Fast Validation and Proof Tests

Status: Complete
Completed: 2026-04-26
Route: `/gsd-execute-phase 12`
Execution mode: sequential inline under Hermes runtime compatibility fallback

## What changed

Phase 12 closed the runtime-model proof gap left after Phase 11 by adding regression coverage and safe diagnostics around strict model binding semantics.

### GSD SDK / legacy CJS validation matrix

Files changed:

- `sdk/src/query/init.test.ts`
- `tests/init.test.cjs`
- `tests/runtime-model-parity.test.cjs`
- `get-shit-done/bin/lib/model-profiles.cjs`

Added/locked behavior:

- Explicit Hermes overrides fail validation when the Hermes delegate model channel is unavailable.
- Inherit and runtime-default bindings do not fail solely because the delegate model channel is unavailable.
- Invalid explicit model tokens such as `definitely-not-a-real-model-gsd-binding-test` remain the configured/resolved model token instead of being replaced by a parent/default model.
- `workflow.cross_ai_execution` remains explicit metadata and is not treated as silent fallback.
- Legacy CJS exports now include validation helpers that mirror SDK behavior for the Phase 12 public validation surface.

### Hermes child-construction proof tests

Files changed:

- `/home/whiskey/.hermes/hermes-agent/tests/tools/test_delegate.py`

Added GSD-originated role tests proving:

- planner-style `delegate_task(model="openai/o4-mini")` constructs child `AIAgent(model="openai/o4-mini")`;
- planner/executor batch tasks can use heterogeneous `tasks[].model` values;
- top-level `model` applies to all batch children without task-specific models;
- invalid explicit model strings reach child construction unchanged and do not inherit parent or `delegation.model` defaults.

### Safe provider-request diagnostic helper

Files changed:

- `/home/whiskey/.hermes/hermes-agent/agent/provider_diagnostics.py`
- `/home/whiskey/.hermes/hermes-agent/tests/agent/test_provider_diagnostics.py`

Added an offline diagnostic helper for sanitized provider-request metadata. It preserves the diagnostic subject fields (`model`, `provider`, `subagent_id`, `agent_role`, etc.) while redacting API keys, bearer tokens, Authorization headers, passwords, client secrets, and credential-bearing URLs.

This is not a live provider wire-level assertion. It is an offline, safe diagnostic boundary proving that model metadata can be exposed without leaking credentials.

## Proof boundaries

- GSD resolver proof: covered by SDK/CJS validation and parity tests.
- Hermes child-construction proof: covered by `AIAgent(model=...)` constructor assertions in Hermes Agent tests.
- Provider/request diagnostic boundary: covered by offline sanitized metadata tests.
- Provider wire-level enforcement: still not overclaimed. `runtime_enforced` remains conservative unless future live/sanitized provider request instrumentation proves exact provider-side `model=` dispatch.

## Verification

GSD targeted gates:

```bash
cd /home/whiskey/workspace/project/central/v2/gsd-hermes
npm run build:sdk
cd sdk && npx vitest run src/query/init.test.ts src/query/config-query.test.ts
cd .. && node --test tests/init.test.cjs tests/runtime-model-parity.test.cjs tests/workflow-size-budget.test.cjs tests/hermes-docs.test.cjs
```

Result: PASS — SDK build passed, Vitest `66 passed`, Node targeted group `220 passed`.

Hermes Agent targeted gates:

```bash
cd /home/whiskey/.hermes/hermes-agent
.venv/bin/python -m pytest tests/tools/test_delegate.py tests/agent/test_auxiliary_codex_responses_conversion.py tests/agent/test_provider_diagnostics.py -q
.venv/bin/python -m py_compile tools/delegate_tool.py run_agent.py agent/provider_diagnostics.py agent/redact.py tests/tools/test_delegate.py tests/agent/test_provider_diagnostics.py
```

Result: PASS — `128 passed`; py_compile passed.

GSD full suite:

```bash
cd /home/whiskey/workspace/project/central/v2/gsd-hermes
npm test
```

Result: PASS — `5597/5597` tests passed.

## Redaction guarantees

The new diagnostic tests use fake secrets and assert they do not appear in sanitized output:

- API keys / token-like values
- bearer tokens / Authorization headers
- password-like values
- client secrets
- URL userinfo / credential-bearing connection strings

No real credentials were added to artifacts or test fixtures.

## Remaining route

Proceed to Phase 13: Tracker, Documentation, Release.

Phase 13 should open/update the GitHub tracker issue, prepare PR/release acceptance evidence, update README/COMMANDS/CONFIGURATION/release notes, and then run PR/CI/release/publish flow for `gsd-hermes@1.4.0`.

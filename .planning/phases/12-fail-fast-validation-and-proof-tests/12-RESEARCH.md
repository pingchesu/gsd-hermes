# Phase 12 Research: Fail-Fast Validation and Proof Tests

**Phase:** 12 — Fail-Fast Validation and Proof Tests  
**Date:** 2026-04-26  
**Route:** `/gsd-plan-phase 12`  
**Execution mode:** Hermes inline planning path.

## Mission

Phase 12 must prove the v1.4 runtime/model binding fix cannot silently fall back. Phase 11 created the Hermes child-construction binding channel and conservative GSD receipt metadata. Phase 12 turns that into regression proof:

- unsupported explicit bindings fail fast before spawn;
- invalid explicit model names cannot succeed by inheriting the parent/default model;
- child construction tests cover GSD-originated planner and executor roles;
- provider-request diagnostics expose only safe request metadata, never credentials.

## Inputs reviewed

- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/phases/11-hermes-per-agent-binding-channel/11-SUMMARY.md`
- GSD SDK/CJS runtime-model surfaces:
  - `sdk/src/query/runtime-model-contract.ts`
  - `sdk/src/query/runtime-model-validation.ts`
  - `sdk/src/query/init.ts`
  - `get-shit-done/bin/lib/model-profiles.cjs`
  - `get-shit-done/bin/lib/init.cjs`
- Current tests:
  - `sdk/src/query/init.test.ts`
  - `tests/init.test.cjs`
  - `tests/runtime-model-parity.test.cjs`
  - `tests/hermes-docs.test.cjs`
- Hermes Agent surfaces:
  - `/home/whiskey/.hermes/hermes-agent/tools/delegate_tool.py`
  - `/home/whiskey/.hermes/hermes-agent/run_agent.py`
  - `/home/whiskey/.hermes/hermes-agent/tests/tools/test_delegate.py`
  - `/home/whiskey/.hermes/hermes-agent/hermes_logging.py`
  - `/home/whiskey/.hermes/hermes-agent/agent/redact.py`

## Phase 11 baseline

Phase 11 completed these relevant changes:

- `delegate_task(model=...)` is accepted and reaches child `AIAgent(model=...)` construction.
- `tasks[].model` allows heterogeneous child model bindings.
- Precedence is `tasks[i].model > top-level model > delegation.model > parent inheritance`.
- GSD receipts include `runtime_binding_channel`.
- Hermes explicit override receipts use `kind=hermes-delegate-task-model`, `available=true`, `proof_level=child-construction`.
- `runtime_enforced` remains `unknown` because Phase 11 does not prove provider wire-level request payloads.
- Full GSD test suite passed `5593/5593`.
- Hermes Agent delegate/auxiliary tests passed `121` tests.

## Gaps Phase 12 must close

### 1. Validation matrix coverage

Current tests assert receipt presence and one unavailable-channel fail-fast path. Phase 12 should expand tests to cover override, inherit, and runtime-default cases across both plan-phase and execute-phase roles, and should cover SDK and legacy CJS projections.

Target requirements: ENF-01, TEST-01.

### 2. GSD-originated child-construction proof

Phase 11 Hermes tests prove raw `delegate_task(model=...)` and `tasks[].model`. Phase 12 should add a higher-level test fixture that mirrors GSD-originated roles: planner and executor at minimum, ideally including role labels/subagent metadata in the prompt or test name. This protects the integration seam from later schema or dispatch drift.

Target requirements: TEST-02, ENF-02.

### 3. Invalid model no-silent-fallback

An invalid explicit override such as `definitely-not-a-real-model-gsd-binding-test` must not complete by inheriting parent/default model. Testing can be staged:

- deterministic unit-level proof: assert the invalid string reaches `AIAgent(model=...)` construction and does not get replaced by parent model;
- provider/transport-level proof: in diagnostic/test mode, capture the outbound request `model` metadata or error metadata with credentials redacted;
- no live paid/provider test is required unless an opt-in environment flag is present.

Target requirements: ENF-02, TEST-03.

### 4. Redacted provider-request diagnostics

Provider proof must be safe by default. Diagnostics should expose minimal metadata such as:

- child/subagent id or task index;
- configured/effective model string;
- provider/api mode name;
- request path/category (Responses vs chat completions, if known);
- sanitized error category.

Diagnostics must never log API keys, tokens, passwords, Authorization headers, connection strings, or raw request bodies containing secrets. Existing Hermes redaction infrastructure (`agent.redact.RedactingFormatter`) should be reused rather than inventing a parallel sanitizer.

Target requirements: TEST-04, ENF-01.

### 5. `workflow.cross_ai_execution` remains explicit

No Phase 12 fix should silently route a failed binding to cross-AI execution. If cross-AI fallback is allowed, tests/docs must require it to remain user/config explicit and visible in receipts or workflow output.

Target requirement: ENF-03.

## Planning conclusion

Use four plans matching the roadmap:

1. Expand SDK/CJS validation and receipt tests.
2. Add Hermes GSD-role child-construction proof tests.
3. Add invalid-model no-silent-fallback plus redacted provider diagnostic coverage.
4. Run full regression gates, update closeout state, and fix any drift found by the suite.

Phase 12 should remain test/diagnostic focused. Do not broaden into Phase 13 release/tracker/docs except where minimal docs/test wording is required to verify diagnostics.

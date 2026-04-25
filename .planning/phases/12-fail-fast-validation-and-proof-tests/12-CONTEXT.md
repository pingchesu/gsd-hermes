# Phase 12 Context: Fail-Fast Validation and Proof Tests

**Phase:** 12 — Fail-Fast Validation and Proof Tests
**Route:** `/gsd-plan-phase 12`
**Date:** 2026-04-26
**Execution mode:** Hermes inline planning path.

## Why this phase exists

Phase 10 made runtime/model binding intent visible. Phase 11 added the Hermes child-agent binding channel and receipts for the child-construction proof boundary. Phase 12 must prove that strict semantics actually hold under failure and diagnostic scenarios:

- explicit per-agent overrides do not silently fall back to parent/default models;
- unsupported Hermes binding paths fail before spawning work;
- invalid explicit model names are observable at the child/provider boundary instead of being replaced;
- diagnostics reveal model metadata without leaking credentials.

## Requirements covered

- ENF-01 — Unsupported/unknown/not enforceable explicit `model_overrides` fail with clear actionable errors before subagents begin.
- ENF-02 — `definitely-not-a-real-model-gsd-binding-test` cannot complete successfully through parent/default inheritance.
- ENF-03 — `workflow.cross_ai_execution` remains explicit and observable; no silent routing/fallback.
- TEST-01 — SDK tests cover binding metadata for override, inherit, runtime-default cases.
- TEST-02 — Hermes tests prove child agent receives expected model from GSD-originated override.
- TEST-03 — No-silent-fallback tests cover invalid explicit model behavior.
- TEST-04 — Diagnostics expose provider request model metadata safely with redaction.

## Implementation boundaries

- Keep `runtime_enforced` conservative unless provider request metadata is actually proven.
- Child-construction proof can remain separate from provider wire-level proof.
- Do not add live provider tests that require paid/network credentials by default.
- If provider diagnostics are introduced, they must be opt-in/testable offline and must redact API keys, tokens, passwords, Authorization headers, and connection strings.
- Preserve SDK and legacy CJS parity.
- Preserve flat receipt fields for backward compatibility.
- Keep GSD-first architecture; avoid broad workflow rewrites.
- Do not stage or touch unrelated Hermes Agent dirty file `web/package-lock.json`.

## Repositories involved

- GSD repo: `/home/whiskey/workspace/project/central/v2/gsd-hermes`
- Hermes Agent repo: `/home/whiskey/.hermes/hermes-agent`

## Starting evidence

Phase 11 closeout evidence:

- GSD commit: `faa79371 feat(11): add Hermes per-agent binding channel receipts`
- Hermes Agent commit: `c0f4b05e fix: propagate delegated child model overrides`
- GSD full suite: `npm test` passed `5593/5593`
- Hermes Agent targeted suite: `121 passed, 24 warnings`

## Expected end state

By the end of Phase 12:

1. SDK/CJS tests prove validation/receipt behavior for explicit override, inherit, runtime default, unsupported channel, invalid override, and explicit cross-AI mode visibility.
2. Hermes Agent tests prove GSD-style planner/executor child construction receives configured models.
3. Provider/request diagnostic code and tests expose sanitized model metadata and prove redaction.
4. Full relevant test gates pass.
5. Phase 12 SUMMARY records commands, results, proof boundaries, and any remaining Phase 13 release/tracker tasks.

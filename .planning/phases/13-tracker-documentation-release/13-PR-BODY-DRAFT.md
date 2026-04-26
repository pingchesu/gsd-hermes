# Ship Hermes runtime model binding receipts and fail-fast enforcement

Closes #32

## Tracker

- Issue: https://github.com/pingchesu/gsd-hermes/issues/32

## Root cause

GSD resolver/config surfaces could report explicit per-agent `model_overrides`, but the pre-fix Hermes delegation path did not expose a per-call child `model` binding. In Hermes, spawned child agents could therefore inherit the parent/default model even when GSD receipts showed `source=override` and `binding=explicit`.

Resolver truth was not runtime truth.

## Change summary

### Phase 10 — Runtime Binding Receipt Surface

- Added structured `model_binding_receipts` to plan-phase and execute-phase init payloads.
- Preserved backward-compatible flat `*_model` fields.
- Updated workflow transcript instructions to show resolver/runtime/proof boundaries conservatively.

### Phase 11 — Hermes Per-Agent Binding Channel

- Added Hermes Agent child binding support through direct `delegate_task(model=...)` and batch `tasks[].model`.
- Added GSD receipt metadata for `runtime_binding_channel.kind=hermes-delegate-task-model` with `proof_level=child-construction`.
- Documented that `delegation.model` is a global fallback, not a per-agent GSD override channel.

### Phase 12 — Fail-Fast Validation and Proof Tests

- Added SDK/CJS validation coverage so unsupported explicit Hermes bindings fail before spawn.
- Added regression tests proving invalid explicit model tokens are preserved and cannot silently fall back to parent/default model.
- Added Hermes Agent tests proving GSD planner/executor model tokens reach child `AIAgent(model=...)` construction.
- Added safe provider diagnostics that preserve sanitized model/provider metadata while redacting credentials.

### Phase 13 — Tracker, docs, release prep

- Created tracker issue #32.
- Updated README, COMMANDS, CONFIGURATION, Hermes compatibility docs, CHANGELOG, package metadata, and curated release notes for the selected patch release.
- Selected `gsd-hermes@1.4.30` / GitHub Release `v1.4.30` because `1.4.0` is already published and local `v1.4.1`–`v1.4.29` tags are present.

## Proof boundary

This PR intentionally separates evidence layers:

1. GSD resolver proof — config override resolves to the configured/resolved model token.
2. Workflow receipt proof — init payload/transcript displays binding metadata before dispatch.
3. Hermes child-construction proof — child `AIAgent(model=...)` receives the intended token.
4. Provider diagnostics proof — sanitized metadata can expose provider/model fields without secrets.
5. Provider wire-level enforcement — not claimed unless future live sanitized request instrumentation proves provider-side `model=` dispatch.

`runtime_enforced=unknown` is conservative and must not be read as provider wire-level proof.

## Validation

Local validation to run before PR/release:

```bash
npm run build:sdk
cd sdk && npx vitest run src/query/init.test.ts src/query/config-query.test.ts
cd .. && node --test tests/init.test.cjs tests/runtime-model-parity.test.cjs tests/workflow-size-budget.test.cjs tests/hermes-docs.test.cjs
npm run test:hermes
npm test
npm pack --dry-run
```

Hermes Agent proof tests:

```bash
cd /home/whiskey/.hermes/hermes-agent
.venv/bin/python -m pytest tests/tools/test_delegate.py tests/agent/test_auxiliary_codex_responses_conversion.py tests/agent/test_provider_diagnostics.py -q
.venv/bin/python -m py_compile tools/delegate_tool.py run_agent.py agent/provider_diagnostics.py agent/redact.py tests/tools/test_delegate.py tests/agent/test_provider_diagnostics.py
```

Latest recorded Phase 12 results before Phase 13 docs/release updates:

- GSD full suite: PASS — `5597/5597`.
- GSD targeted gates: PASS.
- Hermes Agent targeted gates: PASS — `128 passed` plus `py_compile`.

Phase 13 final local/CI results will be recorded before merge/release.

## Release target

- npm package: `gsd-hermes@1.4.30`
- GitHub Release: `v1.4.30`
- Release notes: `docs/releases/v1.4.30-runtime-model-binding-receipts.md`

Pre-publish gates:

- [ ] `package.json` and `package-lock.json` both equal `1.4.30`.
- [ ] `npm view gsd-hermes versions --json` does not include `1.4.30`.
- [ ] `git tag --list v1.4.30` is empty before creating the release tag.
- [ ] `gh release view v1.4.30` reports no existing release before creating it.
- [ ] CI is green before publish.

## Acceptance checklist

- [ ] Structured plan/execute binding receipts are present and covered by SDK/CJS tests.
- [ ] Hermes child binding channel supports direct `model` and batch `tasks[].model`.
- [ ] Unsupported explicit bindings fail fast before spawn.
- [ ] Invalid explicit model tokens cannot be hidden by fallback to parent/default model.
- [ ] Provider diagnostics redact API keys, tokens, authorization headers, passwords, client secrets, and credential-bearing URLs.
- [ ] README, COMMANDS.md, CONFIGURATION.md, Hermes compatibility docs, CHANGELOG, and release notes document strict semantics and proof boundaries.
- [ ] npm/GitHub release evidence is recorded after publish.

## Rollback notes

Before publish, rollback is a normal PR revert/close. After npm publish, npm versions are immutable; corrections should ship as a follow-up patch release rather than unpublishing except under npm security policy.

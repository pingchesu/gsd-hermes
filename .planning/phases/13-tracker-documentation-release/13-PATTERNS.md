# Phase 13 Patterns — Existing Release and Documentation Workflow

Date: 2026-04-26

## Existing docs/release locations

| Purpose | Existing path |
| --- | --- |
| Top-level package overview | `README.md` |
| Command reference | `docs/COMMANDS.md` |
| Configuration reference | `docs/CONFIGURATION.md` |
| Hermes compatibility and guardrails | `docs/hermes-compatibility.md` |
| Release history | `CHANGELOG.md` |
| Long-form release note | `docs/releases/` |
| Package version | `package.json` / `package-lock.json` |

## Existing release-note pattern

- `CHANGELOG.md` has `[Unreleased]` followed by version sections.
- `docs/releases/v1.4.0-upstream-sync-cd057255.md` is the current v1.4 release note.
- README links individual release-note files under `docs/releases/`.
- Existing package line records both downstream package version and upstream base.

## Existing validation commands

- Hermes compatibility: `npm run test:hermes`
- SDK build: `npm run build:sdk`
- Full test suite: `npm test`
- Targeted Phase 12 GSD gates:
  - `cd sdk && npx vitest run src/query/init.test.ts src/query/config-query.test.ts`
  - `node --test tests/init.test.cjs tests/runtime-model-parity.test.cjs tests/workflow-size-budget.test.cjs tests/hermes-docs.test.cjs`
- Hermes Agent targeted gates from Phase 12:
  - `.venv/bin/python -m pytest tests/tools/test_delegate.py tests/agent/test_auxiliary_codex_responses_conversion.py tests/agent/test_provider_diagnostics.py -q`
  - `.venv/bin/python -m py_compile tools/delegate_tool.py run_agent.py agent/provider_diagnostics.py agent/redact.py tests/tools/test_delegate.py tests/agent/test_provider_diagnostics.py`

## Patterns for Phase 13 execution

1. Prefer small docs additions over broad rewrites.
2. Keep Hermes-specific docs in existing Hermes files instead of upstream-owned docs where possible.
3. Keep proof wording conservative and layered.
4. Use exact verification commands in issue/PR/release notes.
5. Treat npm publish as irreversible; do dry-run/pack checks first.
6. If preparing a clean PR branch, filter `.planning/` according to established PR hygiene.

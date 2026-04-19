---
phase: 06-compatibility-closure
status: complete
created: 2026-04-19
---

# Phase 6 Pattern Map

## Closest Existing Patterns

| Target | Closest Analog | Pattern to Reuse |
| --- | --- | --- |
| Targeted Hermes validation command | `scripts/run-tests.cjs` and package `scripts.test` | Use Node scripts as stable npm entry points for test orchestration. |
| Hermes compatibility tests | `tests/hermes-core-workflow.test.cjs` and `tests/hermes-lifecycle.test.cjs` | Use `node:test`, temp `HOME`, temp project roots, and deterministic filesystem assertions. |
| Docs regression checks | `tests/hermes-docs.test.cjs` | Assert exact support strings in docs to prevent stale or overstated compatibility claims. |
| Upstream sync governance | `docs/upstream-sync.md` and `docs/fork-ownership.md` | Keep sync merge-first and classify drift by ownership label. |
| Compatibility matrix | `docs/hermes-compatibility.md` | Maintain truthful status rows and known gaps rather than marketing language. |

## Files Likely Modified

- `package.json` - add `test:hermes` script.
- `scripts/validate-hermes-compat.cjs` - run targeted Hermes compatibility tests.
- `tests/hermes-compatibility-closure.test.cjs` - assert validation command wiring and docs checklist markers.
- `tests/hermes-docs.test.cjs` - extend docs assertions for Phase 6 matrix/checklist language.
- `docs/upstream-sync.md` - add post-sync validation workflow and release-blocker criteria.
- `docs/hermes-compatibility.md` - connect compatibility claims to evidence and ongoing maintenance rules.
- `docs/hermes-install.md` - link install guide smoke checks to compatibility validation.
- `docs/README.md` - surface compatibility validation and upstream sync maintenance docs.

## Implementation Constraints

- Do not require a real Hermes binary for deterministic validation.
- Do not claim native local Hermes install.
- Keep upstream-owned workflow edits out of scope unless a test proves a runtime-blocking gap.
- Keep validation commands copy-pasteable and short enough to run after every upstream sync.
- Preserve merge-first upstream sync discipline.


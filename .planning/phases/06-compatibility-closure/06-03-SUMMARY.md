---
phase: 06-compatibility-closure
plan: 03
subsystem: compatibility-docs
tags:
  - hermes
  - compatibility
  - docs
key-files:
  - docs/hermes-compatibility.md
  - docs/hermes-install.md
  - docs/README.md
  - tests/hermes-docs.test.cjs
metrics:
  tasks: 2
  tests: 4201
---

# Plan 06-03 Summary: Compatibility Matrix and Maintenance Guidance

## Commits

| Task | Commit | Description |
| --- | --- | --- |
| 1-2 | f4626f5 | Added validation evidence to compatibility docs, compatibility validation guidance to install docs, and docs regression coverage. |

## What Changed

- Updated `docs/hermes-compatibility.md` with a `Validation evidence` column and `## Maintenance Contract`.
- Added `## Compatibility Validation` to `docs/hermes-install.md`.
- Updated `docs/README.md` governance rows for validation matrix, maintenance contract, and post-sync validation checklist.
- Extended `tests/hermes-docs.test.cjs` to lock Phase 6 compatibility closure language.

## Verification

- `node --test tests/hermes-docs.test.cjs`
- `npm run test:hermes`
- `npm test` — 4201 tests / 814 suites passed

## Deviations

The first docs test run failed because the locked phrase `known gaps instead of
claiming unsupported parity` was split across lines in
`docs/hermes-compatibility.md`. The sentence was kept semantically identical
but moved to one line so docs regression can assert it exactly.

## Self-Check: PASSED

Compatibility docs now tie support claims to validation evidence, preserve the
native-local-install boundary, and document the maintenance contract for future
upstream syncs.

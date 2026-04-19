---
phase: 06-compatibility-closure
plan: 02
subsystem: upstream-sync
tags:
  - hermes
  - upstream-sync
  - docs
key-files:
  - docs/upstream-sync.md
  - tests/hermes-compatibility-closure.test.cjs
metrics:
  tasks: 2
  tests: 52
---

# Plan 06-02 Summary: Upstream Sync Validation Workflow

## Commits

| Task | Commit | Description |
| --- | --- | --- |
| 1-2 | f7066d4 | Added post-sync validation checklist, release-blocker criteria, and docs regression coverage. |

## What Changed

- Added `## Post-Sync Validation Checklist` to `docs/upstream-sync.md`.
- Added `## Release Blocker Criteria` to distinguish deterministic Hermes regressions from optional real-Hermes skips.
- Extended `tests/hermes-compatibility-closure.test.cjs` to assert checklist commands, ownership labels, and blocker language.

## Verification

- `node --test tests/hermes-compatibility-closure.test.cjs`
- `npm run test:hermes`

## Deviations

The first verification run failed because the docs used `Optional real...` while
the test asserted the exact lowercase phrase `optional real Hermes CLI
unavailability`. The docs were updated to the locked phrase and verification
passed.

## Self-Check: PASSED

Upstream sync now has a repeatable validation checklist and explicit blocker
criteria covered by deterministic docs regression tests.

---
phase: 06-compatibility-closure
plan: 01
subsystem: compatibility-validation
tags:
  - hermes
  - compatibility
  - tests
key-files:
  - package.json
  - scripts/validate-hermes-compat.cjs
  - tests/hermes-compatibility-closure.test.cjs
metrics:
  tasks: 2
  tests: 51
---

# Plan 06-01 Summary: Compatibility Validation Command

## Commits

| Task | Commit | Description |
| --- | --- | --- |
| 1-2 | 6e9e13c | Added `npm run test:hermes`, targeted Hermes validation runner, and regression coverage for the validation wiring. |

## What Changed

- Added `scripts/validate-hermes-compat.cjs` as the single targeted Hermes compatibility validation entry point.
- Added `test:hermes` to `package.json`.
- Added `tests/hermes-compatibility-closure.test.cjs` to pin the package script and targeted test file list.

## Verification

- `node --test tests/hermes-compatibility-closure.test.cjs`
- `npm run test:hermes`

## Deviations

None.

## Self-Check: PASSED

The targeted validation command runs deterministic Hermes tests without
requiring a real Hermes binary, and the command wiring is regression-tested.

---
phase: 04-core-workflow-parity
plan: 02
subsystem: installer
tags: [hermes, path-replacement, workflows, parity]

requires:
  - phase: 04-01-core-workflow-fixtures
    provides: "Hermes core workflow fixture test suite"
provides:
  - "Bare Claude runtime path replacement in copied workflow trees"
  - "Regression coverage for installed Hermes get-shit-done path leaks"
affects: [04-03-degraded-path-guidance, 04-04-core-smoke]

tech-stack:
  added: []
  patterns: [centralized-path-replacement, installed-output-regression]

key-files:
  created:
    - .planning/phases/04-core-workflow-parity/04-02-SUMMARY.md
  modified:
    - bin/install.js
    - tests/hermes-core-workflow.test.cjs

key-decisions:
  - "Fix Hermes workflow path issues in `copyWithPathReplacement()` instead of editing upstream workflow markdown."
  - "Test installed output, not only source content, because runtime users consume the copied tree."

requirements-completed: []

duration: 7min
completed: 2026-04-19
---

# Phase 4 Plan 02 Summary

Hardened installer path conversion so copied Hermes workflow files replace bare
`~/.claude` and `$HOME/.claude` references, then added installed-output tests
that fail if executable Claude runtime paths leak into Hermes fixtures.

## Accomplishments

- Added bare path replacement for `~/.claude`, `$HOME/.claude`, and
  `./.claude` in `copyWithPathReplacement()`.
- Added `assertNoExecutableClaudePathLeaks(rootDir)` to the Hermes core workflow
  fixture test suite.
- Verified both global and project-linked Hermes installed `get-shit-done`
  workflow trees are free of executable Claude runtime path leaks.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `node --test tests/hermes-core-workflow.test.cjs`
- `node --test tests/hermes-install.test.cjs tests/hermes-project-linked.test.cjs`

## Self-Check: PASSED

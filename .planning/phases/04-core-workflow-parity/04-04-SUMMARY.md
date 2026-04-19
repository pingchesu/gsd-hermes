---
phase: 04-core-workflow-parity
plan: 04
subsystem: tests-docs
tags: [hermes, smoke, optional-runtime-probe, verification]

requires:
  - phase: 04-03-runtime-degraded-path-docs
    provides: "Hermes degraded-path guidance and compatibility closure language"
provides:
  - "Optional real Hermes CLI smoke probe"
  - "Deterministic core workflow smoke documentation"
  - "Phase 4 final verification evidence"
affects: [hermes-core-workflow-tests, hermes-docs, phase-4-verification]

tech-stack:
  added: []
  patterns: [optional-runtime-probe, deterministic-ci-source-of-truth]

key-files:
  created:
    - .planning/phases/04-core-workflow-parity/04-04-SUMMARY.md
  modified:
    - tests/hermes-core-workflow.test.cjs
    - docs/hermes-install.md
    - docs/hermes-compatibility.md
    - tests/hermes-docs.test.cjs

key-decisions:
  - "Treat real Hermes CLI smoke as best-effort so contributors without Hermes can still run deterministic CI."
  - "Keep Node fixture tests as the source of truth for Phase 4 core workflow coverage."
  - "Close Phase 4 as supported with degraded paths, not full native runtime parity."

requirements-completed: [FLOW-01, FLOW-02, FLOW-03]

duration: 9min
completed: 2026-04-19
---

# Phase 4 Plan 04 Summary

Closed Phase 4 with an optional real Hermes CLI smoke probe, deterministic test
coverage, and docs that separate CI guarantees from best-effort runtime checks.

## Accomplishments

- Added `optional real Hermes CLI smoke is skipped when hermes is unavailable`
  to `tests/hermes-core-workflow.test.cjs`.
- Documented deterministic Node smoke as the CI source of truth and real Hermes
  CLI checks as optional operator validation.
- Updated compatibility wording to mark Phase 4 core workflow execution
  complete with degraded paths.
- Extended docs regression tests for the optional smoke commands and final
  compatibility wording.

## Deviations from Plan

No functional deviations. The optional real Hermes probe intentionally does not
fail on unsupported Hermes command-list syntax after the fixture install passes,
because Hermes CLI surfaces may vary across installed versions.

## Verification

- `node --test tests/hermes-core-workflow.test.cjs`
- `node --test tests/hermes-docs.test.cjs`
- `node --test tests/hermes-core-workflow.test.cjs tests/hermes-install.test.cjs tests/hermes-project-linked.test.cjs tests/hermes-docs.test.cjs tests/multi-runtime-select.test.cjs`
- `npm test`

## Self-Check: PASSED

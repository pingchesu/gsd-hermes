---
phase: 03-hermes-command-discovery
plan: 03
subsystem: docs
tags: [hermes, documentation, compatibility, command-discovery]

requires:
  - phase: 03-01-global-hermes-discovery
    provides: "Global Hermes command discovery implementation and tests"
  - phase: 03-02-project-linked-hermes
    provides: "Project-linked Hermes install and `skills.external_dirs` registration"
provides:
  - "Hermes install and command discovery guide"
  - "Phase 3 compatibility matrix for global and project-linked discovery"
  - "Docs/source regression tests plus full `npm test` verification"
affects: [phase-04-core-workflow-parity, phase-05-hermes-lifecycle, docs]

tech-stack:
  added: []
  patterns: [compatibility-contract-docs, docs-regression-tests]

key-files:
  created:
    - docs/hermes-install.md
    - tests/hermes-docs.test.cjs
    - .planning/phases/03-hermes-command-discovery/03-03-SUMMARY.md
  modified:
    - bin/install.js
    - docs/README.md
    - docs/hermes-compatibility.md
    - tests/multi-runtime-select.test.cjs

key-decisions:
  - "Document global and project-linked Hermes discovery as supported, while keeping core workflow parity in Phase 4 and lifecycle support in Phase 5."
  - "Keep native local Hermes install mode out of scope and name the local selection project-linked mode."
  - "Update stale Phase 2 test expectations as docs and installer copy now reflect Phase 3 support."

patterns-established:
  - "Runtime compatibility docs should pin supported, planned, and out-of-scope surfaces with exact matrix rows."
  - "Installer help text tests must evolve with compatibility docs so stale phase-boundary claims fail quickly."

requirements-completed: [HERM-01, HERM-02]

duration: 8min
completed: 2026-04-19
---

# Phase 3 Plan 03 Summary

**Hermes command discovery is now documented as Phase 3 supported behavior with tests that preserve the Phase 4 and Phase 5 boundaries.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-19T13:19:00+08:00
- **Completed:** 2026-04-19T13:27:29+08:00
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Added `docs/hermes-install.md` with global mode, project-linked mode, smoke commands, boundaries, and troubleshooting.
- Updated `docs/hermes-compatibility.md` so global install, project-linked `external_dirs`, runtime selection, and `/gsd-*` command discovery are marked supported.
- Added `tests/hermes-docs.test.cjs` and updated stale multi-runtime help assertions to match Phase 3 support.

## Task Commits

1. **Task 1 through Task 3: Hermes docs, compatibility matrix, installer copy, and docs tests** - `fb1adc1` (docs)

## Files Created/Modified

- `docs/hermes-install.md` - Documents install modes, smoke commands, boundaries, and troubleshooting.
- `docs/hermes-compatibility.md` - Updates compatibility status from Phase 1/2 planned wording to Phase 3 supported discovery.
- `docs/README.md` - Links the Hermes install guide from the docs index.
- `bin/install.js` - Adds `/gsd-help` smoke guidance for project-linked finish output.
- `tests/hermes-docs.test.cjs` - Locks docs and installer copy around the Phase 3 support contract.
- `tests/multi-runtime-select.test.cjs` - Updates stale Phase 2 help-text assertion.

## Decisions Made

The docs intentionally do not claim core workflow parity yet. Phase 3 only proves command discovery. `/gsd-new-project`, discuss, plan, execute, update, uninstall, and doctor parity remain explicitly assigned to later phases.

## Deviations from Plan

`tests/multi-runtime-select.test.cjs` was updated in addition to the planned files. Full `npm test` exposed a stale assertion requiring Phase 2 global-only Hermes help text, so the test was corrected to require the Phase 3 global/project-linked wording and `skills.external_dirs`.

## Issues Encountered

The first full `npm test` run failed with one stale test assertion in `tests/multi-runtime-select.test.cjs`. After updating that assertion, targeted tests and full `npm test` passed.

## Verification

- `node --test tests/hermes-install.test.cjs tests/hermes-project-linked.test.cjs tests/hermes-docs.test.cjs`
- `node --test tests/multi-runtime-select.test.cjs`
- `npm test` - 4176/4176 passed

## User Setup Required

None.

## Next Phase Readiness

Phase 4 can now focus on core Hermes workflow parity because Phase 3 has a tested command discovery surface, install modes, and compatibility contract.

---
*Phase: 03-hermes-command-discovery*
*Completed: 2026-04-19*

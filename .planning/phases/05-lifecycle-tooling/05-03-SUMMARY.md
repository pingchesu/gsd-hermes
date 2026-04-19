---
phase: 05-lifecycle-tooling
plan: 03
subsystem: testing
tags: [hermes, lifecycle, regression, node-test]
requires:
  - phase: 05-lifecycle-tooling
    provides: Hermes update, uninstall, and doctor behavior
provides:
  - Global Hermes lifecycle end-to-end regression
  - Project-linked Hermes lifecycle end-to-end regression
  - Targeted Hermes lifecycle suite verification
affects: [phase-05-lifecycle-tooling, hermes-installer, hermes-docs]
tech-stack:
  added: []
  patterns: [end-to-end installer subprocess fixtures, temp-home lifecycle validation]
key-files:
  created: []
  modified: [tests/hermes-lifecycle.test.cjs]
key-decisions:
  - "Lifecycle E2E tests use the installer subprocess instead of direct helper calls to catch CLI routing regressions."
  - "Project-linked lifecycle tests verify unrelated external_dirs entries survive uninstall."
patterns-established:
  - "Hermes lifecycle regressions should cover install, doctor, update, and uninstall in the same temp fixture."
requirements-completed: [QUAL-01, DIST-02, DIST-03]
duration: 2 min
completed: 2026-04-19
---

# Phase 5 Plan 03: Hermes Lifecycle Regression Summary

**Global and project-linked Hermes lifecycle E2E tests now cover install, doctor, update patch backup, uninstall, and config preservation**

## Performance

- **Duration:** 2 min
- **Started:** 2026-04-19T06:30:40Z
- **Completed:** 2026-04-19T06:32:17Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- Added global lifecycle E2E coverage for install, doctor, update patch backup, uninstall, and manifest removal.
- Added project-linked lifecycle E2E coverage for install, doctor, update patch backup, uninstall, exact config cleanup, and unrelated external dir preservation.
- Ran the targeted Hermes install/project-linked/docs/lifecycle suite successfully.

## Task Commits

1. **Tasks 1-3: Hermes lifecycle E2E regression coverage** - `28b54bc` (test)

## Files Created/Modified

- `tests/hermes-lifecycle.test.cjs` - Adds `Hermes lifecycle end-to-end` coverage.

## Decisions Made

- Kept this plan test-only; docs closure remains isolated to 05-04.
- Verified docs tests already pass, so no docs-only failure needed to be handed forward.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Verification

- `node --test tests/hermes-lifecycle.test.cjs` passed.
- `node --test tests/hermes-install.test.cjs tests/hermes-project-linked.test.cjs tests/hermes-docs.test.cjs tests/hermes-lifecycle.test.cjs` passed.

## Next Phase Readiness

Ready for 05-04 operator documentation updates. The implementation and regression tests now support changing lifecycle docs from planned to supported.

---
*Phase: 05-lifecycle-tooling*
*Completed: 2026-04-19*

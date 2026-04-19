---
phase: 05-lifecycle-tooling
plan: 01
subsystem: installer
tags: [hermes, lifecycle, uninstall, update, external_dirs]
requires:
  - phase: 03-hermes-command-discovery
    provides: Hermes global and project-linked install modes
provides:
  - Hermes external_dirs removal helper
  - Hermes-specific uninstall branch
  - Hermes update patch-preservation regression tests
affects: [phase-05-lifecycle-tooling, hermes-installer, hermes-docs]
tech-stack:
  added: []
  patterns: [temp-home installer subprocess tests, exact-path external_dirs cleanup]
key-files:
  created: [tests/hermes-lifecycle.test.cjs]
  modified: [bin/install.js]
key-decisions:
  - "Hermes project-linked uninstall removes only the exact normalized .gsd-hermes/skills external_dirs entry."
  - "Hermes update remains reinstall-over-existing through the existing manifest-backed local patch flow."
patterns-established:
  - "Hermes lifecycle tests use temp HOME and temp project directories for deterministic global/project-linked behavior."
requirements-completed: [DIST-02, DIST-03]
duration: 8 min
completed: 2026-04-19
---

# Phase 5 Plan 01: Hermes Lifecycle Update and Uninstall Summary

**Hermes lifecycle safety now removes only GSD-owned skills and preserves modified Hermes skill files during reinstall updates**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-19T06:20:00Z
- **Completed:** 2026-04-19T06:28:07Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Added `removeHermesExternalDir()` for exact normalized `skills.external_dirs` cleanup while preserving unrelated Hermes config.
- Added a Hermes-specific `uninstall()` branch that targets `.gsd-hermes` for project-linked mode and `~/.hermes` for global mode.
- Added lifecycle regression tests proving project-linked/global update patch backup and safe uninstall behavior.

## Task Commits

1. **Tasks 1-3: Hermes lifecycle update/uninstall safety** - `ef21e80` (feat)

## Files Created/Modified

- `bin/install.js` - Adds Hermes external_dirs removal, project-linked uninstall target resolution, and Hermes skill cleanup.
- `tests/hermes-lifecycle.test.cjs` - Covers external_dirs cleanup, global/project-linked update backup, and global/project-linked uninstall.

## Decisions Made

- Kept Hermes update as reinstall-over-existing because the existing manifest and `gsd-local-patches` path already preserves local edits.
- Kept global uninstall from mutating `skills.external_dirs`, matching the install contract that only project-linked mode writes that config.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Verification

- `node --test tests/hermes-lifecycle.test.cjs` passed.
- Acceptance checks passed for `removeHermesExternalDir`, Hermes uninstall log text, update backup test names, and `gsd-local-patches` coverage.

## Next Phase Readiness

Ready for 05-02 doctor diagnostics. The lifecycle test file now provides reusable temp HOME/project fixtures for read-only health checks.

---
*Phase: 05-lifecycle-tooling*
*Completed: 2026-04-19*

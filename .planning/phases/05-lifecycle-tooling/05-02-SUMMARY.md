---
phase: 05-lifecycle-tooling
plan: 02
subsystem: installer
tags: [hermes, doctor, diagnostics, lifecycle]
requires:
  - phase: 05-lifecycle-tooling
    provides: Hermes lifecycle uninstall/update foundation
provides:
  - Read-only Hermes doctor helper
  - Hermes doctor CLI flag
  - Doctor diagnostics regression coverage
affects: [phase-05-lifecycle-tooling, hermes-installer, hermes-docs]
tech-stack:
  added: []
  patterns: [structured health findings, read-only lifecycle diagnostics]
key-files:
  created: []
  modified: [bin/install.js, tests/hermes-lifecycle.test.cjs]
key-decisions:
  - "Hermes doctor is exposed through the installer as --hermes --doctor and performs no writes."
  - "Doctor findings use stable severity/path/message/fix objects so tests and docs can depend on them."
patterns-established:
  - "Hermes lifecycle checks should report actionable findings instead of mutating user config."
requirements-completed: [QUAL-01]
duration: 3 min
completed: 2026-04-19
---

# Phase 5 Plan 02: Hermes Doctor Diagnostics Summary

**Read-only Hermes doctor diagnostics for missing skills, manifest gaps, duplicate config entries, stale paths, and Claude path leaks**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-19T06:28:00Z
- **Completed:** 2026-04-19T06:30:37Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- Added `doctorHermesInstall()` returning structured `{ severity, path, message, fix }` findings.
- Added `--doctor` CLI handling for `--hermes`, including stable no-issue and finding output.
- Added tests for missing global skills, healthy project-linked install, duplicate external_dirs, stale external_dirs, and CLI doctor output.

## Task Commits

1. **Tasks 1-3: Hermes doctor helper, CLI, and tests** - `533bcaf` (feat)

## Files Created/Modified

- `bin/install.js` - Adds doctor flag parsing, read-only Hermes diagnostics, and CLI output.
- `tests/hermes-lifecycle.test.cjs` - Adds Hermes doctor diagnostics tests.

## Decisions Made

- Doctor defaults to global mode unless `--local` is supplied, matching the existing installer location default.
- Doctor reports missing manifests as warnings, not errors, so partial but usable installs can be diagnosed without over-failing.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Verification

- `node --test tests/hermes-lifecycle.test.cjs` passed.
- Acceptance checks passed for `doctorHermesInstall`, `severity`, `stale external_dirs`, CLI help text, no-issues output, unsupported-runtime error, and doctor test strings.

## Next Phase Readiness

Ready for 05-03 lifecycle regression consolidation across install, update, doctor, and uninstall smoke paths.

---
*Phase: 05-lifecycle-tooling*
*Completed: 2026-04-19*

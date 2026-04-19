---
phase: 02-hermes-runtime-install
plan: 01
subsystem: installer
tags: [hermes, installer, runtime-selection, upstream-import]
requires:
  - phase: 01-01
    provides: fork ownership boundaries and Hermes adapter seam routing
  - phase: 01-02
    provides: upstream remote and first-import workflow
  - phase: 01-03
    provides: Hermes compatibility boundary and guardrails
provides:
  - upstream get-shit-done source imported into the fork
  - Hermes runtime flag and interactive picker selection
  - Phase 2 truthful global-only Hermes installer copy
  - direct and interactive rejection for unsupported Hermes local installs
affects: [02-02, 02-03, phase-03]
tech-stack:
  added: [upstream get-shit-done source tree]
  patterns: [additive runtime registration, global-only Hermes boundary]
key-files:
  created:
    - bin/install.js
    - tests/multi-runtime-select.test.cjs
    - package.json
    - .planning/phases/02-hermes-runtime-install/02-01-SUMMARY.md
  modified:
    - bin/install.js
    - docs/README.md
key-decisions:
  - "Resolve the first upstream import before Hermes edits so runtime work lands against real installer seams."
  - "Make Hermes selectable now but keep install-path ownership, command discovery, and lifecycle behavior for later plans."
  - "Reject Hermes local install attempts in Phase 2 instead of implying native local support."
patterns-established:
  - "Hermes runtime selection follows upstream's additive hasRuntime, selectedRuntimes, and runtimeMap pattern."
  - "Installer-facing Hermes copy must describe global-only Phase 2 support and defer project-linked mode to external_dirs."
requirements-completed: [DIST-01]
duration: 6min
completed: 2026-04-19
---

# Phase 2 Plan 1: Hermes Runtime Selection Summary

**Upstream installer imported, then Hermes added to runtime selection with Phase 2 global-only copy and local-mode rejection**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-19T03:38:47Z
- **Completed:** 2026-04-19T03:44:25Z
- **Tasks:** 3
- **Files modified:** 798

## Accomplishments

- Imported upstream `get-shit-done` source into the previously planning-only fork.
- Added Hermes to installer runtime selection through `--hermes`, `--all`, and the interactive runtime picker.
- Updated installer-facing copy so Hermes is visible without claiming unsupported native local install parity.
- Rejected unsupported Hermes local installs with clear Phase 2 guidance and a later `external_dirs` bridge note.

## Task Commits

Each task was committed atomically:

1. **Task 1: Satisfy the upstream-source preflight before Hermes file edits** - `2a8794e` (`feat`)
2. **Task 2: Register Hermes in installer runtime selection and reject direct local mode** - `79c4c34` (`feat`)
3. **Task 3: Publish truthful Hermes help and prompt copy** - `3b4e615` (`docs`)

## Files Created/Modified

- `bin/install.js` - Imported upstream installer and added Hermes flag parsing, runtime selection, local rejection, prompt entry, banner, help option, examples, and notes.
- `tests/multi-runtime-select.test.cjs` - Imported upstream shared runtime selection test file for later Phase 2 coverage work.
- `package.json` - Imported upstream package metadata with Node engine preflight available.
- `docs/README.md` - Resolved first-import add/add conflict by preserving fork governance links and upstream documentation index.
- `.planning/phases/02-hermes-runtime-install/02-01-SUMMARY.md` - Records this plan execution.

## Decisions Made

- Used the documented unrelated-history upstream merge as Task 1 rather than hand-copying installer files, preserving traceable upstream history.
- Kept Hermes work bounded to installer entrypoint selection and help/prompt copy; no command discovery, install branch, path helper, lifecycle, or `external_dirs` mutation was added.
- Treated Hermes local-mode rejection as part of the installer selection boundary so `--hermes --local`, `--all --local`, and interactive Hermes local choices fail clearly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Resolved first-import `docs/README.md` add/add conflict**
- **Found during:** Task 1 (Satisfy the upstream-source preflight before Hermes file edits)
- **Issue:** The documented upstream import produced an add/add conflict because both the fork and upstream owned `docs/README.md`.
- **Fix:** Combined the fork governance index with the upstream documentation index so downstream governance remains visible without dropping upstream docs.
- **Files modified:** `docs/README.md`
- **Verification:** Task 1 preflight command passed after conflict resolution.
- **Committed in:** `2a8794e`

**2. [Rule 2 - Missing Critical] Rejected all Hermes local selection paths**
- **Found during:** Task 2 (Register Hermes in installer runtime selection and reject direct local mode)
- **Issue:** A direct `--hermes --local` guard alone would not catch `--all --local` or an interactive Hermes local choice, which would violate the Phase 2 global-only support boundary.
- **Fix:** Added selected-runtime and interactive-location guards while keeping the change inside installer selection/local validation.
- **Files modified:** `bin/install.js`
- **Verification:** Plan regex verification passed, `node --check bin/install.js` passed, and `node bin/install.js --hermes --local` exits with the expected rejection.
- **Committed in:** `79c4c34`

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 missing critical)
**Impact on plan:** Both changes were required to complete the requested plan safely. Scope stayed inside upstream import and `bin/install.js` installer-selection/help seams.

## Issues Encountered

- The installed `gsd-sdk` in this environment does not expose the documented `query` subcommand, so state and roadmap closeout were updated directly instead of through SDK query handlers.

## Known Stubs

None. Stub-pattern scan over the scoped installer/governance files found only normal initialized arrays, objects, and nullable parser state in imported upstream code.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ready for `02-02` to implement Hermes path resolution and install ownership rules against the imported installer.
- `02-03` still needs to update/add runtime tests; this plan intentionally did not implement test coverage scope.

## Verification

- `git remote get-url upstream >/dev/null && test -f bin/install.js && test -f tests/multi-runtime-select.test.cjs && node -e '...'` passed.
- Hermes selection regex verification passed.
- Hermes help/prompt copy regex verification passed.
- `node --check bin/install.js` passed.
- `node bin/install.js --hermes --local` exited with the expected Phase 2 local-install rejection.

## Self-Check: PASSED

- Verified `bin/install.js`, `tests/multi-runtime-select.test.cjs`, `package.json`, and this summary file exist on disk.
- Verified task commits `2a8794e`, `79c4c34`, and `3b4e615` exist in git history.
- Re-ran all plan verification commands successfully before closeout.

---
*Phase: 02-hermes-runtime-install*
*Completed: 2026-04-19*

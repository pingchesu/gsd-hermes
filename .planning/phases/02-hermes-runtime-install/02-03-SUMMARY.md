---
phase: 02-hermes-runtime-install
plan: 03
subsystem: testing
tags: [hermes, installer, runtime-selection, regression-tests]
requires:
  - phase: 02-01
    provides: Hermes runtime selection, help copy, and local-mode rejection baseline
  - phase: 02-02
    provides: Hermes path helpers, global install branch, no-settings path, and finish output
provides:
  - shared runtime picker regression coverage for Hermes
  - dedicated Hermes install-path and global-only regression coverage
  - sandboxed verification of the accepted ~/.gsd/defaults.json resolve_model_ids side effect
affects: [phase-03, phase-05, upstream-sync]
tech-stack:
  added: []
  patterns: [node:test source seam assertions, sandboxed HOME installer smoke]
key-files:
  created:
    - tests/hermes-install.test.cjs
    - .planning/phases/02-hermes-runtime-install/02-03-SUMMARY.md
  modified:
    - tests/multi-runtime-select.test.cjs
key-decisions:
  - "Keep Phase 2 coverage focused on runtime selection, Hermes path semantics, local rejection, no-settings behavior, and the accepted defaults side effect."
  - "Use a temporary HOME for Hermes installer smoke coverage so ~/.hermes and ~/.gsd writes are verified without touching the operator home directory."
patterns-established:
  - "Hermes runtime-selection tests mirror the prompt runtimeMap/allRuntimes and assert the upstream hasAll selectedRuntimes shape."
  - "Hermes install tests combine exported helper assertions, source seam assertions, and sandboxed CLI behavior checks."
requirements-completed: [DIST-01]
duration: 4min
completed: 2026-04-19
---

# Phase 2 Plan 3: Hermes Runtime Install Test Coverage Summary

**Hermes installer support is now pinned by shared picker tests and a dedicated install suite for path helpers, global-only rejection, no-settings behavior, and defaults writes**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-19T03:58:22Z
- **Completed:** 2026-04-19T04:01:45Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Updated the shared runtime-selection test to include Hermes in `runtimeMap`, `allRuntimes`, single-select, multi-select, dedupe, ordering, option numbering, `--hermes` help, and `hasAll` source-shape assertions.
- Added `tests/hermes-install.test.cjs` with Hermes helper assertions for `getDirName`, `getConfigDirFromHome`, and `getGlobalDir`.
- Added source and CLI behavior coverage for direct `--hermes --local`, `--all --local`, interactive local rejection, the bounded `~/.hermes/skills` install root, no `settings.json`/`config.yaml` writes, `global mode` output, and the accepted `resolve_model_ids: "omit"` side effect.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend shared runtime-selection regression coverage for Hermes** - `bea38bd` (`test`)
2. **Task 2: Create dedicated Hermes install-path regression coverage** - `ce3874a` (`test`)

## Files Created/Modified

- `tests/multi-runtime-select.test.cjs` - Mirrors the Hermes-aware runtime picker and asserts installer selection/help source seams.
- `tests/hermes-install.test.cjs` - Adds Hermes helper, source-seam, local-rejection, global install, no-settings, and defaults side-effect coverage.
- `.planning/phases/02-hermes-runtime-install/02-03-SUMMARY.md` - Records this plan execution.

## Decisions Made

- Used source assertions for interactive rejection and installer branch structure, then used sandboxed CLI tests for the observable direct/local rejection and global install side effects.
- Did not add `external_dirs` mutation tests, workflow parity tests, lifecycle tests, or runtime converter coverage, because those are explicitly out of scope for this plan.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed.
**Impact on plan:** Scope stayed inside `tests/multi-runtime-select.test.cjs` and `tests/hermes-install.test.cjs`.

## Issues Encountered

- The installed `gsd-sdk` in this environment does not expose the documented `query` subcommand, so state and roadmap closeout were updated directly instead of through SDK query handlers.

## Known Stubs

None. Stub-pattern scan over the scoped test files found no TODO/FIXME placeholders or hardcoded empty UI data stubs introduced by this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 installer behavior is covered by focused runtime tests and is ready for Phase 3 command discovery work.
- Project-linked `external_dirs`, `/gsd-*` discovery, lifecycle tooling, and workflow parity remain intentionally deferred to later phases.

## Verification

- `node --test tests/multi-runtime-select.test.cjs` passed: 24 tests, 2 suites.
- `node --test tests/hermes-install.test.cjs` passed: 13 tests, 4 suites after follow-up patch-guidance coverage.

## Self-Check: PASSED

- Verified `tests/multi-runtime-select.test.cjs`, `tests/hermes-install.test.cjs`, and this summary file exist on disk.
- Verified task commits `bea38bd` and `ce3874a` exist in git history.
- Re-ran both plan verification commands successfully before closeout.

---
*Phase: 02-hermes-runtime-install*
*Completed: 2026-04-19*

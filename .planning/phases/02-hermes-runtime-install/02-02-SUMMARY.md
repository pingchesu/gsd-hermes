---
phase: 02-hermes-runtime-install
plan: 02
subsystem: installer
tags: [hermes, installer, path-resolution, global-install]
requires:
  - phase: 02-01
    provides: Hermes runtime selection, help copy, and local-mode rejection baseline
provides:
  - Hermes path helpers resolving the global runtime root to ~/.hermes
  - Hermes global install branch writing command skills under ~/.hermes/skills
  - Hermes finish output that states global mode and the inherited ~/.gsd/defaults.json side effect
affects: [02-03, phase-03, phase-05]
tech-stack:
  added: []
  patterns: [additive installer helper cases, global-only Hermes install branch, no-settings runtime finish path]
key-files:
  created:
    - .planning/phases/02-hermes-runtime-install/02-02-SUMMARY.md
    - .planning/phases/02-hermes-runtime-install/deferred-items.md
  modified:
    - bin/install.js
key-decisions:
  - "Resolve Hermes global installs through ~/.hermes while keeping project-linked mode deferred to external_dirs work."
  - "Install Hermes command skills directly under ~/.hermes/skills without committing to a deeper Phase 2 child directory contract."
  - "Treat Hermes as a no-settings runtime in Phase 2 while preserving the inherited ~/.gsd/defaults.json resolve_model_ids side effect."
patterns-established:
  - "Hermes path helpers follow upstream's additive helper style without refactoring shared installer structure."
  - "Hermes finish output must state global mode and avoid /gsd-* discovery claims until Phase 3."
requirements-completed: [DIST-01]
duration: 6min
completed: 2026-04-19
---

# Phase 2 Plan 2: Hermes Path Resolution and Install Ownership Summary

**Hermes installer ownership now resolves to ~/.hermes, installs command skills under ~/.hermes/skills, and reports global mode without claiming project-linked support**

## Performance

- **Duration:** 6 min
- **Started:** 2026-04-19T03:48:30Z
- **Completed:** 2026-04-19T03:54:28Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added Hermes cases to `getDirName`, `getConfigDirFromHome`, and `getGlobalDir`, with global installs resolving to `~/.hermes`.
- Added the Hermes installer branch that rejects non-global install attempts and writes GSD command skills under `~/.hermes/skills`.
- Updated finish behavior so Hermes skips runtime-owned `settings.json`/hook configuration, keeps `~/.gsd/defaults.json` `resolve_model_ids: "omit"`, and prints `global mode` plus the resolved Hermes root.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Hermes path-helper cases with global-first ownership semantics** - `af7ba02` (`feat`)
2. **Task 2: Implement the Hermes global-only install branch and explicit finish behavior** - `540b39b` (`feat`)

## Files Created/Modified

- `bin/install.js` - Added Hermes helper resolution, global-only install guard, global skills install branch, no-settings return path, and Hermes-specific finish output.
- `.planning/phases/02-hermes-runtime-install/deferred-items.md` - Tracks the out-of-scope workflow content conversion warning found during Hermes smoke verification.
- `.planning/phases/02-hermes-runtime-install/02-02-SUMMARY.md` - Records this plan execution.

## Decisions Made

- Used `~/.hermes` as the Hermes global root and kept `.hermes` as an internal local helper placeholder only; the interactive location prompt labels Hermes local mode as global-only instead of showing a supported local path.
- Reused the existing Claude skill copy shape for Phase 2 so command files become `gsd-*` skill directories directly under `~/.hermes/skills`.
- Skipped Hermes `settings.json`, hooks, and runtime-owned config mutation in this plan while preserving the inherited non-Claude `~/.gsd/defaults.json` write.

## Deviations from Plan

None - plan executed exactly as written.

**Total deviations:** 0 auto-fixed.
**Impact on plan:** Scope stayed inside `bin/install.js` installer helper, install, and finish seams.

## Issues Encountered

- The installed `gsd-sdk` in this environment does not expose the documented `query` subcommand, so state and roadmap closeout were updated directly instead of through SDK query handlers.
- Initial placement of the Hermes `getGlobalDir` case was too far down the large helper for the plan's source-regex acceptance gate; it was moved near the top of the helper before Task 1 was committed.
- Hermes global smoke verification found one unreplaced bare `~/.claude` workflow reference in installed `get-shit-done/workflows/update.md`. This is logged in `deferred-items.md` because broad workflow/content conversion belongs to later phases.

## Known Stubs

None. Stub-pattern scan over the 02-02 diff found no TODO/FIXME placeholders or hardcoded empty UI data stubs introduced by this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Ready for `02-03` to add focused runtime tests around Hermes path helpers, the global install branch, local rejection, no-settings behavior, and finish output.
- `external_dirs`, command discovery, update/uninstall/doctor, and broader workflow path conversion remain intentionally deferred to later plans.

## Verification

- Plan helper regex verification passed.
- Plan Hermes install/finish regex verification passed.
- `node --check bin/install.js` passed.
- Temporary-home smoke passed: `node bin/install.js --hermes --global --no-sdk` installed 81 Hermes skills under `.hermes/skills`, wrote `.gsd/defaults.json`, and printed `global mode`.
- Local rejection smoke passed: `node bin/install.js --hermes --local` exited non-zero with the Phase 2 unsupported-local message.

## Self-Check: PASSED

- Verified `bin/install.js`, this summary, `deferred-items.md`, `STATE.md`, `ROADMAP.md`, and `REQUIREMENTS.md` exist on disk.
- Verified task commits `af7ba02` and `540b39b` exist in git history.
- Re-ran the plan regex verification commands and `node --check bin/install.js` successfully before closeout.

---
*Phase: 02-hermes-runtime-install*
*Completed: 2026-04-19*

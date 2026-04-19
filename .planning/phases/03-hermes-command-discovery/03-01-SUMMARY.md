---
phase: 03-hermes-command-discovery
plan: 01
subsystem: installer
tags: [hermes, command-discovery, global-install, skills]

requires:
  - phase: 02-hermes-runtime-install
    provides: "Hermes runtime install path, runtime selection, and global install baseline"
  - phase: 03-hermes-command-discovery
    provides: "Hermes command discovery context and validation contract"
provides:
  - "Hermes-owned `copyCommandsAsHermesSkills()` seam in the installer"
  - "Global Hermes install path using the Hermes skill conversion wrapper"
  - "Regression coverage proving `gsd-help/SKILL.md` is discoverable and free of stale Claude paths"
affects: [03-02-project-linked-install, 03-03-docs-compatibility, hermes-installer]

tech-stack:
  added: []
  patterns: [runtime-owned-skill-conversion-wrapper, hermes-skill-discovery-regression]

key-files:
  created:
    - .planning/phases/03-hermes-command-discovery/03-01-SUMMARY.md
  modified:
    - bin/install.js
    - tests/hermes-install.test.cjs

key-decisions:
  - "Keep a Hermes-named wrapper even though the current SKILL.md shape can reuse the Claude skill converter."
  - "Pin command discovery with a concrete `gsd-help/SKILL.md` assertion rather than only counting generated skill directories."

patterns-established:
  - "Hermes adapter seams should be explicit in `bin/install.js` so future upstream syncs do not hide runtime-specific behavior behind Claude helper names."
  - "Hermes generated skills must be tested for both discoverable frontmatter names and absence of stale `.claude` path references."

requirements-completed: [HERM-01]

duration: 8min
completed: 2026-04-19
---

# Phase 3 Plan 01 Summary

**Global Hermes installs now use a Hermes-owned skill conversion seam with regression-tested `gsd-*` command discovery output.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-04-19T13:06:00+08:00
- **Completed:** 2026-04-19T13:14:59+08:00
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added `copyCommandsAsHermesSkills()` in `bin/install.js` and routed the global Hermes install branch through it.
- Exported the Hermes conversion helper for direct installer tests under `GSD_TEST_MODE`.
- Extended Hermes install tests to prove `~/.hermes/skills/gsd-help/SKILL.md` exists, has `name: gsd-help`, and contains no stale Claude paths.

## Task Commits

1. **Task 1 and Task 2: Hermes conversion seam plus global discovery tests** - `d089dd6` (feat)

## Files Created/Modified

- `bin/install.js` - Adds the Hermes conversion wrapper and uses it from the Hermes global install branch.
- `tests/hermes-install.test.cjs` - Adds direct helper coverage and concrete `gsd-help` discovery assertions.

## Decisions Made

The implementation intentionally keeps `copyCommandsAsHermesSkills()` as a small wrapper over the existing skill conversion path. Hermes currently consumes the same `SKILL.md` directory shape, so duplicating conversion logic would add sync risk without improving behavior. The wrapper still gives Hermes an explicit adapter seam for Phase 3 and later lifecycle work.

## Deviations from Plan

None in repo scope. The planned implementation files and assertions were completed as specified.

## Issues Encountered

The first manual helper verification was run without `GSD_TEST_MODE=1`, which caused `bin/install.js` to execute its default installer path and perform a real global install outside this repository. The command was corrected and rerun with `GSD_TEST_MODE=1`; subsequent verification used the safe test-mode path.

## Verification

- `GSD_TEST_MODE=1 node -e 'const m=require("./bin/install.js"); if (typeof m.copyCommandsAsHermesSkills !== "function") process.exit(1)'`
- `node --test tests/hermes-install.test.cjs`

## User Setup Required

None.

## Next Phase Readiness

Plan 03-02 can build on the Hermes-owned conversion seam to add project-linked install output under `.gsd-hermes/skills` and register it through `~/.hermes/config.yaml` `skills.external_dirs`.

---
*Phase: 03-hermes-command-discovery*
*Completed: 2026-04-19*

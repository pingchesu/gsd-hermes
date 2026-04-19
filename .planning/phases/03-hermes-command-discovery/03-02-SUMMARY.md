---
phase: 03-hermes-command-discovery
plan: 02
subsystem: installer
tags: [hermes, project-linked, external-dirs, skills]

requires:
  - phase: 03-01-global-hermes-discovery
    provides: "Hermes-owned skill conversion seam and global discovery assertions"
provides:
  - "Hermes project-linked install path under `.gsd-hermes/skills`"
  - "`ensureHermesExternalDir()` helper for conservative `skills.external_dirs` mutation"
  - "Sandboxed installer coverage proving repeated project-linked installs are idempotent"
affects: [03-03-docs-compatibility, hermes-installer, hermes-lifecycle]

tech-stack:
  added: []
  patterns: [project-linked-runtime-install, idempotent-yaml-config-mutation]

key-files:
  created:
    - tests/hermes-project-linked.test.cjs
    - .planning/phases/03-hermes-command-discovery/03-02-SUMMARY.md
  modified:
    - bin/install.js
    - tests/hermes-install.test.cjs

key-decisions:
  - "Treat `--hermes --local` as project-linked mode, not native local install."
  - "Register project skills through user-level `~/.hermes/config.yaml` because Hermes discovers external project directories there."
  - "Keep global Hermes installs free of `config.yaml` mutation."

patterns-established:
  - "Project-linked runtime modes should write project-owned artifacts locally but mutate only the minimal user-level runtime config needed for discovery."
  - "External directory registration must be idempotent and preserve unrelated config text."

requirements-completed: [HERM-02]

duration: 10min
completed: 2026-04-19
---

# Phase 3 Plan 02 Summary

**Hermes local selection now installs project-owned GSD skills and registers them through `skills.external_dirs` without duplicating config entries.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-04-19T13:12:00+08:00
- **Completed:** 2026-04-19T13:22:26+08:00
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Removed Phase 2 local rejection guards and routed `--hermes --local` to `.gsd-hermes`.
- Added `ensureHermesExternalDir()` to create or update `~/.hermes/config.yaml` under `skills.external_dirs`.
- Added project-linked regression tests for missing config creation, idempotence, existing config preservation, and repeated sandboxed installer runs.

## Task Commits

1. **Task 1 through Task 3: Project-linked install path, external_dirs mutation, and tests** - `bb5de11` (feat)

## Files Created/Modified

- `bin/install.js` - Adds project-linked Hermes install behavior, idempotent Hermes config mutation, and updated user-facing output.
- `tests/hermes-project-linked.test.cjs` - Covers helper-level YAML mutation and sandboxed `--hermes --local --no-sdk` installer behavior.
- `tests/hermes-install.test.cjs` - Updates existing Hermes tests from Phase 2 rejection semantics to Phase 3 project-linked semantics.

## Decisions Made

Hermes `--local` is deliberately described as project-linked mode. The project receives `.gsd-hermes/skills`, while Hermes still discovers those skills through the user-level `~/.hermes/config.yaml` `skills.external_dirs` setting. This avoids a false claim of native local Hermes installs.

## Deviations from Plan

The plan only listed `bin/install.js` and `tests/hermes-project-linked.test.cjs`, but `tests/hermes-install.test.cjs` also had to change. Those tests were asserting the old Phase 2 rejection behavior, so leaving them unchanged would make the intended Phase 3 behavior fail the existing Hermes test suite.

## Issues Encountered

None beyond the planned semantic shift from Phase 2 global-only behavior to Phase 3 project-linked behavior.

## Verification

- `node -e 'const fs=require("fs");const s=fs.readFileSync("bin/install.js","utf8");const checks=[/\\.gsd-hermes/,/project-linked mode/,/external_dirs/,/isHermes[\\s\\S]{0,600}isGlobal[\\s\\S]{0,600}getGlobalDir\\(["\\x27]hermes["\\x27]/,/isHermes[\\s\\S]{0,800}!isGlobal[\\s\\S]{0,800}\\.gsd-hermes/];if(checks.some(re=>!re.test(s))) process.exit(1); if(/Hermes local install is not supported in Phase 2/.test(s)) process.exit(1);'`
- `GSD_TEST_MODE=1 node -e 'const m=require("./bin/install.js"); if (typeof m.ensureHermesExternalDir !== "function") process.exit(1)'`
- `node --test tests/hermes-project-linked.test.cjs`
- `node --test tests/hermes-install.test.cjs`

## User Setup Required

None.

## Next Phase Readiness

Plan 03-03 can now document both supported Hermes install modes and lock the public compatibility matrix around global discovery plus project-linked `external_dirs`.

---
*Phase: 03-hermes-command-discovery*
*Completed: 2026-04-19*

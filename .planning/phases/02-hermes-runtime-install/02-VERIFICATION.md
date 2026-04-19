---
phase: 02-hermes-runtime-install
verified: 2026-04-19T04:22:29Z
status: passed
score: 7/7 must-haves verified
overrides_applied: 0
deferred:
  - truth: "Installed Hermes workflow/content conversion has one known unreplaced bare ~/.claude reference outside Phase 2 installer semantics."
    addressed_in: "Phase 3 / Phase 4"
    evidence: "ROADMAP Phase 3 covers command discovery; Phase 4 covers workflow parity. deferred-items.md records the update.md content conversion warning as outside Plan 02-02 installer ownership semantics."
---

# Phase 2: Hermes Runtime Install Verification Report

**Phase Goal:** Make Hermes a first-class runtime option in the installer with correct install-path semantics.
**Verified:** 2026-04-19T04:22:29Z
**Status:** passed
**Re-verification:** No - initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Developers can choose Hermes during install through npm/npx entrypoints. | VERIFIED | `package.json` exposes the npm/npx bin `get-shit-done-cc -> bin/install.js`; `bin/install.js:76` parses `--hermes`, `bin/install.js:98` includes `hermes` in `--all`, and `bin/install.js:6605-6622` maps interactive option 11 to `hermes`. |
| 2 | Installer logic resolves Hermes paths consistently. | VERIFIED | `getDirName("hermes")` returns `.hermes` at `bin/install.js:174`; `getConfigDirFromHome("hermes", true)` returns `.hermes` at `bin/install.js:210`; `getGlobalDir("hermes")` resolves to `~/.hermes` at `bin/install.js:286-291`. |
| 3 | Install output clearly states which Hermes mode was configured. | VERIFIED | `finishInstall()` prints `Hermes configured in global mode` and the resolved Hermes root at `bin/install.js:6515-6524`; `node bin/install.js --help` also shows Hermes global-only mode and the `npx get-shit-done-cc --hermes --global` example. |
| 4 | Hermes local installs are rejected clearly and unsupported project-linked behavior is not claimed. | VERIFIED | Direct `--hermes --local` guard at `bin/install.js:89-93`, selected-runtime `--all --local` guard at `bin/install.js:119-123`, install-time guard at `bin/install.js:5472-5475`, and interactive local guard at `bin/install.js:6710-6714`. Runtime copy says project-linked support is later via `external_dirs`. |
| 5 | Hermes install writes the Phase 2 global shape under `~/.hermes/skills/` and keeps the inherited `~/.gsd/defaults.json` side effect explicit. | VERIFIED | Hermes install branch writes to `path.join(getGlobalDir("hermes"), "skills")` at `bin/install.js:5557-5566`; Hermes returns no runtime-owned settings at `bin/install.js:6109-6112`; non-Claude `resolve_model_ids: "omit"` write remains at `bin/install.js:6466-6485`. |
| 6 | Hermes runtime selection is regression-tested through shared runtime picker tests, including the real upstream `hasAll` expansion shape. | VERIFIED | `tests/multi-runtime-select.test.cjs` includes Hermes in mirrored `runtimeMap` and `allRuntimes`, tests single/multi/dedupe/order behavior, and asserts the `hasAll` selectedRuntimes source shape. Current run: 24 tests, 2 suites, all passing. |
| 7 | Hermes install-path semantics, global-only rejection paths, and accepted defaults side effect are covered by a dedicated runtime test. | VERIFIED | `tests/hermes-install.test.cjs` covers helpers, source integration, direct and `--all` local rejection, global install to `~/.hermes/skills`, no `settings.json`/`config.yaml`, `global mode`, defaults, and patch guidance. Current run: 13 tests, 4 suites, all passing. |

**Score:** 7/7 truths verified

### Deferred Items

Items not yet met but explicitly addressed in later milestone phases.

| # | Item | Addressed In | Evidence |
|---|------|--------------|----------|
| 1 | One installed workflow/content file still has an unreplaced bare `~/.claude` reference. | Phase 3 / Phase 4 | `.planning/phases/02-hermes-runtime-install/deferred-items.md` records this as runtime content conversion outside Phase 2. ROADMAP Phase 3 covers command discovery and project-linked mode; Phase 4 covers workflow parity. |

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `bin/install.js` | Hermes runtime flag parsing, selection registration, path helpers, global-only install branch, local rejection, and finish output | VERIFIED | Exists, substantive at 6965 lines, wired as package bin entrypoint and used by tests. Key source checks and `node --check bin/install.js` passed. |
| `tests/multi-runtime-select.test.cjs` | Shared selection coverage for Hermes | VERIFIED | Exists, substantive at 235 lines, wired into `npm test` via `scripts/run-tests.cjs`. Current direct run: 24/24 passing. |
| `tests/hermes-install.test.cjs` | Hermes helper, install branch, rejection, and side-effect coverage | VERIFIED | Exists, substantive at 209 lines, wired into `npm test`. Current direct run: 13/13 passing. |
| `package.json` | npm/npx entrypoint to installer | VERIFIED | `bin.get-shit-done-cc` points to `bin/install.js`; `npm test` script runs the repository test harness. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `package.json` | `bin/install.js` | `bin.get-shit-done-cc` | WIRED | npm/npx entrypoint resolves to the Hermes-aware installer. |
| `bin/install.js` | `selectedRuntimes` | CLI flags and `hasAll` expansion | WIRED | `--hermes` push and `--all` array both include `hermes`; local selected-runtime guard catches `--all --local`. |
| `bin/install.js` | interactive runtime picker | `runtimeMap`, `allRuntimes`, prompt option 11 | WIRED | Hermes appears in map, all list, and prompt text with `~/.hermes; global only in Phase 2`. |
| `bin/install.js` | Hermes path helpers | `getDirName`, `getConfigDirFromHome`, `getGlobalDir` | WIRED | All helpers have explicit Hermes cases resolving to `.hermes` and `~/.hermes`. |
| `bin/install.js` | install and finish behavior | `install()`, Hermes branch, `finishInstall()` | WIRED | Branch writes skills to `~/.hermes/skills`, skips runtime settings, preserves defaults write, and reports global mode. |
| `tests/multi-runtime-select.test.cjs` | `bin/install.js` | source assertions | WIRED | Tests assert runtime map, option numbering, `--hermes`, and `hasAll` source shape. |
| `tests/hermes-install.test.cjs` | `bin/install.js` | exports, source assertions, CLI smoke | WIRED | Tests require exported helpers and spawn installer for local rejection and global install behavior. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `bin/install.js` | `selectedRuntimes` | CLI args and interactive prompt parsing | Yes | FLOWING - `--hermes`, `--all`, and runtime picker route to `installAllRuntimes`. |
| `bin/install.js` | Hermes target path | `getGlobalDir("hermes", explicitConfigDir)` | Yes | FLOWING - install branch derives `skillsDir` from helper output and writes actual skill directories. |
| `bin/install.js` | Finish output mode/root | `finishInstall(..., runtime="hermes", configDir=targetDir)` | Yes | FLOWING - output uses `configDir || getGlobalDir("hermes")` and prints `global mode`. |
| `tests/hermes-install.test.cjs` | installer smoke filesystem assertions | sandboxed `HOME` and spawned installer | Yes | FLOWING - test confirms real files under `.hermes/skills` and `.gsd/defaults.json`. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Syntax check | `node --check bin/install.js` | exit 0 | PASS |
| Shared runtime selection tests | `node --test tests/multi-runtime-select.test.cjs` | 24 tests, 2 suites, 0 failures | PASS |
| Hermes install tests | `node --test tests/hermes-install.test.cjs` | 13 tests, 4 suites, 0 failures | PASS |
| Phase 2 focused suite | `node --test tests/multi-runtime-select.test.cjs tests/hermes-install.test.cjs` | 37 tests, 6 suites, 0 failures | PASS |
| Full suite | `npm test` | 4168 tests, 801 suites, 0 failures, duration 16657.611766 ms | PASS |
| Help output | `node bin/install.js --help` | Shows `npx get-shit-done-cc`, `--hermes`, global-only text, `~/.hermes`, and `external_dirs` deferred note | PASS |
| Direct local rejection | `HOME=$(mktemp -d) node bin/install.js --hermes --local` | exit 1 with explicit Phase 2 unsupported-local message | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DIST-01 | 02-01, 02-02, 02-03 | Developer can install `gsd-hermes` via npm/npx and choose Hermes as a runtime during setup. | SATISFIED | npm/npx bin points to installer; Hermes selectable by `--hermes`, `--all`, and interactive picker; global install smoke writes real skills under `~/.hermes/skills`; local/project-linked unsupported modes fail clearly. |

No orphaned Phase 2 requirements found in `.planning/REQUIREMENTS.md`; only DIST-01 maps to Phase 2.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `bin/install.js` | multiple | `return null`, empty arrays/objects, `console.log` | Info | Existing parser/default/logging patterns in a CLI installer, not stubs. The values are not hollow user-facing implementation paths. |
| `tests/hermes-install.test.cjs` | 183-189 | console capture in test | Info | Intentional test harness capture for `reportLocalPatches`; not production behavior. |

No blocker or warning anti-patterns were found in the Phase 2 implementation surface.

### Verification Command Accuracy

All plan-level verification commands passed when re-run. The final code review's `npm test` claim is accurate: current full suite result is 4168 tests passing with 0 failures. One summary detail is stale: `02-03-SUMMARY.md` reports `tests/hermes-install.test.cjs` as 12 tests in 3 suites, but the current test file and current run have 13 tests in 4 suites after later hardening commits.

### Human Verification Required

None.

### Gaps Summary

No blocking gaps found. The Phase 2 goal is achieved: Hermes is a first-class installer runtime option with correct Phase 2 path semantics, truthful global-only mode handling, explicit local rejection, focused regression coverage, and a clean full test suite. The known workflow content conversion warning is explicitly deferred to later command-discovery/workflow-parity phases and does not block this installer-runtime phase.

---

_Verified: 2026-04-19T04:22:29Z_
_Verifier: Claude (gsd-verifier)_

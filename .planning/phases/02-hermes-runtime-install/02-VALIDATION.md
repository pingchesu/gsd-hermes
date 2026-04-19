---
phase: 02
slug: hermes-runtime-install
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-19
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node built-in test runner plus source-audit checks against `bin/install.js` |
| **Config file** | none — per-task verification uses direct `node -e` source assertions and `node --test` runtime test files |
| **Quick run command** | `node --test tests/multi-runtime-select.test.cjs tests/hermes-install.test.cjs` |
| **Full suite command** | `node --test tests/multi-runtime-select.test.cjs tests/hermes-install.test.cjs && rg -n "hermes|\\.hermes|external_dirs|global mode|resolve_model_ids|--local|hasAll" bin/install.js tests` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run the exact task-level `<automated>` command from the verification map below
- **After every plan wave:** Run the full Phase 2 suite command across installer source and runtime tests
- **Before `$gsd-verify-work`:** Confirm Hermes remains limited to installer/path/test seams and that no task added discovery, `external_dirs` mutation, or lifecycle behavior
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Existence Check | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-----------------|--------|
| 02-01-01 | 01 | 1 | DIST-01 | T-02-01 | Phase 2 only proceeds after the documented upstream first-import flow lands the installer and shared runtime test files in the repo | repo preflight | `git remote get-url upstream >/dev/null && test -f bin/install.js && test -f tests/multi-runtime-select.test.cjs && node -e 'const fs=require("fs");const pkg=JSON.parse(fs.readFileSync("package.json","utf8"));if(!pkg.engines||!pkg.engines.node){process.exit(1)}'` | imported upstream files exist | ⬜ pending |
| 02-01-02 | 01 | 1 | DIST-01 | T-02-01, T-02-03 | Hermes is wired into installer flag parsing, the real `hasAll`/`selectedRuntimes = [...]` flow, the interactive runtime picker, and the direct `--hermes --local` rejection path | source audit | `node -e 'const fs=require("fs");const s=fs.readFileSync("bin/install.js","utf8");const checks=[/hasHermes\\s*=\\s*args\\.includes\\([\"\\x27]--hermes[\"\\x27]\\)/,/const hasAll\\s*=\\s*args\\.includes\\([\"\\x27]--all[\"\\x27]\\)/,/if\\s*\\(hasAll\\)\\s*\\{[\\s\\S]{0,400}selectedRuntimes\\s*=\\s*\\[[\\s\\S]*?[\"\\x27]hermes[\"\\x27]/,/selectedRuntimes\\.push\\([\"\\x27]hermes[\"\\x27]\\)/,/runtimeMap[\\s\\S]{0,1200}[\"\\x27]hermes[\"\\x27]/,/if\\s*\\(\\s*hasHermes\\s*&&\\s*hasLocal\\s*\\)[\\s\\S]{0,400}(process\\.exit|throw new Error|return)/];if(checks.some(re=>!re.test(s))){process.exit(1)}'` | inline file read | ⬜ pending |
| 02-01-03 | 01 | 1 | DIST-01 | T-02-02 | Installer help and prompt copy describe Hermes truthfully, show `.hermes`, state Phase 2 global-only behavior, and avoid overclaiming project-linked support | source audit | `node -e 'const fs=require("fs");const s=fs.readFileSync("bin/install.js","utf8");const checks=[/--hermes/,/Hermes/,/\\.hermes/,/global mode|global-only|global only/,/external_dirs/,/local install is not supported|project-linked.*later|global only in Phase 2/];if(checks.some(re=>!re.test(s))){process.exit(1)}'` | inline file read | ⬜ pending |
| 02-02-01 | 02 | 2 | DIST-01 | T-02-04 | Hermes helper seams resolve `.hermes` consistently and keep install ownership global-first | source audit | `node -e 'const fs=require("fs");const s=fs.readFileSync("bin/install.js","utf8");const checks=[/getDirName[\\s\\S]{0,1600}hermes/,/getConfigDirFromHome[\\s\\S]{0,2000}[\"\\x27]\\.hermes[\"\\x27]/,/getGlobalDir[\\s\\S]{0,2400}path\\.join\\(os\\.homedir\\(\\),\\s*[\"\\x27]\\.hermes[\"\\x27]\\)/];if(checks.some(re=>!re.test(s))){process.exit(1)}'` | inline file read | ⬜ pending |
| 02-02-02 | 02 | 2 | DIST-01 | T-02-05, T-02-06 | Hermes install logic stays scoped to the global `~/.hermes/skills/` root, rejects interactive local mode, skips runtime-owned settings writes, preserves the accepted `resolve_model_ids` side effect, and reports `global mode` at finish | source audit | `node -e 'const fs=require("fs");const s=fs.readFileSync("bin/install.js","utf8");const checks=[/isHermes\\s*=\\s*runtime\\s*===\\s*[\"\\x27]hermes[\"\\x27]/,/runtime\\s*===\\s*[\"\\x27]hermes[\"\\x27]\\s*&&\\s*!isGlobal[\\s\\S]{0,500}(global only|global-only|external_dirs|not supported)/,/isHermes[\\s\\S]{0,1600}path\\.join\\([^\\n]*[\"\\x27]skills[\"\\x27]/,/!isCodex[\\s\\S]{0,220}!isHermes[\\s\\S]{0,220}writeSettings/,/if\\s*\\(\\s*runtime\\s*!==\\s*[\"\\x27]claude[\"\\x27]\\s*\\)[\\s\\S]{0,1200}resolve_model_ids/,/global mode/];if(checks.some(re=>!re.test(s))){process.exit(1)}'` | inline file read | ⬜ pending |
| 02-03-01 | 03 | 3 | DIST-01 | T-02-07 | Shared runtime tests fail if Hermes is removed from the installer selector, menu, or the real upstream `hasAll` behavior | automated test | `node --test tests/multi-runtime-select.test.cjs` | test file exists | ⬜ pending |
| 02-03-02 | 03 | 3 | DIST-01 | T-02-08, T-02-09 | Dedicated Hermes tests pin helper semantics, bounded global skills-root ownership, explicit rejection paths, accepted `resolve_model_ids` side effect, and install-mode output without claiming later-phase features | automated test | `node --test tests/hermes-install.test.cjs` | test file exists | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None. All 7 executable tasks already include concrete `<automated>` verification commands, and Plan `02-03` creates the Hermes-specific regression files needed for the final wave.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Installer copy does not overclaim unsupported Hermes modes | DIST-01 | Truthful wording around `external_dirs` and local-install boundaries is semantic, not purely structural | Read the Hermes help/prompt text in `bin/install.js` and confirm it says Hermes global install is supported now, direct local install is rejected in Phase 2, and project-linked bridge behavior remains later work |
| Finish output clearly states which Hermes mode was configured and the accepted shared side effect | DIST-01 | Human readability matters in the final installer summary | Run the installer flow in a disposable environment and confirm the completion message says `global mode`, shows the resolved Hermes path, and does not hide the accepted `~/.gsd/defaults.json` behavior from operator notes |
| Hermes path ownership stays inside approved seams | DIST-01 | A human check catches accidental spillover into lifecycle or command-discovery work | Review the execution diff and verify only upstream import artifacts plus `bin/install.js`, `tests/multi-runtime-select.test.cjs`, and `tests/hermes-install.test.cjs` changed for this phase |

---

## Validation Sign-Off

- [x] All 7 executable tasks have `<automated>` verify commands aligned with the current plans
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] No genuine Wave 0 prerequisites remain
- [x] No watch-mode or long-running commands are required
- [x] Feedback latency remains under 15 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-19

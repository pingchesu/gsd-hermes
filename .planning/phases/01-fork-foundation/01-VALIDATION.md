---
phase: 01
slug: fork-foundation
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-18
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Documentation and git-state audit only for this phase |
| **Config file** | none — task-level `rg` and git commands validate generated docs and remote state directly |
| **Quick run command** | `git remote -v && rg -n "upstream|Hermes|ownership|merge upstream/main|external_dirs" docs .planning AGENTS.md 2>/dev/null` |
| **Full suite command** | `git remote -v && rg -n "upstream|Hermes|ownership|merge upstream/main|external_dirs" docs .planning AGENTS.md AGENTS.md .planning/phases/01-fork-foundation/*.md` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run the exact task-level `<automated>` command from the verification map below
- **After every plan wave:** Run the full audit command across governance docs and phase artifacts
- **Before `$gsd-verify-work`:** All Phase 1 governance artifacts must exist and match the locked fork rules
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | Existence Check | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-----------------|--------|
| 01-01-01 | 01 | 1 | ARCH-01 | T-01-02 | The governance docs index links the three Phase 1 governance artifacts and states the documentation-only scope limits without implying Hermes runtime support | doc audit | `test -f docs/README.md && rg -n "## Phase 1 Governance Docs|\\[Fork Ownership\\]\\(fork-ownership\\.md\\)|\\[Upstream Sync Workflow\\]\\(upstream-sync\\.md\\)|\\[Hermes Compatibility and Guardrails\\]\\(hermes-compatibility\\.md\\)|documentation-first|does not implement Hermes runtime support|repo-wide restructuring" docs/README.md` | inline `test -f` | ⬜ pending |
| 01-01-02 | 01 | 1 | ARCH-01 | T-01-01, T-01-03 | The ownership map fixes the exact path rows and routing labels so maintainers can distinguish upstream base, Hermes adapter seam, and downstream governance changes | doc audit | `test -f docs/fork-ownership.md && rg -n "# Fork Ownership|## Path Ownership Matrix|\\.planning/|AGENTS\\.md|agents/|commands/|get-shit-done/|hooks/|sdk/|tests/|docs/|bin/install\\.js|upstream-owned|Hermes adapter seam|Downstream governance|out of scope" docs/fork-ownership.md` | inline `test -f` | ⬜ pending |
| 01-02-01 | 02 | 1 | ARCH-02 | T-01-04 | The repo exposes the required `upstream` remote at the exact `gsd-build/get-shit-done` URL while preserving `origin` | git audit | `git remote get-url upstream \| rg "^https://github.com/gsd-build/get-shit-done\\.git$" && git remote -v \| rg "^origin|^upstream"` | n/a | ⬜ pending |
| 01-02-02 | 02 | 1 | ARCH-02 | T-01-05, T-01-06 | The sync runbook documents first import, steady-state merge flow, and explicit non-goals including Node 22+ limits and no rebase/cherry-pick-only maintenance | doc audit | `test -f docs/upstream-sync.md && rg -n "# Upstream Sync Workflow|origin|upstream|git remote add upstream https://github.com/gsd-build/get-shit-done\\.git|git merge --allow-unrelated-histories upstream/main|git merge upstream/main|Patch Discipline|visible merge history|Node 22\\+ is not installed locally|rebase|cherry-pick-only" docs/upstream-sync.md` | inline `test -f` | ⬜ pending |
| 01-03-01 | 03 | 2 | ARCH-01, ARCH-02 | T-01-07 | The compatibility matrix and known-gaps inventory state current Hermes support truthfully using the approved status vocabulary | doc audit | `test -f docs/hermes-compatibility.md && rg -n "# Hermes Compatibility and Guardrails|## Compatibility Matrix|Global Hermes install|Project-linked external_dirs mode|Command discovery for /gsd-\\*|Native local Hermes install mode|not implemented|documented boundary|out of scope|known gap|Node 22\\+ is not installed locally" docs/hermes-compatibility.md` | inline `test -f` | ⬜ pending |
| 01-03-02 | 03 | 2 | ARCH-01, ARCH-02 | T-01-08, T-01-09 | The adapter guardrails and phase mapping keep future Hermes work in the adapter seam and tie it back to ownership and upstream merge review rules | doc audit | `rg -n "## Adapter Guardrails|Prefer adapter or shim changes over workflow rewrites|Do not claim a native local Hermes install mode|installer, runtime conversion, compatibility, documentation, and test layers|get-shit-done/workflows/|merge history from upstream/main|## Phase Mapping|Phase 2|Phase 3|Phase 4|Phase 5|Phase 6|Upstream base|Hermes adapter seam|Downstream governance" docs/hermes-compatibility.md` | covered by prior task file creation | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None. All 6 executable tasks in Plans `01-01`, `01-02`, and `01-03` already have concrete `<automated>` verification commands, so Phase 01 has no missing verification prerequisites.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Governance docs do not overstate Hermes support | ARCH-01, ARCH-02 | Wording accuracy cannot be fully inferred from grep alone | Read `docs/hermes-compatibility.md` and confirm unsupported surfaces are marked as not implemented yet |
| Sync runbook matches actual repo history state | ARCH-02 | First-import feasibility depends on current remotes and branch ancestry | Run `git remote -v`, inspect whether `upstream` exists, and confirm the runbook covers both first import and steady-state merge |
| Ownership boundary is easy for a maintainer to follow | ARCH-01 | Human readability and maintainability are qualitative | Read `docs/fork-ownership.md` and verify each surface is assigned to upstream, Hermes adapter, or downstream governance |

---

## Validation Sign-Off

- [x] All 6 executable tasks have `<automated>` verify commands aligned with the current plans
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] No genuine Wave 0 prerequisites remain
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-18

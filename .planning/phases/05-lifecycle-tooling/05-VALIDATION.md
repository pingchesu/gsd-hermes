---
phase: 05
slug: lifecycle-tooling
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-19
---

# Phase 05 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | node:test |
| **Config file** | package.json |
| **Quick run command** | `node --test tests/hermes-lifecycle.test.cjs` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node --test tests/hermes-lifecycle.test.cjs`
- **After every plan wave:** Run `node --test tests/hermes-install.test.cjs tests/hermes-project-linked.test.cjs tests/hermes-docs.test.cjs tests/hermes-lifecycle.test.cjs`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds for targeted lifecycle tests

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | DIST-02 | T-05-01 | Update preserves user modifications through manifest backup | integration | `node --test tests/hermes-lifecycle.test.cjs` | yes | pending |
| 05-01-02 | 01 | 1 | DIST-03 | T-05-02 | Uninstall removes only GSD-owned Hermes artifacts | integration | `node --test tests/hermes-lifecycle.test.cjs` | yes | pending |
| 05-02-01 | 02 | 2 | QUAL-01 | T-05-03 | Doctor reports stale/missing paths without mutating files | unit | `node --test tests/hermes-lifecycle.test.cjs` | yes | pending |
| 05-03-01 | 03 | 3 | QUAL-01 | T-05-04 | Lifecycle regressions cover global and project-linked modes | integration | `node --test tests/hermes-install.test.cjs tests/hermes-project-linked.test.cjs tests/hermes-docs.test.cjs tests/hermes-lifecycle.test.cjs` | yes | pending |
| 05-04-01 | 04 | 4 | DOCS-01 | T-05-05 | Docs state implemented lifecycle support without native-local claims | docs | `node --test tests/hermes-docs.test.cjs` | yes | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real Hermes command discovery after lifecycle operations | QUAL-01 | Hermes binary may not be installed in CI | If `hermes` is on PATH, run `hermes skills list` after install/update/uninstall and confirm expected command visibility. |

---

## Validation Sign-Off

- [x] All tasks have automated verify commands
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all missing references
- [x] No watch-mode flags
- [x] Feedback latency target defined
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-19


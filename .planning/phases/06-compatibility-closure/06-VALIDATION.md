---
phase: 06
slug: compatibility-closure
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-19
---

# Phase 06 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node `node:test` |
| **Config file** | `package.json` |
| **Quick run command** | `npm run test:hermes` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~2-8 seconds targeted, full suite varies |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:hermes`
- **After every plan wave:** Run `npm test`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 8 seconds for targeted Hermes validation

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | COMP-01 | T-06-01 | N/A | regression | `npm run test:hermes` | ✅ | ⬜ pending |
| 06-01-02 | 01 | 1 | COMP-01 | T-06-01 | N/A | regression | `node --test tests/hermes-compatibility-closure.test.cjs` | ✅ | ⬜ pending |
| 06-02-01 | 02 | 2 | COMP-02 | T-06-02 | N/A | docs regression | `npm run test:hermes` | ✅ | ⬜ pending |
| 06-02-02 | 02 | 2 | COMP-02 | T-06-02 | N/A | docs regression | `npm run test:hermes` | ✅ | ⬜ pending |
| 06-03-01 | 03 | 3 | COMP-01, COMP-02 | T-06-03 | N/A | docs regression | `npm run test:hermes` | ✅ | ⬜ pending |
| 06-03-02 | 03 | 3 | COMP-01, COMP-02 | T-06-03 | N/A | full regression | `npm test` | ✅ | ⬜ pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Optional real Hermes CLI smoke | COMP-01 | Hermes may not be installed in CI or contributor machines. | If `hermes` is on `PATH`, run `hermes skills list` and `hermes chat -q "/gsd-help"` after installing in a disposable temp/project environment. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 8s for targeted Hermes validation
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-19


---
phase: 5
slug: runtime-model-contract
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-22
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Node test scripts |
| **Config file** | `package.json`, `sdk/package.json` |
| **Quick run command** | `cd sdk && npm test -- config-query init helpers` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~180 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd sdk && npm test -- config-query init helpers`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 180 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | RMC-01 | — | Runtime capability contract covers explicit/inherit/runtime-default/cross-ai states | unit | `cd sdk && npm test -- config-query helpers` | ✅ | ⬜ pending |
| 05-01-02 | 01 | 1 | RMC-02 | — | Shared resolver emits structured binding semantics instead of ad hoc strings | unit | `cd sdk && npm test -- config-query init` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 2 | RMC-03 | — | Legacy CJS and SDK produce equivalent semantic outcomes for the same config matrix | integration | `npm test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Add structured resolver test fixtures covering override / inherit / runtime-default / unknown-agent semantics
- [ ] Add parity tests that compare SDK and legacy CJS outputs for the same config matrix
- [ ] Add init-level tests proving binding semantics survive into init payload generation

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Contract terminology is understandable to maintainers | RMC-01 | Naming and boundary clarity are reviewer-driven, not purely automated | Review the new runtime capability contract and confirm it clearly distinguishes runtime capability from binding resolution |
| Migration expectations match milestone intent | RMC-02, RMC-03 | Requires human judgment against prior docs and current user expectations | Read `docs/CONFIGURATION.md`, `docs/USER-GUIDE.md`, and the new contract comments to confirm `resolve_model_ids: "omit"` still reads as runtime-default binding |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 180s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

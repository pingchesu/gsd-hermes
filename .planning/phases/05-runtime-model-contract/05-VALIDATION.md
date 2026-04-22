---
phase: 5
slug: runtime-model-contract
status: ready
nyquist_compliant: true
wave_0_complete: true
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
| **Quick run command** | `cd sdk && npm test -- config-query helpers config-mutation init` |
| **Full suite command** | `npm test -- tests/runtime-model-parity.test.cjs tests/init.test.cjs tests/bug-2516-inherit-model-execute-phase.test.cjs tests/cross-ai-execution.test.cjs` |
| **Estimated runtime** | ~240 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd sdk && npm test -- config-query helpers config-mutation init`
- **After every plan wave:** Run `npm test -- tests/runtime-model-parity.test.cjs tests/init.test.cjs tests/bug-2516-inherit-model-execute-phase.test.cjs tests/cross-ai-execution.test.cjs`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 240 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | RMC-01 | — | Runtime capability contract covers explicit/inherit/runtime-default/cross-ai states | unit | `cd sdk && npm test -- config-query helpers` | ✅ source files / ❌ new contract artifacts until execution | ⬜ pending |
| 05-01-02 | 01 | 1 | RMC-02 | — | SDK config and init surfaces preserve structured binding semantics and recognize cross-AI config keys without Phase 7 routing | unit | `cd sdk && npm test -- config-mutation init config-query` | ✅ source files / ❌ modified outputs until execution | ⬜ pending |
| 05-01-03 | 01 | 1 | RMC-01, RMC-02 | — | Adaptive vs inherit policy is explicit, migration-safe, and covered by tests | unit | `cd sdk && npm test -- config-query init` | ❌ policy artifacts until execution | ⬜ pending |
| 05-02-01 | 02 | 2 | RMC-03 | — | Legacy CJS consumes the canonical SDK resolver path or a generated/shared adapter derived from it instead of duplicating branching logic | integration | `npm test -- tests/runtime-model-parity.test.cjs tests/init.test.cjs` | ❌ parity artifacts until execution | ⬜ pending |
| 05-02-02 | 02 | 2 | RMC-03 | — | Root-level parity/regression coverage protects inherit omission, runtime-default migration safety, and cross-AI contract recognition | integration | `npm test -- tests/runtime-model-parity.test.cjs tests/bug-2516-inherit-model-execute-phase.test.cjs tests/cross-ai-execution.test.cjs` | ❌ regression additions until execution | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Add structured resolver test fixtures covering override / inherit / runtime-default / unknown-agent semantics
- [x] Add parity tests that compare SDK and legacy CJS outputs for the same config matrix
- [x] Add init-level tests proving binding semantics survive into init payload generation

*Wave 0 for this phase is planning-complete because the required verification scaffolding is now defined for every planned task. Execution will turn the commands green.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Contract terminology is understandable to maintainers | RMC-01 | Naming and boundary clarity are reviewer-driven, not purely automated | Review the new runtime capability contract and confirm it clearly distinguishes runtime capability from binding resolution |
| Migration expectations match milestone intent | RMC-02, RMC-03 | Requires human judgment against prior docs and current user expectations | Read `docs/CONFIGURATION.md`, `docs/USER-GUIDE.md`, and the new contract comments to confirm `resolve_model_ids: "omit"` still reads as runtime-default binding |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 240s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved for planning 2026-04-22

---
phase: 10
slug: runtime-binding-receipt-surface
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-25
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for runtime binding receipt observability.

---

## Test Infrastructure

**Node engine note:** `package.json` and `sdk/package.json` declare `node >=22.0.0`. Before executing this phase, run `node --version`; if the local shell is below 22, record the engine mismatch in SUMMARY and use the project-approved Node 22 toolchain before treating test failures as product failures.

| Property | Value |
|----------|-------|
| **Framework** | node:test + vitest |
| **Config file** | `package.json`, `sdk/package.json`, `sdk/tsconfig.json` |
| **Quick run command** | `npm run build:sdk && node --test tests/runtime-model-parity.test.cjs tests/init.test.cjs` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | focused: ~30-90s; full: project-dependent |

---

## Sampling Rate

- **After every task commit:** Run the task's focused automated command.
- **After every plan wave:** Run `npm run build:sdk && node --test tests/runtime-model-parity.test.cjs tests/init.test.cjs`.
- **Before `/gsd-verify-work`:** Run `npm test` or record exact unrelated blockers if full suite fails.
- **Max feedback latency:** one task.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | RCPT-04 | credential-leak / false-proof | Receipt helper separates resolver truth from runtime proof without secrets | unit | `npm run build:sdk && (cd sdk && npx vitest run src/query/config-query.test.ts)` | ✅ | ⬜ pending |
| 10-01-02 | 01 | 1 | RCPT-04 | semantic-drift | SDK receipt projection is additive and does not alter flat token projection | unit | `npm run build:sdk && (cd sdk && npx vitest run src/query/config-query.test.ts)` | ✅ | ⬜ pending |
| 10-01-03 | 01 | 1 | RCPT-04 | sdk-cjs-drift | CJS receipt projection mirrors SDK receipt semantics | parity | `npm run build:sdk && node --test tests/runtime-model-parity.test.cjs` | ✅ | ⬜ pending |
| 10-02-01 | 02 | 2 | RCPT-01 | missing-plan-receipts | plan init has researcher/planner/checker receipts | unit | `npm run build:sdk && (cd sdk && npx vitest run src/query/init.test.ts)` | ✅ | ⬜ pending |
| 10-02-02 | 02 | 2 | RCPT-02 | missing-execute-receipts | execute init has executor/verifier receipts | unit | `npm run build:sdk && (cd sdk && npx vitest run src/query/init.test.ts)` | ✅ | ⬜ pending |
| 10-02-03 | 02 | 2 | RCPT-01/02 | sdk-cjs-init-drift | SDK and legacy CJS init outputs remain aligned | golden | `npm run build:sdk && (cd sdk && npx vitest run src/golden/golden.integration.test.ts)` | ✅ | ⬜ pending |
| 10-03-01 | 03 | 3 | RCPT-03 | invisible-receipts | plan/execute workflows instruct visible receipt display | doc guard | `node --test tests/runtime-model-parity.test.cjs` | ✅ | ⬜ pending |
| 10-03-02 | 03 | 3 | RCPT-04 | false-runtime-proof | docs explain runtime_enforced=unknown is not proof | doc guard | `grep -q 'runtime_enforced' docs/hermes-compatibility.md` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new framework installation is required.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Transcript wording is concise and not misleading | RCPT-03/RCPT-04 | Workflow transcript readability is partly qualitative | Run `gsd-sdk query init.plan-phase 10`; inspect workflow display instructions and ensure they would show configured/resolved/source/binding/passed/runtime proof fields without claiming enforcement |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < one task
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** draft 2026-04-25

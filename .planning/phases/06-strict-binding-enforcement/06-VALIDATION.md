---
phase: 6
slug: strict-binding-enforcement
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-22
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for fail-fast runtime-model enforcement before planning and execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Node test scripts |
| **Config file** | `package.json`, `sdk/package.json` |
| **Quick run command** | `cd sdk && npm test -- config-query init phase-runner` |
| **Full suite command** | `npm test -- tests/bug-1829-inherit-model-profile.test.cjs tests/cross-ai-execution.test.cjs` |
| **Estimated runtime** | ~240 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd sdk && npm test -- config-query init phase-runner`
- **After every plan wave:** Run `npm test -- tests/bug-1829-inherit-model-profile.test.cjs tests/cross-ai-execution.test.cjs`
- **Before `/gsd-verify-work`:** Relevant targeted suites must be green
- **Max feedback latency:** 240 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | SBV-01, SBV-02 | — | plan/execute entry points fail fast for explicit unsupported and profile-derived unsupported bindings | unit | `cd sdk && npm test -- config-query init` | ❌ pending implementation | ⬜ pending |
| 06-01-02 | 01 | 1 | SBV-03 | — | structured error output includes agent/runtime/model/reason/fix/cross-ai alternative | unit | `cd sdk && npm test -- config-query` | ❌ pending implementation | ⬜ pending |
| 06-02-01 | 02 | 2 | SBV-04 | — | phase-runner enforces a second execution-time guard without deep session-runner rewrite | integration | `cd sdk && npm test -- phase-runner` | ❌ pending implementation | ⬜ pending |
| 06-02-02 | 02 | 2 | SBV-01, SBV-02, SBV-03 | — | legacy compatible configs keep working unless they explicitly request unsupported bindings | regression | `npm test -- tests/bug-1829-inherit-model-profile.test.cjs tests/cross-ai-execution.test.cjs` | ❌ pending implementation | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Define which entry points are allowed to fail fast in this phase (`plan-phase`, `execute-phase`, `phase-runner`)
- [x] Define the structured error fields required for operator-facing diagnostics
- [x] Define compatibility guardrails for `resolve_model_ids: "omit"` and legacy non-explicit configs

*Wave 0 for this phase is planning-complete because the required verification scaffolding is defined. Execution will turn commands green.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Error text is actionable for operators | SBV-03 | Human judgment needed for readability and remediation quality | Trigger a representative unsupported binding path and verify the message includes agent, runtime, model, failure reason, suggested fix, and cross-AI alternative guidance |
| Compatibility policy matches milestone intent | SBV-04 | Requires comparing runtime behavior against agreed migration policy | Review fail-fast behavior with a legacy `resolve_model_ids: "omit"` configuration and confirm it does not block when no explicit unsupported model is requested |

---

## Validation Sign-Off

- [x] All planned tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 240s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved for planning 2026-04-22

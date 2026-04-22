---
phase: 8
slug: workflow-integration-and-migration-safety
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-23
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for broad runtime-model semantic rollout, documentation alignment, and migration-safe operator visibility.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Node test scripts |
| **Config file** | `package.json`, `sdk/package.json` |
| **Quick run command** | `cd sdk && npx vitest run src/query/config-query.test.ts src/query/init.test.ts src/query/config-mutation.test.ts` |
| **Full targeted suite** | `cd /home/whiskey/workspace/project/central/v2/gsd-hermes && node --test tests/runtime-model-parity.test.cjs tests/cross-ai-execution.test.cjs tests/bug-1829-inherit-model-profile.test.cjs tests/bug-2506-settings-profile-nonclaude-warning.test.cjs tests/config-schema-docs-parity.test.cjs tests/verify-health.test.cjs && cd sdk && npx vitest run src/query/config-query.test.ts src/query/init.test.ts src/query/config-mutation.test.ts` |
| **Broader milestone gates** | `npm run test:hermes` and `npm test` |
| **Estimated runtime** | ~360 seconds targeted, longer for full repo gates |

---

## Sampling Rate

- **After every task commit:** Run the smallest targeted suite that covers touched files
- **After every plan wave:** Run the full targeted suite above
- **Before phase closeout:** `npm run test:hermes` must pass; `npm test` when feasible
- **Max feedback latency:** 360 seconds for targeted feedback

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | WDI-01, WDI-02 | — | init/query payloads expose additive structured runtime-model visibility without breaking existing token fields | unit | `cd sdk && npx vitest run src/query/init.test.ts src/query/config-query.test.ts` | ❌ pending implementation | ⬜ pending |
| 08-01-02 | 01 | 1 | WDI-01, D-10/D-11 context decisions | — | progress/settings surfaces display runtime/model/cross-AI state consistently and operator-usefully | regression | `cd /home/whiskey/workspace/project/central/v2/gsd-hermes && node --test tests/bug-2506-settings-profile-nonclaude-warning.test.cjs tests/config-schema-docs-parity.test.cjs && grep -q "runtime/model/cross-AI" get-shit-done/workflows/progress.md && grep -q "direct binding" get-shit-done/workflows/settings.md` | ❌ pending implementation | ⬜ pending |
| 08-02-01 | 02 | 2 | WDI-02, WDI-03 | — | plan/quick/verify/execute workflows and docs reflect the same four-path semantic model | regression | `cd /home/whiskey/workspace/project/central/v2/gsd-hermes && node --test tests/runtime-model-parity.test.cjs tests/cross-ai-execution.test.cjs && grep -q "four runtime-model paths" get-shit-done/workflows/plan-phase.md && grep -q "four runtime-model paths" get-shit-done/workflows/quick.md && grep -q "four runtime-model paths" get-shit-done/workflows/verify-work.md && grep -q "direct runtime support" get-shit-done/workflows/execute-phase.md` | ❌ pending implementation | ⬜ pending |
| 08-02-02 | 02 | 2 | MIG-01, MIG-02, MIG-03 | — | fail-fast remains intact, valid legacy omit/inherit configs still work, and migration guidance is visible without auto-rewrites | regression / docs | `cd /home/whiskey/workspace/project/central/v2/gsd-hermes && node --test tests/bug-1829-inherit-model-profile.test.cjs tests/verify-health.test.cjs tests/config-schema-docs-parity.test.cjs && grep -q "do not auto-rewrite" docs/USER-GUIDE.md && grep -q "cross_ai_execution" docs/ko-KR/USER-GUIDE.md && grep -q "resolve_model_ids" docs/ja-JP/USER-GUIDE.md && grep -q "cross_ai_execution" docs/ko-KR/CONFIGURATION.md` | ❌ pending implementation | ⬜ pending |


*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Rollout scope locked to broad alignment across workflows, docs, and tests
- [x] Migration policy locked to fail-fast + warning/guidance, with no automatic config rewriting
- [x] Documentation strategy locked to broad alignment with a canonical hierarchy to reduce future drift
- [x] Visibility strategy locked to high runtime/model/cross-AI observability on key user-facing surfaces

*Wave 0 for this phase is planning-complete because the rollout/migration/docs/visibility strategy is now explicit. Execution should turn the pending rows green.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Runtime/model visibility is understandable rather than noisy | WDI-01 / D-12 | Human judgment needed for operator usefulness | Inspect progress/settings/init-facing surfaces and verify they expose meaningful runtime-model state without dumping raw internals indiscriminately |
| Migration guidance is actionable without being intrusive | MIG-02 / MIG-03 | Human review needed for wording and upgrade ergonomics | Trigger representative invalid binding scenarios and confirm the guidance points users toward direct binding / inherit / omit / cross-AI choices without auto-changing config |
| Documentation hierarchy actually reduces drift risk | WDI-03 | Requires human review across multiple docs | Confirm `docs/CONFIGURATION.md` acts as canonical truth and that adjacent docs reference or summarize it without reintroducing conflicting tables |

---

## Validation Sign-Off

- [x] All planned tasks have automated verify or explicit Wave 0 justification
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers rollout, migration, docs, and visibility strategy
- [x] No watch-mode flags
- [x] Feedback latency < 360s for targeted checks
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved for planning 2026-04-23

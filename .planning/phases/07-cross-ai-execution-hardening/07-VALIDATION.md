---
phase: 7
slug: cross-ai-execution-hardening
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-23
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for explicit cross-AI execution hardening, while preserving Hermes-native mixed-provider binding as the preferred direct path when supported.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest + Node test scripts |
| **Config file** | `package.json`, `sdk/package.json` |
| **Quick run command** | `cd sdk && npx vitest run src/query/config-query.test.ts src/query/init.test.ts` |
| **Full suite command** | `cd sdk && npm run build && npx vitest run src/query/helpers.test.ts src/query/config-query.test.ts src/query/init.test.ts && cd .. && node --test tests/cross-ai-execution.test.cjs` |
| **Estimated runtime** | ~300 seconds |

---

## Sampling Rate

- **After every task commit:** Run the targeted suite for touched files
- **After every plan wave:** Run the full suite command above
- **Before `/gsd-verify-work`:** All Phase 7 targeted suites must be green
- **Max feedback latency:** 300 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | XAI-02, XAI-03 | — | routing precedence is deterministic and explicit (`CLI > config > frontmatter`) | unit | `cd sdk && npx vitest run src/query/config-query.test.ts` | ❌ pending implementation | ⬜ pending |
| 07-01-02 | 01 | 1 | XAI-03, XAI-04 | — | required cross-AI config and minimum result contract are validated before success is claimed | unit / regression | `node --test tests/cross-ai-execution.test.cjs` | ❌ pending implementation | ⬜ pending |
| 07-02-01 | 02 | 2 | XAI-02, XAI-03 | — | execute-phase uses the hardened routing contract without silently bypassing normal execution semantics | workflow regression | `node --test tests/cross-ai-execution.test.cjs` | ❌ pending implementation | ⬜ pending |
| 07-02-02 | 02 | 2 | XAI-04, WDI-03 | — | malformed external output, timeout, and partial execution produce actionable failure handling and docs alignment | regression / docs review | `cd sdk && npm run build && cd .. && node --test tests/cross-ai-execution.test.cjs` | ❌ pending implementation | ⬜ pending |
| 07-02-03 | 02 | 2 | MIG-01 (guardrail), SBV-04 continuity | — | Hermes-native mixed-provider direct bindings keep working and do not require cross-AI | regression | `cd sdk && npx vitest run src/query/init.test.ts src/query/config-query.test.ts` | ✅ already green | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Phase 7 scope narrowed so Hermes-native mixed-provider binding remains a direct runtime path, not a forced external delegation path
- [x] Routing precedence locked: CLI flags win, config next, plan frontmatter lower priority
- [x] Minimum external result contract locked: completion summary, changed files/areas, verification results, and failure/deviation section when applicable
- [x] Recovery policy locked: timeout, non-zero exit, malformed output, and partial execution must not silently succeed

*Wave 0 for this phase is planning-complete because the routing and validation scaffolding is now explicit. Execution should turn the pending rows green.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| External summary contract is actually operator-readable | XAI-04 | Human judgment needed for “meaningful summary” quality | Run a representative cross-AI execution and verify the accepted SUMMARY contains a clear completion statement, what changed, verification results, and deviations/failures if present |
| Recovery behavior is conservative and understandable | XAI-03 | Human review needed for abort/retry/fallback ergonomics | Simulate non-zero exit and malformed output; confirm the surfaced guidance clearly differentiates retry, skip-to-normal-execution, and abort |
| Hermes path remains the preferred direct path when supported | MIG-01 guardrail | Requires comparing direct-vs-cross-AI operator experience | Confirm a valid Hermes mixed-provider config executes without requiring `cross_ai_execution` to be enabled |

---

## Validation Sign-Off

- [x] All planned tasks have automated verify or explicit Wave 0 justification
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers routing, contract, and recovery semantics
- [x] No watch-mode flags
- [x] Feedback latency < 300s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved for planning 2026-04-23

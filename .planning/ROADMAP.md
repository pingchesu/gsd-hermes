# Roadmap: GSD Hermes v1.4 Hermes Runtime Model Binding Receipts

## Current Milestone: v1.4 Hermes Runtime Model Binding Receipts

**Status:** Active

**Milestone:** v1.4 Hermes Runtime Model Binding Receipts
**Created:** 2026-04-25
**Downstream package line:** `gsd-hermes@1.4.0`

**Phase numbering:** Phases continue from v1.3 (which used Phase 6 through Phase 9 plus urgent Phase 09.1). v1.4 phases start at **Phase 10**.

## Phases

- [x] **Phase 10: Runtime Binding Receipt Surface** — Extend SDK init payloads and Hermes-visible workflow output so users can see per-agent model binding receipts before any GSD subagent is spawned.
- [x] **Phase 11: Hermes Per-Agent Binding Channel** — Implement or prove the runtime channel that carries GSD per-agent model overrides into Hermes child agents; if the channel cannot enforce a binding, stop before spawn.
- [x] **Phase 12: Fail-Fast Validation and Proof Tests** — Add invalid-model, child-construction, receipt, and provider-request diagnostics tests proving explicit overrides cannot silently fall back.
- [ ] **Phase 13: Tracker, Documentation, Release** — Open/maintain tracker issue, update docs and release notes, run CI/PR flow, and publish `gsd-hermes@1.4.0` after validation.

## Phase Details

### Phase 10: Runtime Binding Receipt Surface

**Goal:** Make model binding intent visible at GSD entry points before spawning agents, with structured metadata that separates resolver truth from runtime enforcement proof.

**Depends on:** Nothing (first phase of milestone)

**Requirements:** RCPT-01, RCPT-02, RCPT-03, RCPT-04

**Success Criteria** (what must be TRUE):
  1. `gsd-sdk query init.plan-phase <phase>` returns a structured receipt for `gsd-phase-researcher`, `gsd-planner`, and `gsd-plan-checker`, including configured model, resolved model, source, binding kind, runtime, provider/family, and enforceability fields.
  2. `gsd-sdk query init.execute-phase <phase>` returns the same receipt shape for `gsd-executor` and `gsd-verifier`.
  3. Hermes-visible `/gsd-plan-phase` and `/gsd-execute-phase` transcript output prints a concise pre-spawn receipt table and does not require users to manually inspect JSON.
  4. Receipt labels explicitly distinguish `resolved_by_gsd`, `passed_to_runtime`, and `runtime_enforced`; fields default to conservative/unknown values rather than claiming proof that does not exist.

**Plans:** 3/3 plans executed

Plans:
**Wave 1**
- [x] 10-01-PLAN.md — Create the shared model-binding receipt projection used by Phase 10 init surfaces without changing legacy flat model-token behavior.

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 10-02-PLAN.md — Add structured binding receipt payloads to `init.plan-phase` and `init.execute-phase` while preserving existing flat model fields and SDK/CJS golden parity.

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 10-03-PLAN.md — Surface binding receipts in `/gsd-plan-phase` and `/gsd-execute-phase` transcript instructions so users see model intent and runtime proof status before subagents spawn.

### Phase 11: Hermes Per-Agent Binding Channel

**Goal:** Ensure GSD explicit per-agent model overrides reach Hermes child agents through a real binding path, or fail before spawn when Hermes cannot enforce the override.

**Depends on:** Phase 10

**Requirements:** BIND-01, BIND-02, BIND-03, BIND-04

**Success Criteria** (what must be TRUE):
  1. Code identifies and documents the authoritative Hermes binding path for per-agent model selection (`delegate_task` model field, ACP `--model`, generated config, or another explicit mechanism).
  2. A GSD-originated explicit override constructs the Hermes child `AIAgent` with the expected model instead of inheriting `parent_agent.model` when `delegation.model` is unset.
  3. Batch/multi-agent workflows can assign different configured models to different agents where the runtime supports it.
  4. If no enforceable channel exists for a path, GSD emits a clear pre-spawn validation error that names the agent, configured model, runtime, and suggested fix.

**Plans:** 3/3 plans executed

Plans:
**Wave 1**
- [x] 11-01-PLAN.md — Trace Hermes delegation entry points and choose the smallest upstream-syncable binding seam.

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 11-02-PLAN.md — Implement binding propagation for single and batch subagent spawns, preserving existing inheritance behavior when no explicit override is configured.

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 11-03-PLAN.md — Add pre-spawn unsupported-path errors and update runtime capability semantics so Hermes does not overclaim enforcement.

### Phase 12: Fail-Fast Validation and Proof Tests

**Goal:** Prove no silent fallback remains by combining SDK validation, Hermes child construction assertions, invalid-model smoke tests, and redacted provider-request diagnostics.

**Depends on:** Phase 11

**Requirements:** ENF-01, ENF-02, ENF-03, TEST-01, TEST-02, TEST-03, TEST-04

**Success Criteria** (what must be TRUE):
  1. An explicit invalid model override cannot complete successfully by inheriting the parent/default Hermes model.
  2. Unit/integration tests prove the child `AIAgent.model` equals the configured per-agent override for at least planner and executor paths.
  3. Provider-request diagnostics can expose the request model and subagent id while redacting credentials and avoiding API key/token leakage.
  4. `workflow.cross_ai_execution` stays explicit and observable; no automatic or silent cross-runtime fallback is introduced.
  5. Full relevant test gates pass (`npm run test:hermes`, runtime-model parity tests, and any new Hermes binding tests).

**Plans:** 4/4 plans executed

Plans:
- [x] 12-01-PLAN.md — Add SDK validation tests for enforceability errors and receipt metadata across override/inherit/runtime-default cases.
- [x] 12-02-PLAN.md — Add Hermes child-construction test proving expected child model/provider for GSD-originated override.
- [x] 12-03-PLAN.md — Add invalid-model no-silent-fallback smoke test and provider-request diagnostic coverage with credential redaction.
- [x] 12-04-PLAN.md — Run full regression gates and close any discovered compatibility drift.

### Phase 13: Tracker, Documentation, Release

**Goal:** Make the fix reviewable and shippable: tracker issue captures root cause/acceptance criteria, docs teach users how to verify model binding, and `gsd-hermes@1.4.0` ships with release evidence.

**Depends on:** Phase 12

**Requirements:** REL-01, REL-02, REL-03, REL-04

**Success Criteria** (what must be TRUE):
  1. A GitHub issue or PR tracker documents root cause, static evidence (`delegate_task` lacks per-call model), runtime evidence, acceptance criteria, and validation commands.
  2. README, COMMANDS.md, CONFIGURATION.md, and release notes explain how Hermes per-agent model overrides are resolved, passed, enforced, and diagnosed.
  3. A PR against `main` contains the implementation, tests, docs, and explicit validation evidence; CI passes before merge.
  4. The next publishable v1.4 patch release is published to npm and a matching GitHub Release exists with release notes and verification evidence. Discovery on 2026-04-26 found `gsd-hermes@1.4.0` and GitHub Release `v1.4.0` already exist, so execution should default to `1.4.1` unless the maintainer chooses a different semver.

**Plans:** 3/3 plans created; 0/3 plans executed

Plans:
- [ ] 13-01-PLAN.md — Open/update GitHub tracker issue and prepare PR body acceptance checklist.
- [ ] 13-02-PLAN.md — Update README, COMMANDS.md, CONFIGURATION.md, CHANGELOG/release notes, and publishable version metadata for strict Hermes model binding semantics.
- [ ] 13-03-PLAN.md — Execute PR/CI/release flow and publish the next v1.4 patch release after validation.

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 10. Runtime Binding Receipt Surface | 3/3 | Complete | 2026-04-26 |
| 11. Hermes Per-Agent Binding Channel | 3/3 | Complete | 2026-04-26 |
| 12. Fail-Fast Validation and Proof Tests | 4/4 | Complete | 2026-04-26 |
| 13. Tracker, Documentation, Release | 0/3 | Planned | - |

## Validation Matrix

| Gate | Required | Command / Evidence |
|------|----------|--------------------|
| Resolver override still works | Yes | `gsd-sdk query resolve-model gsd-planner` shows `source=override`, `binding=explicit` |
| Init receipts emitted | Yes | `gsd-sdk query init.plan-phase <phase>` and `init.execute-phase <phase>` include binding metadata |
| Workflow receipt visible | Yes | Hermes `/gsd-plan-phase` / `/gsd-execute-phase` transcript shows receipt before spawn |
| Child model proof | Yes | Hermes test/log proves child `AIAgent.model` equals expected override |
| Invalid model no-silent-fallback | Yes | Invalid explicit override fails before/at provider request instead of succeeding with parent/default model |
| Credential redaction | Yes | Diagnostics never print API keys, tokens, passwords, or connection strings |
| Runtime-model parity | Yes | Existing parity tests remain green |
| Hermes compatibility | Yes | `npm run test:hermes` passes |
| Documentation | Yes | README, COMMANDS.md, CONFIGURATION.md, release notes updated |
| Release | Yes | next publishable v1.4 patch release (default `gsd-hermes@1.4.1`) + matching GitHub Release |

## Next Action

Proceed to Phase 13 execution via `/gsd-execute-phase 13`.

---
*Roadmap created: 2026-04-25*

# Requirements: GSD Hermes v1.4 Hermes Runtime Model Binding Receipts

**Defined:** 2026-04-25
**Core Value:** A user running Hermes Agent can `npx gsd-hermes --hermes --global` and immediately use the standard GSD workflow with Hermes-native runtime/model semantics, while the fork tracks closely behind upstream GSD.

**Milestone scope summary:** Fix the gap where GSD resolver and workflow surfaces can show explicit per-agent `model_overrides`, but Hermes spawned subagents may still inherit the parent/default model because the current Hermes `delegate_task` interface has no per-call `model` binding. This milestone makes model binding receipts visible, adds or proves a real Hermes binding channel, and fails fast whenever explicit overrides cannot be enforced.

## v1.4 Requirements

### Binding Receipts

- [ ] **RCPT-01**: User can run `gsd-sdk query init.plan-phase <phase>` and see structured binding metadata for researcher, planner, and checker agents: agent, configured model, resolved model, source, binding kind, runtime, provider/family, and enforceability status.
- [ ] **RCPT-02**: User can run `gsd-sdk query init.execute-phase <phase>` and see structured binding metadata for executor and verifier agents with the same fields as plan-phase.
- [ ] **RCPT-03**: User running `/gsd-plan-phase` or `/gsd-execute-phase` in Hermes sees a concise binding receipt before subagents spawn, so the effective runtime/model intent is visible in the transcript.
- [ ] **RCPT-04**: Receipt output clearly distinguishes resolver truth from runtime proof: `resolved_by_gsd`, `passed_to_runtime`, and `runtime_enforced` must not be conflated.

### Hermes Binding Channel

- [ ] **BIND-01**: Maintainer can identify the exact Hermes runtime channel used to set child agent model (`delegate_task model`, ACP `--model`, generated config, or another explicit path) and document it in code comments/tests.
- [ ] **BIND-02**: When a GSD workflow specifies an explicit per-agent model override, the Hermes child `AIAgent` is constructed with that model rather than inheriting the parent model by default.
- [ ] **BIND-03**: Batch subagent spawning preserves per-task model bindings; different agents in the same workflow can use different configured models where the runtime supports it.
- [ ] **BIND-04**: If Hermes cannot support per-agent explicit model binding for a workflow path, GSD reports that limitation before spawning and points to the config/runtime setting that must change.

### Fail-Fast Enforcement

- [ ] **ENF-01**: Explicit `model_overrides` that are unsupported, unknown to the runtime, or not enforceable by Hermes cause a clear actionable error before any subagent begins work.
- [ ] **ENF-02**: An intentionally invalid override such as `definitely-not-a-real-model-gsd-binding-test` cannot complete successfully by falling back to the parent/default Hermes model.
- [ ] **ENF-03**: `workflow.cross_ai_execution` remains an explicit alternative path, but GSD never silently routes or falls back without reporting the effective execution mode.

### Regression Tests and Diagnostics

- [ ] **TEST-01**: SDK tests assert `init.plan-phase` and `init.execute-phase` include binding receipt metadata for override, inherit, and runtime-default cases.
- [ ] **TEST-02**: Hermes integration/unit tests prove the child agent receives the expected model from a GSD-originated explicit override.
- [ ] **TEST-03**: A no-silent-fallback test proves invalid explicit model names fail before or at provider request time instead of succeeding with the parent/default model.
- [ ] **TEST-04**: Development diagnostics can expose provider request `model` metadata without leaking API keys, tokens, credentials, or connection strings.

### Release and Tracking

- [ ] **REL-01**: A GitHub tracker issue exists for the v1.4 root cause and acceptance criteria: Hermes `/gsd` commands must emit and enforce per-agent model binding receipts.
- [ ] **REL-02**: Documentation explains how users can verify resolver output, workflow receipt output, Hermes child construction, and provider request model metadata.
- [ ] **REL-03**: `README.md`, `COMMANDS.md`, `CONFIGURATION.md`, and release notes describe strict per-agent model binding semantics for Hermes.
- [ ] **REL-04**: `gsd-hermes@1.4.0` is released after tests and CI pass, with GitHub Release and npm publish evidence recorded.

## Future Requirements

### Runtime Proof UI

- **UI-01**: Hermes `/agents` or equivalent runtime UI can show each live subagent's provider/model/source while it is running.
- **UI-02**: Runtime receipts can be exported as structured audit artifacts for long-running GSD workflows.

### Multi-Runtime Model Binding

- **MRT-01**: Apply the same runtime proof pattern to other non-Claude runtimes where workflow-level `Task(model=...)` semantics may not map cleanly to the host runtime.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Rewriting GSD workflows to be Hermes-native only | Fork must remain GSD-first and upstream-syncable; prefer adapter/seam changes over broad workflow rewrites |
| Assuming resolver success proves runtime enforcement | This milestone exists because resolver truth and runtime truth are different layers |
| Silent fallback from explicit override to parent/default model | Violates strict model binding semantics and hides expensive/wrong-model execution |
| Storing or printing credentials in diagnostics | Diagnostics must redact API keys, tokens, passwords, and connection strings |
| Upstream sync unrelated to this binding issue | Keep v1.4 focused on runtime truthfulness; upstream sync resumes in a separate milestone if needed |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| RCPT-01 | Phase 10 | Pending |
| RCPT-02 | Phase 10 | Pending |
| RCPT-03 | Phase 10 | Pending |
| RCPT-04 | Phase 10 | Pending |
| BIND-01 | Phase 11 | Pending |
| BIND-02 | Phase 11 | Pending |
| BIND-03 | Phase 11 | Pending |
| BIND-04 | Phase 11 | Pending |
| ENF-01 | Phase 12 | Pending |
| ENF-02 | Phase 12 | Pending |
| ENF-03 | Phase 12 | Pending |
| TEST-01 | Phase 12 | Pending |
| TEST-02 | Phase 12 | Pending |
| TEST-03 | Phase 12 | Pending |
| TEST-04 | Phase 12 | Pending |
| REL-01 | Phase 13 | Pending |
| REL-02 | Phase 13 | Pending |
| REL-03 | Phase 13 | Pending |
| REL-04 | Phase 13 | Pending |

**Coverage:**
- v1.4 requirements: 19 total
- Mapped to phases: 19 (100%)
- Unmapped: 0 ✓

### Phase Coverage Distribution

| Phase | Count | Requirements |
|-------|-------|--------------|
| Phase 10 — Runtime Binding Receipt Surface | 4 | RCPT-01, RCPT-02, RCPT-03, RCPT-04 |
| Phase 11 — Hermes Per-Agent Binding Channel | 4 | BIND-01, BIND-02, BIND-03, BIND-04 |
| Phase 12 — Fail-Fast Validation and Proof Tests | 7 | ENF-01, ENF-02, ENF-03, TEST-01, TEST-02, TEST-03, TEST-04 |
| Phase 13 — Tracker, Documentation, Release | 4 | REL-01, REL-02, REL-03, REL-04 |

---
*Requirements defined: 2026-04-25*
*Last updated: 2026-04-25 after roadmap phase mapping (v1.4)*

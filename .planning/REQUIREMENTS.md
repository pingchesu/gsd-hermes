# Requirements: GSD Hermes v1.2 Cross-Provider Agent Execution

**Defined:** 2026-04-22
**Core Value:** Users can install `gsd-hermes` with npm and use the standard GSD workflow inside Hermes Agent without losing upstream GSD behavior or falling behind upstream.

## v1.2 Requirements

### Runtime Model Contract

- [ ] **RMC-01**: Maintainer can define a single canonical runtime capability contract that describes whether each supported runtime can use explicit model binding, `inherit`, runtime-default binding, and `cross_ai_execution`.
- [ ] **RMC-02**: GSD can resolve each agent's effective execution binding from `model_overrides`, `model_profile`, `inherit`, and `resolve_model_ids` using one shared resolution path.
- [ ] **RMC-03**: SDK and legacy CJS paths return equivalent runtime-model resolution outcomes for the same config inputs.

### Strict Binding Validation

- [ ] **SBV-01**: User gets a fail-fast error before agent execution when an explicit configured model is not supported by the active runtime.
- [ ] **SBV-02**: User gets a fail-fast error before agent execution when a profile-derived resolved model is not supported by the active runtime.
- [ ] **SBV-03**: Fail-fast errors name the agent, runtime, configured or resolved model, rejection reason, and suggested fix.
- [ ] **SBV-04**: GSD preserves the semantic difference between explicit model binding, inherited model binding, and runtime-default binding during validation and execution.

### Cross-AI Execution

- [ ] **XAI-01**: Maintainer can configure `workflow.cross_ai_execution`, `workflow.cross_ai_command`, and `workflow.cross_ai_timeout` through supported config surfaces.
- [ ] **XAI-02**: GSD can route eligible execution work through `cross_ai_execution` as the explicit supported path when direct runtime model binding is not possible.
- [ ] **XAI-03**: GSD fails fast with actionable errors when cross-AI execution is required but misconfigured.
- [ ] **XAI-04**: Cross-AI execution validates command result handling strongly enough to prevent silent success on malformed or incomplete external execution output.

### Workflow and Docs Integration

- [ ] **WDI-01**: Init and workflow payloads expose the runtime-model validation result needed by planning and execution workflows.
- [ ] **WDI-02**: Workflows that pass model settings use the shared runtime-model semantics consistently instead of special-casing only one workflow.
- [ ] **WDI-03**: Documentation explains the supported meanings of explicit model binding, `inherit`, runtime-default binding, and `cross_ai_execution`.
- [ ] **WDI-04**: Automated tests cover runtime-model resolution, fail-fast validation, and cross-AI execution routing.

### Migration Safety

- [ ] **MIG-01**: Existing non-Claude runtime setups that intentionally rely on `resolve_model_ids: "omit"` continue to work when no unsupported explicit binding is requested.
- [ ] **MIG-02**: GSD gives a clear upgrade path when previously tolerated config becomes invalid under strict validation.
- [ ] **MIG-03**: Strict validation does not silently change current execution behavior for existing projects without surfacing the reason.

## Future Requirements

### Release Workflow Automation

- **AUTO-01**: Maintainer can run a scripted upstream sync preflight that reports changed upstream-owned files and Hermes seam conflicts before merge.
- **AUTO-02**: Maintainer can generate release notes automatically from upstream commit ranges and downstream commits.
- **AUTO-03**: Maintainer can run an automatic post-merge publish dry-run while keeping actual npm publish manual.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Automatic provider translation between incompatible runtimes | This milestone should fail fast or require explicit cross-AI execution, not guess a provider mapping |
| Silent fallback from unsupported explicit model to runtime default | Violates strict binding semantics and hides configuration errors |
| Full redesign of all runtime integrations | This milestone should add runtime-model enforcement without broad workflow rewrites |
| Replacing manual npm publish release policy | Release automation hardening remains future work, not the focus of this milestone |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| RMC-01 | Phase 5 | Pending |
| RMC-02 | Phase 5 | Pending |
| RMC-03 | Phase 5 | Pending |
| SBV-01 | Phase 6 | Pending |
| SBV-02 | Phase 6 | Pending |
| SBV-03 | Phase 6 | Pending |
| SBV-04 | Phase 6 | Pending |
| XAI-01 | Phase 7 | Pending |
| XAI-02 | Phase 7 | Pending |
| XAI-03 | Phase 7 | Pending |
| XAI-04 | Phase 7 | Pending |
| WDI-01 | Phase 8 | Pending |
| WDI-02 | Phase 8 | Pending |
| WDI-03 | Phase 8 | Pending |
| WDI-04 | Phase 8 | Pending |
| MIG-01 | Phase 8 | Pending |
| MIG-02 | Phase 8 | Pending |
| MIG-03 | Phase 8 | Pending |

**Coverage:**
- v1.2 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-22*
*Last updated: 2026-04-22 after milestone initialization*

# Requirements: gsd-hermes v1.8 Provider-Routed Agent Execution

**Defined:** 2026-04-29
**Core Value:** Developers can trust GSD runtime/model routing: when configuration says an agent should use a specific provider/model, execution either uses the matching runtime path or fails fast with actionable diagnostics.

## v1.8 Requirements

### Routing Contract

- [x] **ROUTE-01**: The SDK resolves each executable GSD agent into an execution binding containing `agent`, `configured_model`, `provider_family`, `execution_driver`, `cli_model`, `source`, `strict`, and diagnostic text before spawn time.
- [x] **ROUTE-02**: `anthropic/claude-*`, `claude-*`, and known Claude aliases route to `claude-cli` and normalize to the Claude CLI model token passed to `claude -p --model`.
- [x] **ROUTE-03**: `openai/*`, `gpt-*`, and known OpenAI aliases route to `codex-cli` and normalize to the Codex CLI model token passed to `codex exec --model`.
- [x] **ROUTE-04**: `inherit`, omitted model, and runtime-default model bindings preserve existing behavior when provider-routed execution is not explicitly enabled.
- [x] **ROUTE-05**: Unsupported provider families fail fast with an actionable error and never fall back to the parent runtime or another CLI.

### Dispatcher Behavior

- [x] **DISP-01**: `/gsd-execute-phase` consumes SDK-provided execution bindings instead of inferring CLI commands directly from freeform workflow text.
- [x] **DISP-02**: When `workflow.agent_execution_router = "provider-cli"`, executor/verifier spawns use `claude-cli` for Anthropic bindings and `codex-cli` for OpenAI bindings.
- [x] **DISP-03**: Driver preflight checks verify required CLI availability and surface authentication/setup failures before executing a plan.
- [x] **DISP-04**: Execution receipts are printed before spawn and include enough evidence to inspect `agent → configured model → provider → driver → cli model`.
- [x] **DISP-05**: `workflow.cross_ai_execution` remains a legacy whole-plan fallback and does not override a valid provider-routed direct binding.

### Tests and Safety

- [ ] **TEST-01**: Unit tests cover provider family detection and CLI model normalization for Anthropic and OpenAI tokens.
- [ ] **TEST-02**: SDK/init tests prove `model_overrides.gsd-executor = "anthropic/claude-opus-4-7"` yields `execution_driver = "claude-cli"` and `cli_model = "claude-opus-4-7"`.
- [ ] **TEST-03**: SDK/init tests prove `model_overrides.gsd-executor = "openai/gpt-5.5"` yields `execution_driver = "codex-cli"` and `cli_model = "gpt-5.5"`.
- [ ] **TEST-04**: Regression tests assert OpenAI bindings cannot produce `claude -p` commands and Claude bindings cannot produce `codex exec` commands.
- [ ] **TEST-05**: Regression tests assert unknown providers and unavailable required drivers fail fast with actionable diagnostics.
- [ ] **TEST-06**: Existing release gates still pass: `npm run test:hermes`, `npm test`, `npm run lint:tests`, and `npm pack --dry-run --json`.

### Documentation

- [ ] **DOC-01**: Configuration docs document `workflow.agent_execution_router = "provider-cli"` and show `model_overrides` examples for Claude and OpenAI agents.
- [ ] **DOC-02**: Compatibility docs clearly distinguish provider-routed CLI execution from Hermes `delegate_task(model=...)` child-construction evidence.
- [ ] **DOC-03**: README/release notes describe the new strict routing guarantee and fail-fast behavior in operator language.

## v1.9+ Requirements

### Future Provider Routes

- **FUT-01**: Add Gemini/OpenCode provider routes if the project adopts those runtime CLIs.
- **FUT-02**: Add live smoke tests that execute minimal CLI prompts when credentials are present, while keeping normal CI credential-free.
- **FUT-03**: Add a fully native Hermes `delegate_task` model/provider route once Hermes exposes enforceable per-call provider/model dispatch in the installed tool schema.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Wire-level provider proof for Claude/Codex API calls | CLI tools own their upstream provider transport; this milestone proves deterministic driver selection and model argument passing. |
| Rewriting GSD around Hermes-native orchestration | Violates the downstream fork constraint; implement adapter seams only. |
| Publishing npm release automatically | Release/publish is a later shipping step after implementation and validation. |
| Making `cross_ai_execution` the per-agent router | It is too coarse and caused ambiguity; per-agent provider routing needs explicit semantics. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ROUTE-01 | Phase 8.1 | Complete |
| ROUTE-02 | Phase 8.1 | Complete |
| ROUTE-03 | Phase 8.1 | Complete |
| ROUTE-04 | Phase 8.1 | Complete |
| ROUTE-05 | Phase 8.1 | Complete |
| DISP-01 | Phase 8.2 | Pending |
| DISP-02 | Phase 8.2 | Pending |
| DISP-03 | Phase 8.2 | Pending |
| DISP-04 | Phase 8.2 | Pending |
| DISP-05 | Phase 8.2 | Pending |
| TEST-01 | Phase 8.3 | Pending |
| TEST-02 | Phase 8.3 | Pending |
| TEST-03 | Phase 8.3 | Pending |
| TEST-04 | Phase 8.3 | Pending |
| TEST-05 | Phase 8.3 | Pending |
| TEST-06 | Phase 8.4 | Pending |
| DOC-01 | Phase 8.4 | Pending |
| DOC-02 | Phase 8.4 | Pending |
| DOC-03 | Phase 8.4 | Pending |

**Coverage:**
- v1.8 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-29*
*Last updated: 2026-04-29 after /gsd-new-milestone Provider-Routed Agent Execution*

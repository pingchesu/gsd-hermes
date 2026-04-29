# Roadmap: v1.8 Provider-Routed Agent Execution

**Created:** 2026-04-29
**Milestone Goal:** Make `model_overrides` drive deterministic per-agent execution routing: Anthropic/Claude models run through Claude Code CLI, OpenAI/GPT models run through Codex CLI, and unsupported/unavailable bindings fail fast instead of silently falling back.

## Summary

**4 phases** | **19 requirements mapped** | **Coverage: 100% ✓**

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 8.1 | Execution Binding Resolver | ✅ Complete — SDK emits strict provider-cli execution bindings from explicit model overrides. | ROUTE-01, ROUTE-02, ROUTE-03, ROUTE-04, ROUTE-05 | 5/5 |
| 8.2 | Execute-Phase Provider Dispatcher | Make `/gsd-execute-phase` consume execution bindings and spawn the correct CLI path with preflight and receipts. | DISP-01, DISP-02, DISP-03, DISP-04, DISP-05 | 5 |
| 8.3 | Strict Regression Coverage | Prove Anthropic→Claude and OpenAI→Codex routing, and prevent silent fallback to the wrong runtime. | TEST-01, TEST-02, TEST-03, TEST-04, TEST-05 | 5 |
| 8.4 | Docs, Gates, and Release Readiness | Update operator docs and run full local release gates without publishing. | TEST-06, DOC-01, DOC-02, DOC-03 | 5 |

## Phase Details

### Phase 8.1: Execution Binding Resolver

**Goal:** Introduce a single SDK-owned resolver that turns already-resolved model bindings into explicit execution bindings.

**Requirements:** ROUTE-01, ROUTE-02, ROUTE-03, ROUTE-04, ROUTE-05

**Likely files:**
- `sdk/src/query/runtime-model-contract.ts`
- `sdk/src/query/init.ts`
- New: `sdk/src/query/agent-execution-router.ts` or equivalent
- `tests/runtime-model-parity.test.cjs`
- `tests/init.test.cjs`

**Success criteria:**
1. SDK output contains `agent_execution_bindings` for executable agents when provider routing is enabled.
2. Claude tokens normalize from `anthropic/claude-opus-4-7` to `claude-opus-4-7` and select `claude-cli`.
3. OpenAI tokens normalize from `openai/gpt-5.5` to `gpt-5.5` and select `codex-cli`.
4. `inherit`/omitted/default bindings preserve current behavior unless provider routing is explicitly enabled.
5. Unknown providers produce a structured fail-fast diagnostic; no inherited or parent fallback is generated.

**Notes:**
- Keep the resolver independent from workflow markdown so tests can validate behavior without invoking CLIs.
- Reuse existing provider-family detection where possible; do not duplicate ad-hoc regexes in workflow text.

### Phase 8.2: Execute-Phase Provider Dispatcher

**Goal:** Update execute-phase orchestration so it consumes SDK execution bindings and dispatches executor/verifier work through the selected driver.

**Requirements:** DISP-01, DISP-02, DISP-03, DISP-04, DISP-05

**Likely files:**
- `get-shit-done/workflows/execute-phase.md`
- `get-shit-done/workflows/settings-advanced.md`
- `get-shit-done/references/planning-config.md`
- Potential helper under `get-shit-done/bin/lib/` if command rendering belongs in code rather than markdown

**Success criteria:**
1. Workflow instructions say to consume `agent_execution_bindings` rather than re-guess commands from `executor_model`.
2. `provider-cli` mode maps Anthropic bindings to `claude -p --model {cli_model}` and OpenAI bindings to `codex exec --model {cli_model}`.
3. Driver preflight checks fail before plan execution if `claude` or `codex` is missing/unusable.
4. Before spawn, the workflow displays a receipt showing `agent`, `configured_model`, `provider_family`, `execution_driver`, `cli_model`, and `source`.
5. `cross_ai_execution` is documented/enforced as lower-priority legacy fallback and cannot override direct provider-routed binding.

**Notes:**
- Command rendering must safely quote prompt paths/workdirs.
- Avoid inventing `claude -p` fallback when SDK did not route to `claude-cli`.

### Phase 8.3: Strict Regression Coverage

**Goal:** Add tests that lock the routing behavior and prevent recurrence of OpenAI bindings being executed through Claude CLI.

**Requirements:** TEST-01, TEST-02, TEST-03, TEST-04, TEST-05

**Likely files:**
- `tests/model-profiles.test.cjs`
- `tests/runtime-model-parity.test.cjs`
- `tests/init.test.cjs`
- New: `tests/agent-execution-router.test.cjs`
- `scripts/validate-hermes-compat.cjs` if Hermes-specific gate should include router coverage

**Success criteria:**
1. Unit tests cover Anthropic/OpenAI provider detection and CLI normalization.
2. `init.execute-phase` fixtures prove `anthropic/claude-opus-4-7` routes to `claude-cli`.
3. `init.execute-phase` fixtures prove `openai/gpt-5.5` routes to `codex-cli`.
4. Regression tests assert OpenAI bindings cannot render `claude -p` and Claude bindings cannot render `codex exec`.
5. Unknown/missing providers and unavailable drivers fail with explicit diagnostics.

**Notes:**
- Keep CI credential-free: test command rendering/preflight failure surfaces, not actual remote provider calls.
- If live smoke is added, gate it behind opt-in env vars only.

### Phase 8.4: Docs, Gates, and Release Readiness

**Goal:** Document the new operator-facing contract and verify the repo is ready for a subsequent release task.

**Requirements:** TEST-06, DOC-01, DOC-02, DOC-03

**Likely files:**
- `README.md`
- `docs/CONFIGURATION.md`
- `docs/hermes-compatibility.md`
- `docs/COMMANDS.md`
- `CHANGELOG.md`
- `docs/releases/v1.8.0-provider-routed-agent-execution.md`

**Success criteria:**
1. Configuration docs include `workflow.agent_execution_router = "provider-cli"` and examples for `gsd-executor` using `openai/gpt-5.5` and `gsd-verifier` using `anthropic/claude-opus-4-7`.
2. Compatibility docs distinguish CLI-driver enforcement from Hermes `delegate_task(model=...)` child-construction proof.
3. README/release notes state the guarantee: configured provider/model either selects the matching driver or fails fast.
4. Full local gates pass: `npm run test:hermes`, `npm test`, `npm run lint:tests`, `npm pack --dry-run --json`.
5. Release/publish remains separate; no npm publish is attempted in this phase.

## Next Step

Start with:

```text
/gsd-discuss-phase 8.2
```

or, if the design is already accepted:

```text
/gsd-plan-phase 8.2
```

## Coverage Validation

All v1.8 requirements in `.planning/REQUIREMENTS.md` map to exactly one phase. No unmapped requirements remain.

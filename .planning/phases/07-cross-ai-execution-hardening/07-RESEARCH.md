# Phase 7 Research: Cross-AI Execution Hardening

## What Phase 7 needs to do now

Phase 5 and Phase 6 already established two important constraints:
- runtime/model binding semantics must stay explicit and strict
- unsupported direct bindings must fail fast before execution

During early Phase 7 work, the repo also gained an important Hermes-specific capability correction:
- `runtime: "hermes"` is now modeled as a multi-provider runtime adapter
- mixed explicit bindings such as Anthropic planner + OpenAI checker are accepted under Hermes
- this solves the user's primary day-to-day provider switching need without introducing a broad workflow rewrite

That changes Phase 7 scope in a useful way:
- Hermes-native mixed-provider binding should be treated as the preferred direct path when the active runtime can really honor those bindings
- `cross_ai_execution` should stay focused on runtimes where direct binding cannot be honored, not become a universal routing abstraction

## Current repo state

### Good foundations already present
- `sdk/src/query/runtime-model-contract.ts` now models Hermes as a multi-provider adapter instead of misclassifying it as a provider-restricted runtime.
- `sdk/src/query/runtime-model-validation.ts` already surfaces `cross_ai_execution` as an explicit alternative without auto-routing into it.
- `get-shit-done/workflows/execute-phase.md` already contains a concrete cross-AI delegation step with CLI flags, config checks, stdin prompt piping, timeout handling, and fallback choices.
- `tests/cross-ai-execution.test.cjs` already guards the config surface and the Phase 6 “recommend only, do not auto-route” boundary.
- `get-shit-done/workflows/review.md` and `ship.md` already demonstrate the existing repo pattern for piping prompts to external AI commands through stdin with timeout protection.

### Important gaps Phase 7 must close
1. `cross_ai_execution` is documented in the workflow, but the contract between config, workflow flags, plan frontmatter, and external command success is still too soft.
2. There is no shared, testable helper for:
   - routing precedence (`CLI > config > plan frontmatter`)
   - cross-AI misconfiguration detection
   - external summary/result validation
3. The workflow currently treats “valid SUMMARY structure” loosely; Phase 7 requires a stronger minimum success contract so malformed output cannot count as success.
4. Failure recovery semantics are described, but not yet locked behind reusable validation rules or explicit regression coverage.

## Recommended implementation shape

### 1. Keep the Hermes adapter fix as the primary low-divergence path
This should remain the repo's default answer to the user's core need:
- if Hermes can honor the explicit provider/model directly, let strict binding pass and run normally
- do not force `cross_ai_execution` where direct runtime support already exists

Why this matters:
- minimizes downstream divergence from upstream workflow orchestration
- keeps the special behavior inside the Hermes adapter layer
- avoids building a broad routing system just to solve a Hermes-native case

### 2. Narrow Phase 7 to the true external delegation problem
`cross_ai_execution` should now be planned as the explicit path for:
- runtimes like Claude/Codex/Gemini when the configured binding belongs to another provider family
- future scenarios where runtime capability is truly narrower than the configured model intent

That keeps XAI-02 truthful:
- direct binding first when actually supported
- external cross-AI execution only when direct binding is unavailable

### 3. Add one shared helper layer for testable routing and result validation
Best shape:
- add a small shared helper module instead of embedding more shell-only logic into workflow markdown
- let the markdown workflow stay mostly the same, but anchor its semantics in reusable code

Recommended helper responsibilities:
- resolve whether cross-AI is disabled / forced / eligible by config + frontmatter
- validate that `workflow.cross_ai_command` is present when routing requires it
- validate minimum external SUMMARY contract
- classify failure types: timeout, non-zero exit, malformed summary, partial execution

This helper should be deliberately small and adapter-like, not a new orchestration framework.

### 4. Preserve workflow-first execution ownership
Phase 7 should keep the orchestrator ownership decisions from context:
- workflow/orchestrator remains owner of `STATE.md`, `ROADMAP.md`, and progress transitions
- external AI output may be accepted as an execution artifact, but not as the source of truth for shared state
- successful cross-AI execution should still be normalized into local `SUMMARY.md` and shared state updates by the orchestrator path

### 5. Reuse existing external-command patterns from review/ship
The repo already shows a stable pattern:
- prompt material written or piped via stdin
- `timeout` wrapper
- capture stdout/stderr separately
- inspect exit status before trusting results

Phase 7 should mirror those patterns instead of inventing a new command invocation style.

## Recommended file impact

Primary:
- `get-shit-done/workflows/execute-phase.md`
- `tests/cross-ai-execution.test.cjs`
- `docs/CONFIGURATION.md`

Likely helper seam:
- `sdk/src/query/` new small helper or validation module for cross-AI execution routing/result checks
- corresponding SDK tests if helper is introduced

Already completed groundwork that Phase 7 should acknowledge:
- `sdk/src/query/helpers.ts`
- `sdk/src/query/runtime-model-contract.ts`
- `sdk/src/query/config-query.test.ts`
- `sdk/src/query/init.test.ts`

## Concrete planning recommendation

Split Phase 7 into two implementation waves:

### Wave 1 — shared cross-AI contract hardening
- introduce the smallest reusable helper surface for routing precedence and result validation
- add tests for config/routing/malformed-summary behavior
- keep behavior explicit and fail-fast

### Wave 2 — workflow integration + docs
- update `execute-phase.md` to use the locked semantics
- align configuration docs with the new contract
- preserve orchestrator-owned state transitions and conservative fallback rules

## Test focus

Must cover:
1. CLI flag precedence over config and frontmatter
2. config precedence over plan frontmatter
3. missing `cross_ai_command` fails early when cross-AI routing is required
4. malformed / incomplete summary cannot count as success
5. timeout and non-zero exit are surfaced as actionable failures
6. successful cross-AI execution still preserves orchestrator-owned state updates
7. Hermes direct mixed-provider binding remains valid and does not require `cross_ai_execution`

## Key planning conclusion

The best low-maintenance strategy is:
- keep provider-mixing support inside the Hermes runtime capability adapter
- harden `cross_ai_execution` only as the explicit fallback path for runtimes that truly cannot honor the configured binding directly
- reuse existing workflow external-command patterns instead of introducing a large new routing subsystem

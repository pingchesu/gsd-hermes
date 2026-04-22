# Phase 6: Strict Binding Enforcement - Patterns

## Target Files and Closest Analogs

| Target file / area | Role | Closest existing analog | Why it matters |
|---|---|---|---|
| `sdk/src/query/runtime-model-contract.ts` | Canonical contract semantics | Itself | Phase 6 should consume the Phase 5 contract instead of recreating resolution logic |
| `sdk/src/query/config-query.ts` | Resolver + query validation surface | Itself | Best location for structured validation helpers and operator-facing error assembly |
| `sdk/src/query/init.ts` | Workflow entry serialization | Itself | Natural pre-run fail-fast seam for `plan-phase` and `execute-phase` |
| `sdk/src/phase-runner.ts` | Execution-time safety guard | Itself | Best place for the second line of defense when execution is entered programmatically |
| `sdk/src/session-runner.ts` | Execution backend boundary | Itself | Explicitly a boundary file to avoid deep refactors in this phase |
| `tests/bug-1829-inherit-model-profile.test.cjs` | Legacy-compatible regression coverage | Itself | Existing regression around inherit/resolve behavior and a good place to extend compatibility checks |
| `tests/cross-ai-execution.test.cjs` | Cross-AI config recognition regression | Itself | Good guardrail to keep Phase 6 from overreaching into Phase 7 routing behavior |

## Established Code Patterns

### Contract-first pattern
- Phase 5 moved runtime-model truth into `sdk/src/query/runtime-model-contract.ts`.
- Phase 6 should layer validation on top of that contract, not add a parallel resolver.

### Entry-point validation pattern
- `init` query handlers already shape workflow entry payloads.
- This makes `sdk/src/query/init.ts` the right seam for fail-fast before plan/execute workflows proceed.

### Defense-in-depth pattern
- Workflow-level checks catch normal user flows.
- `sdk/src/phase-runner.ts` should provide a second safety guard for direct SDK/programmatic execution.

## Integration Points

### Workflow entry points
- `init.plan-phase`
- `init.execute-phase`
- Any helper that converts resolved bindings into run-ready tokens for those workflows

### Runtime execution guard
- `sdk/src/phase-runner.ts` should reject unsupported explicit bindings before actual execution work is dispatched.
- This should be additive, not a deep rewrite of backend/session machinery.

### Documentation alignment
- `docs/CONFIGURATION.md` and `docs/USER-GUIDE.md` are the operator-facing analogs for expected remediation wording.

## Pattern Guidance for Planning

- Prefer one shared validation helper module that consumes the contract and returns structured diagnostics.
- Keep `session-runner.ts` changes minimal unless absolutely necessary for correctness.
- Preserve `resolve_model_ids: "omit"` as a valid runtime-default path in every enforcement rule.
- Suggest `cross_ai_execution` only as explicit remediation guidance, never as silent fallback.

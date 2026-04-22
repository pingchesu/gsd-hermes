# Research: Architecture — v1.2 Cross-Provider Agent Execution

Date: 2026-04-22

## Integration points

- `sdk/src/query/config-query.ts`
  - current canonical-ish resolve-model logic
- `sdk/src/query/config-mutation.ts`
  - config validation / allowlist gaps
- `sdk/src/config.ts`
  - typed config shape and defaults
- `sdk/src/query/init.ts`
  - orchestration payload generation
- `sdk/src/session-runner.ts`
  - current single-backend execution path
- `sdk/src/phase-runner.ts`
  - best place for per-plan execution routing
- `get-shit-done/workflows/execute-phase.md`
  - existing `cross_ai_execution` contract

## New vs modified components

### New
- Shared runtime capability registry
- Shared runtime-model validator
- Execution backend abstraction
- Cross-AI backend wrapper around `cross_ai_command`

### Modified
- Resolve-model query to return richer metadata
- Init payloads to expose validation/output mode
- Phase execution routing to choose local vs cross-AI backend
- Config mutation allowlist and validation for cross-AI/runtime fields

## Data flow

1. Load config
2. Detect runtime
3. Resolve model binding per agent
4. Validate runtime/model compatibility
5. Surface metadata in init payloads
6. Route execution:
   - local backend when direct execution is valid
   - cross-AI backend when explicit delegation is configured
7. Return a common execution result to existing workflow/state machinery

## Suggested build order

1. Centralize model resolution and validation
2. Fix SDK/CJS semantics drift
3. Add typed config + mutation support for required fields
4. Extend init payloads with runtime/binding metadata
5. Add execution backend abstraction
6. Wire per-plan cross-AI routing in `phase-runner`
7. Add regression tests and docs

## Key finding
The repo already has clean seams for this milestone, but execution is still effectively single-backend. This milestone should formalize runtime-aware execution instead of layering more special cases onto existing resolution code.
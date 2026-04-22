# Research: Pitfalls — v1.2 Cross-Provider Agent Execution

Date: 2026-04-22

## Warning signs

1. SDK and legacy CJS model semantics drift
2. Treating empty model as always invalid, which would break documented non-Claude runtime defaults
3. `inherit` handled correctly in execute-phase only, but not consistently across workflows
4. Anthropic-centric profile logic leaking into cross-provider validation
5. `cross_ai_execution` documented as a workflow path but not yet hardened as a validated execution contract

## Prevention strategy

- Create one shared runtime-model contract used everywhere
- Preserve three valid states:
  - explicit model
  - inherited model
  - runtime-default model
- Validate all entry points, not only `model_overrides`
- Expand tests from doc/config presence to actual execution semantics
- Keep `cross_ai_execution` explicit rather than implicit fallback

## Integration pitfalls

- Strict validation added only in SDK or only in CJS will create inconsistent behavior
- Unknown-agent fallback may start failing if not explicitly handled
- Unconditional `model=` injection in other workflows may bypass or break strict semantics
- External cross-AI execution can leave dirty-tree or summary/state mismatches without stronger contracts

## Phase mapping

### Phase 1
- Shared runtime/model contract
- SDK/CJS parity
- actionable error schema
- explicit handling for runtime-default vs inherit vs explicit binding

### Phase 2
- Workflow integration sweep
- init payload propagation
- non-execute workflow model semantics

### Phase 3
- Cross-AI contract hardening
- timeout / malformed output / dirty-tree handling
- external execution validation

### Phase 4
- Docs and migration safety
- explain new strict semantics to existing users
- prevent breaking existing non-Claude default installs silently

## Key finding
The biggest risk is not implementation complexity alone; it is fragmented ownership of model behavior across docs, workflows, SDK, and legacy code. This milestone should reduce that fragmentation first.
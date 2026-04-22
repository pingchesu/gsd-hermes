# Research: Features — v1.2 Cross-Provider Agent Execution

Date: 2026-04-22

## Table stakes

### Strict Model Binding
- User can declare per-agent model bindings in config
- GSD either uses exactly that binding or fails before execution
- No silent downgrade or fallback

### Runtime Model Validation
- GSD validates `model_overrides`
- GSD validates profile-derived resolved models from `model_profile`, `inherit`, and `resolve_model_ids`
- Errors identify:
  - agent
  - runtime
  - configured/resolved model
  - why unsupported
  - exact remediation

### Cross-Provider Execution
- `cross_ai_execution` is the explicit supported path when direct runtime binding is not possible
- `cross_ai_command` and timeout are validated before execution
- Failure modes are surfaced clearly

## Differentiators

- One canonical resolver/validator shared across SDK and legacy execution surfaces
- Runtime-aware diagnostics instead of generic "invalid model" errors
- Explicit distinction between:
  - bound model
  - inherited model
  - runtime-default model
- Cross-AI as an intentional contract, not an implicit fallback

## Anti-features

- Silent fallback to runtime default
- Pretending non-Claude runtimes can directly honor unsupported provider IDs
- Partial strictness that validates only `model_overrides` but not profile-derived models
- Hidden cross-provider routing without user opt-in

## Complexity and dependencies

- Depends on a runtime capability matrix
- Depends on unifying SDK and legacy CJS model semantics
- Depends on workflow integration beyond execute-phase
- Depends on stronger tests for fail-fast and cross-AI paths

## Recommended product expectation

If a user configures a model for an agent, GSD must either:
1. use that exact model on the selected runtime, or
2. stop immediately with an actionable error, or
3. require explicit `cross_ai_execution`

Anything else will violate the milestone goal.
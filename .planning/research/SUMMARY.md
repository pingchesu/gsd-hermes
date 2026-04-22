# Research Summary — v1.2 Cross-Provider Agent Execution

Date: 2026-04-22

## Stack additions
- Shared runtime capability registry
- Shared runtime-model validator
- Execution backend abstraction for local vs cross-AI execution
- Unified config/runtime semantics across SDK and legacy CJS surfaces

## Feature table stakes
- Configured agent model bindings must either execute exactly as configured or fail before execution
- Resolved models from `model_profile`, `inherit`, and `resolve_model_ids` must be validated too
- `cross_ai_execution` must be the explicit supported path for cross-provider execution
- Errors must name agent, runtime, model, cause, and fix

## Architecture direction
- Centralize resolution/validation first
- Extend init payloads with runtime/binding metadata
- Route execution in `phase-runner` to local or cross-AI backend
- Keep a common execution result contract for downstream workflow/state logic

## Watch out for
- SDK/CJS semantics drift
- Breaking documented non-Claude runtime default behavior when `resolve_model_ids: "omit"`
- `inherit` working in one workflow but not others
- Anthropic-centric assumptions leaking into cross-provider validation
- Cross-AI flow without strong command/output/state validation

## Recommended milestone shape

1. Runtime-model contract and shared validator
2. Workflow + init integration sweep
3. Cross-AI execution hardening
4. Docs, migration guidance, and regression coverage

## Areas needing validation during implementation
- Exact runtime capability matrix per supported runtime
- Whether all workflows that pass `model=` need patching or only selected high-impact ones
- Whether strict validation should be global or only apply when explicit model binding is configured

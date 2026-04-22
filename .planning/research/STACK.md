# Research: Stack — v1.2 Cross-Provider Agent Execution

Date: 2026-04-22

## Focus
What stack/runtime additions or changes are needed to support strict per-agent model binding, fail-fast runtime/model validation, and `cross_ai_execution` as the explicit cross-provider path.

## Recommended stack additions or changes

1. Add a shared runtime capability registry
- Keyed by runtime (`claude`, `codex`, `opencode`, `kilo`, `hermes`, etc.)
- Capabilities should include:
  - supports explicit per-agent model binding
  - supports `inherit`
  - supports runtime-default via omitted model
  - supports provider-qualified model IDs
  - supports `cross_ai_execution`

2. Add a shared runtime-model validator
- Validate resolved bindings before execution
- Return structured diagnostics, not booleans
- Must distinguish:
  - explicit model binding
  - inherited binding
  - runtime-default binding (`resolve_model_ids: "omit"`)

3. Add an execution backend abstraction
- Local backend for current agent runtime execution
- Cross-AI backend for external CLI delegation via `cross_ai_command`
- Preserve a common result contract for phase execution

4. Unify config/runtime semantics across SDK and legacy CJS surfaces
- Today behavior is split between SDK query handlers and upstream CJS helpers
- Strict binding should use one canonical resolver/validator to avoid drift

## Recommended representation

Use existing user-facing config where possible:
- `model_profile`
- `model_overrides`
- `resolve_model_ids`
- `workflow.cross_ai_execution`
- `workflow.cross_ai_command`
- `workflow.cross_ai_timeout`

Add internal resolved metadata, for example:
- agent
- source (`profile` | `override` | `inherit` | `runtime-default`)
- requested_model
- resolved_binding_mode (`inline` | `static-agent-config` | `runtime-default` | `cross-ai`)
- runtime
- validation_status
- validation_error

## Validation checkpoints

- Config mutation / settings validation
- Config load validation for model and cross-AI fields
- Resolve-model validation before workflow spawn
- Init payload validation before orchestration
- Execute-phase preflight validation for `cross_ai_execution`

## What not to add

- Silent fallback from unsupported explicit model to runtime default
- Hidden provider translation between vendors
- Ad hoc per-workflow validation logic duplicated in multiple places
- Cross-provider magic that bypasses explicit `cross_ai_execution`

## Key finding
The current codebase is close to supporting this milestone, but representation loss and SDK/CJS drift mean strict binding cannot be trusted until resolution and validation are centralized.
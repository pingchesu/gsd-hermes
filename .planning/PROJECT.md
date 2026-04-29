# gsd-hermes

## What This Is

gsd-hermes is a downstream fork of get-shit-done that adds Hermes Agent as a supported runtime while preserving the upstream GSD workflow model. It targets developers who want to run familiar `/gsd-*` workflows inside Hermes, while retaining strict, inspectable runtime/model behavior across Claude Code, Codex, and Hermes execution paths.

## Core Value

Developers can trust GSD runtime/model routing: when configuration says an agent should use a specific provider/model, execution either uses the matching runtime path or fails fast with actionable diagnostics.

## Current Milestone: v1.8 Provider-Routed Agent Execution

**Goal:** Make `model_overrides` drive deterministic per-agent execution routing: Anthropic/Claude models run through Claude Code CLI, OpenAI/GPT models run through Codex CLI, and unsupported/unavailable bindings fail fast instead of silently falling back.

**Target features:**
- Provider-family execution binding resolver derived from existing `model_overrides` and runtime-model diagnostics.
- Strict dispatcher contract for `claude-cli`, `codex-cli`, and future Hermes delegate paths.
- `/gsd-execute-phase` workflow and SDK payloads that show effective agent/model/provider/driver/source before spawning.
- Regression tests preventing `openai/*` from spawning `claude -p`, preventing Claude models from spawning Codex, and preventing unknown providers from inheriting silently.

## Requirements

### Validated

- ✓ Upstream sync/release path works through GitHub PR, GitHub Release, and npm Trusted Publishing — v1.7.0 release.
- ✓ Hermes runtime-model binding receipts exist for explicit/inherit/runtime-default/cross-AI paths — previous runtime-model work.
- ✓ Documentation states direct Hermes model binding and cross-AI semantics, but implementation now needs provider-routed CLI dispatch to match desired operator behavior.

### Active

- [ ] **ROUTE-01**: A resolved `model_overrides[agent]` value maps to an explicit provider family and execution driver before any agent spawn.
- [ ] **ROUTE-02**: Anthropic/Claude model tokens route to Claude Code CLI (`claude -p`) with a normalized Claude model token.
- [ ] **ROUTE-03**: OpenAI/GPT model tokens route to Codex CLI (`codex exec`) with a normalized Codex model token.
- [ ] **ROUTE-04**: Unknown provider/model tokens, unavailable CLIs, or unauthenticated CLIs fail fast with a diagnostic that names the configured agent/model/provider/driver and remediation.
- [ ] **ROUTE-05**: `/gsd-execute-phase` displays an agent execution binding receipt before spawning executor/verifier work.
- [ ] **ROUTE-06**: `workflow.cross_ai_execution` remains legacy whole-plan fallback and does not override a direct provider-routed binding.
- [ ] **ROUTE-07**: Tests prove provider-routed execution cannot silently fall back to the wrong CLI or parent runtime.
- [ ] **ROUTE-08**: User-facing docs explain the new `workflow.agent_execution_router = "provider-cli"` mode and examples for `anthropic/claude-opus-4-7` and `openai/gpt-5.5`.

### Out of Scope

- Full native Hermes wire-level proof for every upstream provider — this milestone routes to known CLI drivers and reports proof level honestly.
- Replacing upstream GSD workflow architecture — Hermes support stays in adapter/resolver/workflow seams.
- Building a Gemini/OpenCode provider route — leave extension points, but only Anthropic and OpenAI are required now.
- Automatically publishing a release from this milestone — shipping/release remains a later explicit `/gsd-ship` or release task.

## Context

The user’s desired operator experience is explicit:

```text
model_overrides.gsd-executor = "anthropic/claude-opus-4-7" → run `claude -p`
model_overrides.gsd-executor = "openai/gpt-5.5" → run `codex exec`
```

Current gsd-hermes already resolves model overrides and provider family in runtime-model code, but the execution layer still describes Hermes `delegate_task(model=...)` and/or Claude Task-style spawning. That gap allowed a degraded prompt to claim Hermes `delegate_task` was unavailable and then run `claude -p` even when `model_overrides` requested OpenAI/GPT. This milestone closes that gap by introducing a deterministic provider-family-to-driver binding before execution.

## Constraints

- **Architecture:** Keep upstream GSD-first structure; add resolver/adapter seams rather than rewriting workflows wholesale.
- **Runtime truthfulness:** If provider/model cannot be enforced by the selected driver, fail fast; do not claim provider proof from a generic subagent spawn.
- **Compatibility:** Preserve existing model profile behavior and `inherit` semantics for users not opting into provider-routed execution.
- **Safety:** Do not let `cross_ai_execution=true` silently override direct model/provider binding.
- **Distribution:** Update docs/tests so the behavior is installable and verifiable through `npm run test:hermes`, `npm test`, and pack dry-run.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Add `workflow.agent_execution_router = "provider-cli"` instead of overloading `cross_ai_execution` | `cross_ai_execution` is a coarse whole-plan fallback; provider routing is per-agent and model-driven | — Pending |
| Normalize provider-prefixed model tokens before CLI invocation | CLI tools generally expect `claude-opus-4-7` or `gpt-5.5`, not `anthropic/...` or `openai/...` | — Pending |
| Fail fast on unknown/unavailable drivers | Silent fallback is the root failure mode this milestone prevents | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-29 after /gsd-new-milestone Provider-Routed Agent Execution*

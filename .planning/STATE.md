# STATE

## Current Position

Phase: 8.4 — Docs, Gates, and Release Readiness
Plan: 08.4-01-docs-gates-release-readiness
Status: Phase 8.4 complete; v1.8 milestone implementation/docs/gates are release-ready, pending explicit shipping/release task
Last activity: 2026-04-29 — Completed Phase 8.4 docs, release note, and release-readiness gates

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-04-29)

**Core value:** Developers can trust GSD runtime/model routing: when configuration says an agent should use a specific provider/model, execution either uses the matching runtime path or fails fast with actionable diagnostics.
**Current focus:** Provider-routed per-agent execution from `model_overrides` to Claude Code CLI / Codex CLI.

## Current Milestone

**v1.8 Provider-Routed Agent Execution**

Goal: Make `model_overrides` drive deterministic per-agent execution routing: Anthropic/Claude models run through Claude Code CLI, OpenAI/GPT models run through Codex CLI, and unsupported/unavailable bindings fail fast instead of silently falling back.

## Next Up

**Milestone closeout / shipping** — Review diff, open PR, and perform explicit release task when ready. No npm publish or GitHub Release was attempted during Phase 8.4.

Recommended command:

```text
/gsd-ship
```

## Accumulated Context

- v1.7.0 successfully synced with upstream `gsd-build/get-shit-done`, shipped through GitHub Release and npm Trusted Publishing.
- `.planning/quick/260429-kpj-sync-upstream-get-shit-done-and-prepare-/PLAN.md` is preserved as the execution record for the v1.7.0 release sync.
- The user’s target behavior is strict: `anthropic/claude-opus-4-7` should execute through `claude -p`; `openai/gpt-5.5` should execute through `codex`; mismatches must fail fast.
- `cross_ai_execution` remains legacy whole-plan fallback and must not override direct provider-routed execution.
- Phase 8.1 added SDK `agent_execution_bindings`; Phase 8.2 added provider-cli command rendering and execute-phase dispatch guidance; Phase 8.3 added credential-free regression tests and Hermes compatibility guardrails.
- Phase 8.4 updated README/configuration/compatibility/command docs, added `docs/releases/v1.8.0-provider-routed-agent-execution.md`, and passed `npm run test:hermes`, `npm test` (5942/5942), `npm run lint:tests`, and `npm pack --dry-run --json`.

## Blockers

None.

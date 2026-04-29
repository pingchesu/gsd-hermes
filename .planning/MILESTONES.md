# Milestones

## v1.7.0 — Upstream Sync and Trusted Publishing

**Status:** Complete
**Completed:** 2026-04-29

Synchronized gsd-hermes with latest upstream get-shit-done, opened and merged PR #39, created GitHub Release `v1.7.0`, and published `gsd-hermes@1.7.0` to npm using GitHub Actions Trusted Publishing.

## v1.8 — Provider-Routed Agent Execution

**Status:** Active
**Started:** 2026-04-29

Goal: Make `model_overrides` drive deterministic per-agent execution routing: Anthropic/Claude models run through Claude Code CLI, OpenAI/GPT models run through Codex CLI, and unsupported/unavailable bindings fail fast instead of silently falling back.

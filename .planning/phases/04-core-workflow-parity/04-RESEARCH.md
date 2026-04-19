# Phase 4: Core Workflow Parity - Research

**Phase:** 04 - Core Workflow Parity
**Date:** 2026-04-19
**Status:** Complete

## Research Question

What does Phase 4 need to change so Hermes users can run the core GSD loop
after Phase 3 command discovery?

## Findings

### Existing Hermes Seam

Phase 3 created the right adapter seam. `bin/install.js` now has
`copyCommandsAsHermesSkills()` for command skill generation and
`ensureHermesExternalDir()` for project-linked discovery through
`skills.external_dirs`. Those helpers should remain the primary extension
points for Phase 4.

### Installed Workflow Tree Still Matters

Hermes command skills load files from `get-shit-done/workflows/`. The installer
copies that tree with `copyWithPathReplacement()`, but that replacement only
handles slash forms like `~/.claude/` and `$HOME/.claude/`. Several workflows
contain bare forms like `$HOME/.claude` and runtime directory lists that omit
Hermes. Those can survive install and break or mislead core workflow execution.

High-risk files:
- `get-shit-done/workflows/settings.md`
- `get-shit-done/workflows/update.md`
- `get-shit-done/workflows/verify-work.md`
- `get-shit-done/workflows/plan-phase.md`
- `get-shit-done/workflows/execute-phase.md`
- `get-shit-done/workflows/new-project.md`

### Deterministic CI Strategy

Hermes itself should not be required in CI. Phase 4 can still prove most of the
runtime contract by installing into temporary `HOME` and project directories,
then asserting:
- core `gsd-*` skills exist
- generated skill names are command-discoverable
- copied workflow files do not contain executable-blocking `.claude` path refs
- project-linked config points to the fixture `.gsd-hermes/skills`
- degraded-path guidance appears for Hermes-only gaps

Real `hermes` CLI smoke should be optional and skipped when unavailable.

### Degraded Paths

GSD workflows still mention Claude-native tools such as `AskUserQuestion`,
`Task`, and `SlashCommand`. Some workflows already include text-mode or
sequential fallback guidance for non-Claude runtimes. Phase 4 should surface
Hermes-specific fallback guidance in generated Hermes skills and docs rather
than pretending those tools always exist.

## Recommended Architecture

1. Add a deterministic Hermes core workflow fixture test suite.
2. Harden runtime path replacement for copied Hermes workflow files.
3. Add explicit Hermes degraded-path guidance to generated skills and docs.
4. Add optional/probe-gated real Hermes smoke evidence without making it a CI
   prerequisite.

## Validation Architecture

Phase 4 validation should include:
- Targeted tests for Hermes install fixtures.
- Source tests that assert high-value workflow files are represented in the
  smoke coverage.
- Generated-output tests that assert no `~/.claude` or `$HOME/.claude` leaks
  remain in installed Hermes workflow files, excluding changelog/history files.
- Docs tests that assert compatibility docs move core workflow execution from
  "planned" to either "supported" or explicitly "supported with degraded paths"
  only after implementation.
- Optional CLI probe that records skip/pass/fail evidence depending on whether
  `hermes` is available on `PATH`.

## Out of Scope

- Full update/uninstall/doctor lifecycle tooling. Phase 5 owns that.
- Native local Hermes install semantics.
- Long-tail `/gsd-*` command parity outside FLOW-01/FLOW-02.

---

## RESEARCH COMPLETE

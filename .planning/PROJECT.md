# GSD Hermes

## What This Is

`gsd-hermes` is a downstream fork of [gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done) that preserves the upstream GSD workflow and adds first-class Hermes Agent runtime support, cross-provider runtime/model execution semantics, and independent release cadence. Published to npm as `gsd-hermes`, it lets users install the GSD workflow into Hermes (and other runtimes already supported by upstream) without waiting for upstream to carry Hermes-specific maintenance cost.

## Core Value

A user running Hermes Agent can `npx gsd-hermes --hermes --global` and immediately use the standard GSD workflow (plan, execute, verify) with Hermes-native runtime/model semantics, while the fork tracks closely behind upstream GSD.

## Current Milestone: v1.4 Hermes Runtime Model Binding Receipts

**Goal:** Make GSD/Hermes per-agent model overrides observable, enforceable, and impossible to silently ignore at runtime.

**Target features:**
- `/gsd-plan-phase` and `/gsd-execute-phase` emit per-agent model binding receipts before spawning work.
- Hermes subagents receive the configured per-agent model through a real binding channel, or GSD fails fast before spawn.
- Explicit `model_overrides` cannot silently fall back to the parent/default Hermes model.
- Regression tests prove invalid explicit models fail, child `AIAgent.model` matches the expected override, and provider request metadata is inspectable.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

**v1.0 — Fork Foundation (Cross-Provider Agent Execution baseline):**
- ✓ Independent `gsd-hermes` npm package identity preserved alongside upstream `get-shit-done-cc` — v1.0
- ✓ Hermes runtime installer (`bin/install.js`) with path ownership and runtime selection — v1.0
- ✓ Fork rationale, version strategy, and compatibility docs in `docs/` and `README.md` — v1.0
- ✓ npm publish workflow and CI smoke tests for the fork — v1.0

**v1.1 — Upstream Sync and Release (synced to `get-shit-done-cc@1.38.2`):**
- ✓ **SYNC-01..04** — Traceable upstream merge from upstream base with conflict ownership routing — v1.1
- ✓ **HERM-01..04** — Hermes install, local/external-dir, SDK query, non-Claude model config preserved after merge — v1.1
- ✓ **REL-01..05** — `npm run test:hermes`, package metadata update, PR, CI publish — v1.1

**v1.2 — Cross-Provider Agent Execution (shipped 2026-04-22):**
- ✓ Strict runtime/model binding semantics shared between SDK and legacy CJS via `model-profiles.cjs` adapter — v1.2
- ✓ `resolve_model_ids: "omit"` behavior for inherit and runtime-default bindings — v1.2
- ✓ Cross-provider `cross_ai_execution` fallback config recognition — v1.2
- ✓ Parity test matrix (`tests/runtime-model-parity.test.cjs`) preventing SDK/legacy contract drift — v1.2

**v1.3 — Upstream Sync to v1.39-main + Runtime-Aware Profile Compatibility (shipped 2026-04-24 as `gsd-hermes@1.3.0`, GitHub Release `v1.3.0`):**
- ✓ **SYNC-01..05** — Upstream synced `v1.38.2 → upstream/main@0a049149` (97 commits); sync log `docs/sync-logs/2026-04-sync-0a049149.md` with 56 per-hunk `bin/install.js` rows + 226 per-file category rows — v1.3
- ✓ **HERM-01..04** — Install (global + external-dir + macOS canonicalization), SDK query, non-Claude model config all preserved post-merge — v1.3
- ✓ **PROFILE-01..04** — Upstream #2517 runtime-aware profiles compose with Hermes v1.2 adapter via 13-row parity matrix; PROFILE-03 inherit-projection fixed via `options.initContext` — v1.3
- ✓ **SLASH-01..02** — Dual-track `/gsd:` (upstream #2543) / `/gsd-` (Hermes skills) syntax coexistence per `docs/hermes-compatibility.md §Slash Command Inventory` — v1.3
- ✓ **INST-01..02** — SDK install decoupled (upstream #2441), `sdk/dist` shipped in tarball; `sdk/dist/cli.js` three-layer chmod 0o755 defense — v1.3
- ✓ **REL-01..05** — `npm test` 5505/5505, `npm run test:hermes` 97+25; CHANGELOG + README rewritten Hermes-first; PR #24 squash-merged; `gsd-hermes@1.3.0@latest` on npm; GitHub Release `v1.3.0` — v1.3
- ✓ **ARCHIVE-01..03** — v1.2 MILESTONES.md §Requirements + RETROSPECTIVE.md v1.2 section + Cross-Milestone Trends rows all backfilled — v1.3

### Active

<!-- Current scope. Building toward these. -->

**v1.4 — Hermes Runtime Model Binding Receipts:**
- [ ] **RCPT-01..04** — Users can see binding receipts for every spawned GSD agent, including configured/resolved model, runtime/provider, source, binding kind, and enforcement path.
- [ ] **BIND-01..04** — Hermes receives per-agent model bindings through an explicit runtime channel, or GSD reports that the binding cannot be enforced before any subagent is spawned.
- [ ] **ENF-01..03** — Explicit overrides fail fast when unsupported or unprovable; invalid model smoke tests cannot pass through parent/default fallback.
- [ ] **TEST-01..04** — SDK, workflow, Hermes child construction, and provider-request diagnostics have regression coverage for no-silent-fallback behavior.
- [ ] **REL-01..04** — Tracker issue/PR/release docs document the root cause, solution, validation evidence, and `gsd-hermes@1.4.0` release path.

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- **Rebase-only sync strategy** — Merge commits preserve traceable upstream history across repeated syncs; rebase erases that audit trail
- **Direct npm publish without PR** — Downstream fork must preserve both upstream and Hermes behavior; PR review is the gate that catches regressions in either
- **Upstream prerelease `v1.39.0-rc.1` as the pinned sync target** — rc.1 predates the runtime-aware model profiles commit the fork needs to verify (`cc17886c`); we target `upstream/main@0a049149` instead
- **New Hermes feature work unrelated to this sync** — scope kept to merge + compatibility + release to avoid cross-cutting risk in a 97-commit sync
- **Automated upstream sync preflight / automated release notes** — tracked as future AUTO-01/AUTO-02 from v1.1 carryover; valuable but not required for v1.3

## Context

- Upstream GSD maintainers [declined Hermes runtime support in core](https://github.com/gsd-build/get-shit-done/issues/2272#issuecomment-4254178547) citing installer leanness and long-term maintenance cost
- Fork ownership rules are codified in `docs/fork-ownership.md`: `sdk/`, `agents/`, `commands/`, `hooks/`, `get-shit-done/` are upstream-owned; `bin/install.js` and `tests/` are Hermes adapter seam; `.planning/`, `AGENTS.md`, `docs/` are downstream governance
- `.planning/` is gitignored — planning state is local, not part of the published package or PRs
- Previous sync (v1.1) established the repeatable 4-phase pattern: merge baseline → Hermes compat → release metadata → PR-release
- v1.2 milestone planning artifacts were not formally archived (no `/gsd-complete-milestone` run); v1.3 backfills that gap
- Downstream semver is independent from upstream; fork ships its own release story and records the upstream base explicitly in README/CHANGELOG
- v1.4 addresses a discovered runtime-truthfulness gap: GSD can resolve `.planning/config.json` `model_overrides` and render `Task(model=...)` strings, but current Hermes `delegate_task` has no per-call `model` field and children inherit the parent model when `delegation.model` is unset.

## Constraints

- **Tech stack**: Node.js package with CJS + SDK in TypeScript (compiled), installer in plain JS, tests in `node --test` + Vitest (SDK only)
- **Compatibility**: Must support every runtime upstream supports (Claude Code, OpenCode, Gemini, Codex, Cursor, Windsurf, Antigravity, Augment, Trae, Qwen Code, Cline, CodeBuddy, Copilot, Kilo) plus Hermes; regressions on any of these block release
- **Release**: Two-step external action — npm publish dry-run must pass before actual publish; GitHub release tag follows npm release version (`v1.3.0`)
- **Fork maintenance**: Downstream deltas must stay concentrated in the adapter seam paths to keep merges tractable; broad workflow rewrites are deferred unless explicitly decided
- **Scanning performance**: Base64-heavy upstream diffs have historically stressed CI security scans (v1.1 hit this); sync milestones must budget for scan efficiency

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep upstream repo layout at root; no restructuring | Merge-friendliness per `docs/fork-ownership.md` D-03 | ✓ Good — v1.1 and v1.2 syncs stayed tractable |
| Downstream semver independent from upstream version | Fork ships its own release story; conflating versions confuses users | ✓ Good — validated at v1.0, v1.1, v1.2 |
| `.planning/` is gitignored fork-local governance | Prevents planning artifacts leaking into product PRs and keeps milestones private to maintainer | ✓ Good — observed at v1.1 |
| Two-step npm release (dry-run then publish) | Prior CI issues would have shipped broken tarballs; dry-run catches them | ✓ Good — v1.1 caught real CI drift |
| Target `upstream/main@0a049149` for v1.3 (not `v1.39.0-rc.1`) | rc.1 predates `cc17886c` runtime-aware model profiles which must be verified against Hermes runtime-model adapter | — Pending |
| Record `resolves_phase` on phase dirs to detect archive gaps | v1.2 milestone closed without archival; v1.3 adds explicit backfill step | — Pending |
| Treat Hermes per-agent model binding as a runtime proof problem, not just resolver correctness | Resolver metadata and workflow strings do not prove spawned Hermes subagents used the requested model; explicit overrides must be observable and enforceable | — Pending |

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
*Last updated: 2026-04-25 after milestone v1.4 initialization*

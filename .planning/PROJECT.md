# GSD Hermes

## What This Is

GSD Hermes is a downstream fork of upstream GSD that keeps the upstream get-shit-done workflow intact while adding first-class Hermes Agent runtime support. It is distributed as the independent `gsd-hermes` npm package and tracks upstream closely without mirroring upstream package versions.

The project exists because upstream GSD intentionally keeps core runtime maintenance lean, while this fork carries the Hermes-specific install, compatibility, and release maintenance burden.

## Core Value

Users can install `gsd-hermes` with npm and use the standard GSD workflow inside Hermes Agent without losing upstream GSD behavior or falling behind upstream.

## Current State

**Shipped version:** `gsd-hermes@1.1.0`
**GitHub Release:** https://github.com/pingchesu/gsd-hermes/releases/tag/v1.1.0
**npm dist-tag:** `latest -> 1.1.0`
**Upstream base:** `get-shit-done-cc@1.38.2`
**Upstream commit:** `7397f580a555491eb2ba0d4e51d8dafbd489a1db`

The fork is currently published and installable with:

```bash
npx gsd-hermes@latest --hermes --global
```

## Current Milestone: v1.2 Cross-Provider Agent Execution

**Goal:** Make per-agent model configuration enforceable across runtimes, fail fast on unsupported model/runtime combinations, and support `cross_ai_execution` as the explicit cross-provider execution path.

**Target features:**
- Strict validation for `model_overrides` before agent execution.
- Strict validation for resolved models from `model_profile`, `inherit`, and `resolve_model_ids`.
- Clear fail-fast errors that identify the agent, runtime, configured model, and suggested fix.
- Formalize `cross_ai_execution` as the supported cross-provider path when direct runtime model binding is not possible.

## Requirements

### Validated

- ✓ `gsd-hermes` npm package exists independently from upstream `get-shit-done-cc` — v1.0.0/v1.0.1
- ✓ Hermes Agent runtime install support exists in the downstream installer — v1.0.0
- ✓ Bundled SDK install fallback avoids sudo on root-owned npm prefixes — v1.0.1
- ✓ Version policy records downstream version and upstream base separately — v1.0.1
- ✓ Upstream `get-shit-done-cc@1.38.2` synced into downstream `gsd-hermes` — v1.1.0
- ✓ Hermes runtime install, SDK query, and command discovery verified after upstream sync — v1.1.0
- ✓ Release metadata documents downstream version and upstream base — v1.1.0
- ✓ CI-backed npm publish released `gsd-hermes@1.1.0` — v1.1.0

### Active

- [ ] Agent model bindings are enforced across runtimes without silent fallback.
- [ ] Unsupported runtime/model combinations fail fast with actionable diagnostics.
- [ ] `cross_ai_execution` is a validated path for cross-provider agent execution.

### Out of Scope

- Replacing upstream workflow semantics — this fork should remain a close downstream adapter, not a divergent GSD rewrite.
- Publishing directly from an unreviewed local merge — release should happen after PR validation and merge.
- Mirroring upstream package versions — `gsd-hermes` keeps its independent semver line.
- Adding new non-Hermes runtimes — upstream sync should not expand runtime scope beyond preserving inherited upstream support.

## Context

- `origin` is `https://github.com/pingchesu/gsd-hermes.git`.
- `upstream` is `https://github.com/gsd-build/get-shit-done.git`.
- Current downstream package version before this milestone: `gsd-hermes@1.0.1`.
- Current downstream upstream base before this milestone: `get-shit-done-cc@1.37.1`.
- Fetched upstream state on 2026-04-22: `upstream/main` at `7397f580a555491eb2ba0d4e51d8dafbd489a1db`.
- Fetched upstream package version at that commit: `get-shit-done-cc@1.38.2`.
- Latest fetched stable upstream tag: `v1.38.2`; fetched prerelease tag also includes `v1.39.0-rc.1`.
- The sync runbook is `docs/upstream-sync.md`.
- The version strategy is `VERSIONING.md`.

## Constraints

- **Merge strategy**: Use standard merge from `upstream/main`; do not rebase or squash upstream history.
- **Patch discipline**: Keep Hermes-specific changes in installer, runtime conversion, compatibility docs, release docs, and tests.
- **Release identity**: Bump downstream `gsd-hermes` independently; record upstream base separately.
- **Validation**: `npm run test:hermes` is required; `npm test` is the full release gate when feasible.
- **Node runtime**: Package requires Node `>=22.0.0`; test and release commands should use compatible Node.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use a milestone for upstream sync and release | Syncing upstream has conflict, compatibility, validation, and release risks that should be tracked explicitly | Good |
| Target downstream minor release for this sync | Upstream base moves from 1.37.x to 1.38.x, which VERSIONING classifies as a downstream minor sync | Good |
| Preserve merge history | Future Hermes conflicts should remain reviewable against upstream | Good |
| Keep `.planning/` local/ignored unless explicitly force-added | Current repo ignores `.planning/`; planning artifacts should not accidentally enter product PRs | Good |
| Keep npm publish manual | npm publish is irreversible per version; dry-run first and explicit publish confirmation reduce registry risk | Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition**:
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone**:
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-22 after starting milestone v1.2 Cross-Provider Agent Execution*

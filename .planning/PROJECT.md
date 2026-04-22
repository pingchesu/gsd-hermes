# GSD Hermes

## What This Is

GSD Hermes is a downstream fork of upstream GSD that keeps the upstream get-shit-done workflow intact while adding first-class Hermes Agent runtime support. It is distributed as the independent `gsd-hermes` npm package and tracks upstream closely without mirroring upstream package versions.

The project exists because upstream GSD intentionally keeps core runtime maintenance lean, while this fork carries the Hermes-specific install, compatibility, release maintenance, and runtime-adapter burden.

## Core Value

Users can install `gsd-hermes` with npm and use the standard GSD workflow inside Hermes Agent without losing upstream GSD behavior or falling behind upstream.

## Current State

**Latest npm release:** `gsd-hermes@1.1.0`
**Latest completed milestone:** `v1.2 Cross-Provider Agent Execution`
**Git tag:** `v1.2`
**Upstream base:** `get-shit-done-cc@1.38.2`
**Upstream commit:** `7397f580a555491eb2ba0d4e51d8dafbd489a1db`

The fork now supports:
- strict per-agent runtime/model binding semantics
- fail-fast unsupported runtime/provider/model diagnostics
- Hermes direct mixed-provider explicit binding
- explicit `cross_ai_execution` fallback with deterministic routing and stronger result validation
- workflow/docs/test propagation of runtime-model semantics

## Next Milestone Goals

- Improve release workflow automation and sync ergonomics.
- Reduce long-term drift risk between canonical configuration semantics and auxiliary documentation/translations.
- Decide whether the v1.2 semantic work should be followed by a downstream package release milestone, an upstream sync automation milestone, or both.

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
- ✓ Agent model bindings are enforced across runtimes without silent fallback — v1.2
- ✓ Unsupported runtime/model combinations fail fast with actionable diagnostics — v1.2
- ✓ `cross_ai_execution` is a validated path for cross-provider agent execution — v1.2

### Active

- [ ] Release workflow automation is available for downstream sync/release preparation.
- [ ] Documentation drift between canonical config semantics and derivative docs is proactively detected.
- [ ] Downstream milestone closeout and release preparation remain lightweight enough to repeat after future upstream syncs.

### Out of Scope

- Replacing upstream workflow semantics — this fork should remain a close downstream adapter, not a divergent GSD rewrite.
- Publishing directly from an unreviewed local merge — release should happen after PR validation and merge.
- Mirroring upstream package versions — `gsd-hermes` keeps its independent semver line.
- Adding new non-Hermes runtimes — upstream sync should not expand runtime scope beyond preserving inherited upstream support.

## Context

- `origin` is `https://github.com/pingchesu/gsd-hermes.git`.
- `upstream` is `https://github.com/gsd-build/get-shit-done.git`.
- Latest upstream sync milestone shipped `gsd-hermes@1.1.0` against `get-shit-done-cc@1.38.2`.
- Latest semantic milestone (`v1.2`) completed on branch `gsd/v1.2-cross-provider-agent-execution` and is tagged `v1.2`.
- `.planning/` is ignored by `.gitignore`; planning artifacts are local unless force-added intentionally.
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
| Target downstream minor release for v1.1 sync | Upstream base moved from 1.37.x to 1.38.x, which VERSIONING classifies as a downstream minor sync | Good |
| Preserve merge history | Future Hermes conflicts should remain reviewable against upstream | Good |
| Keep `.planning/` local/ignored unless explicitly force-added | Current repo ignores `.planning/`; planning artifacts should not accidentally enter product PRs | Good |
| Keep npm publish manual | npm publish is irreversible per version; dry-run first and explicit publish confirmation reduce registry risk | Good |
| Keep runtime/provider truth centralized in SDK query/contract seams | Broad workflow drift is harder to maintain across upstream syncs | Good |
| Treat Hermes as a multi-provider direct runtime when it can truly honor the configured binding | Solves provider switching without forcing all work through external delegation | Good |
| Keep `cross_ai_execution` explicit rather than implicit fallback | Prevents silent downgrade behavior and keeps operator intent visible | Good |

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
*Last updated: 2026-04-23 after completing milestone v1.2 Cross-Provider Agent Execution*

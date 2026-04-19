# gsd-hermes

## What This Is

gsd-hermes is a full-fat fork of get-shit-done that adds Hermes Agent as a
supported runtime without shrinking the original workflow model. It is for solo
developers who want to install GSD, select Hermes during setup, and then run
the familiar `/gsd-*` workflow directly inside Hermes.

The project is intentionally GSD-first: upstream workflow structure stays as
intact as possible, while Hermes support is concentrated in installer,
conversion, compatibility, and test layers.

## Core Value

A developer can install GSD for Hermes and use the standard get-shit-done
workflow inside Hermes with near-parity to the upstream experience.

## Requirements

### Validated

- [x] Hermes appears as an installable runtime in the gsd-hermes installer. Validated in Phase 2: Hermes Runtime Install.
- [x] Hermes users can invoke `/gsd-*` commands after installation. Validated in Phase 3: Hermes Command Discovery.
- [x] Core GSD workflows work in Hermes without rewriting the whole system. Validated in Phase 4: Core Workflow Parity.
- [x] Hermes support remains maintainable while syncing upstream GSD regularly. Validated in Phase 6: Compatibility Closure.

### Active

All v1 requirements are validated.

### Out of Scope

- Building a brand-new workflow system unrelated to GSD — this project is a
  compatibility fork, not a reinvention.
- Supporting every new agent runtime beyond Hermes in v1 — that expands the
  maintenance surface before Hermes is stable.
- Large-scale rewrites of upstream workflows when an adapter or shim can solve
  the issue — that would make upstream sync too expensive.

## Context

- The project starts from zero in `/home/whiskey/workspace/project/central/v2/gsd-hermes`.
- The desired user experience is: install via npm/npx, choose Hermes as a
  runtime, then use `/gsd-*` in Hermes and follow standard get-shit-done
  development flow.
- `gsd-opencode` is the closest precedent for a downstream runtime-focused port.
- Hermes has strong native primitives for project context, skills, and
  delegation, but its skill install model is global-first with optional
  `external_dirs` rather than a first-class local runtime layout.
- The project should support both global install and a project-linked mode based
  on Hermes `skills.external_dirs`.

## Constraints

- **Architecture**: Keep a GSD-first structure — Hermes support should live in
  adapter layers, not broad workflow rewrites.
- **Compatibility**: Preserve as much upstream behavior as possible — users
  should feel they are using GSD, not a different system.
- **Maintainability**: Upstream sync must stay cheap enough for frequent
  updates — isolate Hermes patches and prefer shims over deep divergence.
- **Distribution**: The install path must feel native to Hermes — global install
  is primary, project-linked install is secondary.
- **Runtime Truthfulness**: Do not claim Hermes has a true native local install
  mode for skills — project-linked mode must be described accurately.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use a GSD-first engineering strategy | Minimizes upstream drift and keeps daily sync cost manageable | Validated in Phase 2 by adding Hermes through installer seams without broad workflow rewrites |
| Prefer adapter/shim changes over workflow rewrites | Workflow divergence is the fastest way to make the fork expensive to maintain | Validated in Phase 2 by deferring workflow conversion and `external_dirs` work to later phases |
| Support Hermes global install first, plus project-linked install via `external_dirs` | Matches Hermes' real capabilities while still enabling repo-linked workflows | Global install validated in Phase 2; project-linked install validated in Phase 3 |
| Build `gsd-hermes` as a full get-shit-done fork | The target is feature parity plus Hermes runtime support, not a lightweight wrapper | Validated through v1 completion across Phases 1-6 |
| Accept degraded behavior when exact parity is temporarily impossible | Preserves momentum and compatibility while Hermes-specific gaps are closed incrementally | Validated in Phase 4 and maintained in Phase 6 compatibility docs |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-19 after Phase 6 verification*

# Roadmap: gsd-hermes

## Overview

Build a full downstream fork of get-shit-done that adds Hermes Agent as a
supported runtime while keeping the core GSD workflow as intact as possible.
The work starts with fork architecture and adapter boundaries, then adds Hermes
installation and command discovery, then closes the highest-value workflow
parity gaps before hardening lifecycle tooling and upstream sync discipline.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Fork Foundation** - Establish the fork structure, adapter boundaries, and upstream sync rules.
- [x] **Phase 2: Hermes Runtime Install** - Add Hermes as an installer-supported runtime with correct path handling.
- [x] **Phase 3: Hermes Command Discovery** - Make Hermes surface `/gsd-*` commands for global and project-linked installs.
- [x] **Phase 4: Core Workflow Parity** - Run the highest-value GSD workflows inside Hermes and close critical compatibility gaps. (completed 2026-04-19)
- [x] **Phase 5: Lifecycle Tooling** - Add update, uninstall, doctor, and accurate operator docs for Hermes installs. (completed 2026-04-19)
- [x] **Phase 6: Compatibility Closure** - Tighten parity with upstream GSD and formalize repeatable sync validation. (completed 2026-04-19)
- [x] **Phase 7: NPM Package Identity** - Make the fork installable as `gsd-hermes` through npm/npx while preserving compatibility aliases. (completed 2026-04-19)

## Phase Details

### Phase 1: Fork Foundation
**Goal**: Establish a maintainable `gsd-hermes` fork structure that clearly separates upstream base, Hermes adapter logic, and local enhancements.
**Depends on**: Nothing (first phase)
**Requirements**: [ARCH-01, ARCH-02]
**Success Criteria** (what must be TRUE):
  1. Maintainers can identify where Hermes-specific code belongs without inspecting the whole repository.
  2. The fork has a documented upstream remote and sync strategy.
  3. The project docs define GSD-first rules for when adapter changes are preferred over workflow rewrites.
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Establish fork layout, ownership boundaries, and project docs
- [x] 01-02-PLAN.md — Define upstream sync workflow, remotes, and patch discipline
- [x] 01-03-PLAN.md — Create initial compatibility matrix and adapter guardrails

### Phase 2: Hermes Runtime Install
**Goal**: Make Hermes a first-class runtime option in the installer with correct install-path semantics.
**Depends on**: Phase 1
**Requirements**: [DIST-01]
**Success Criteria** (what must be TRUE):
  1. Developers can choose Hermes during install through npm/npx entrypoints.
  2. Installer logic resolves Hermes paths consistently.
  3. Install output clearly states which Hermes mode was configured.
**Plans**: 3 plans

Plans:
- [x] 02-01: Add Hermes runtime selection, flags, and help output
- [x] 02-02: Implement Hermes path resolution and install ownership rules
- [x] 02-03: Validate installer behavior with runtime-focused tests

### Phase 3: Hermes Command Discovery
**Goal**: Ensure Hermes users can discover and invoke `/gsd-*` commands after install in both supported install modes.
**Depends on**: Phase 2
**Requirements**: [HERM-01, HERM-02]
**Success Criteria** (what must be TRUE):
  1. Global install exposes `/gsd-*` commands in Hermes.
  2. Project-linked install works through `skills.external_dirs` without pretending to be native local install.
  3. Command discovery behavior is documented and testable.
**Plans**: 3 plans

Plans:
- [x] 03-01: Build Hermes command/skill conversion for global installs
- [x] 03-02: Add project-linked install support via `external_dirs`
- [x] 03-03: Add discovery regression coverage and mode-specific docs

### Phase 4: Core Workflow Parity
**Goal**: Make the core GSD development loop usable inside Hermes with intentional fallback behavior where parity is incomplete.
**Depends on**: Phase 3
**Requirements**: [FLOW-01, FLOW-02, FLOW-03]
**Success Criteria** (what must be TRUE):
  1. Developers can initialize a project from Hermes and create standard `.planning/` artifacts.
  2. Developers can run the main GSD lifecycle commands in Hermes without critical workflow breaks.
  3. Any short-term parity gap fails clearly through a documented shim or degraded path.
**Plans**: 4 plans

Plans:
- [x] 04-01: Validate `new-project` and planning artifact creation in Hermes
- [x] 04-02: Close compatibility gaps for discuss, plan, execute, and progress flows
- [x] 04-03: Add shims for non-equivalent Hermes runtime behavior
- [x] 04-04: Run end-to-end smoke tests on the core workflow path

### Phase 5: Lifecycle Tooling
**Goal**: Make Hermes installations maintainable through update, uninstall, doctor, and accurate docs.
**Depends on**: Phase 4
**Requirements**: [DIST-02, DIST-03, QUAL-01, DOCS-01]
**Success Criteria** (what must be TRUE):
  1. Developers can update and uninstall Hermes installs safely.
  2. Maintainers can run doctor and regression checks that catch common Hermes install issues.
  3. Docs describe install modes, compatibility boundaries, and known gaps accurately.
**Plans**: 4 plans

Plans:
- [x] 05-01: Implement update and uninstall flows for Hermes modes
- [x] 05-02: Add doctor and install-health diagnostics
- [x] 05-03: Build Hermes regression checks for lifecycle and smoke paths
- [x] 05-04: Publish operator docs for install, update, uninstall, and troubleshooting

### Phase 6: Compatibility Closure
**Goal**: Lock in near-parity behavior for supported workflows and make upstream sync a repeatable maintenance routine.
**Depends on**: Phase 5
**Requirements**: [COMP-01, COMP-02]
**Success Criteria** (what must be TRUE):
  1. Supported Hermes workflows behave near-parity with upstream GSD.
  2. Upstream sync can be repeated with a known validation checklist.
  3. Hermes-specific drift is visible, bounded, and reviewable.
**Plans**: 3 plans

Plans:
- [x] 06-01: Close remaining high-value parity gaps against upstream GSD
- [x] 06-02: Formalize upstream sync checklist and validation workflow
- [x] 06-03: Publish compatibility matrix and ongoing maintenance guidance

### Phase 7: NPM Package Identity
**Goal**: Make `gsd-hermes` installable through npm/npx as its own package while keeping upstream installer behavior and compatibility command aliases intact.
**Depends on**: Phase 6
**Requirements**: [DIST-04]
**Success Criteria** (what must be TRUE):
  1. `package.json` publishes as `gsd-hermes` and points to the downstream repository.
  2. `npx gsd-hermes --hermes --global` and `npx gsd-hermes --hermes --local` are the documented primary install commands.
  3. `npm pack --dry-run` produces a `gsd-hermes` tarball that includes Hermes operator docs.
**Plans**: 1 plan

Plans:
- [x] 07-01: Establish npm package identity

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Fork Foundation | 3/3 | Complete | 2026-04-19 |
| 2. Hermes Runtime Install | 3/3 | Complete | 2026-04-19 |
| 3. Hermes Command Discovery | 3/3 | Complete | 2026-04-19 |
| 4. Core Workflow Parity | 4/4 | Complete    | 2026-04-19 |
| 5. Lifecycle Tooling | 4/4 | Complete   | 2026-04-19 |
| 6. Compatibility Closure | 3/3 | Complete | 2026-04-19 |
| 7. NPM Package Identity | 1/1 | Complete | 2026-04-19 |

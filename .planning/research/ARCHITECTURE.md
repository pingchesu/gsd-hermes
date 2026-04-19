# Architecture Research: gsd-hermes

**Researched:** 2026-04-18  
**Confidence:** Medium

## Recommended Architecture

### 1. Upstream base layer

Keep the upstream get-shit-done structure as intact as possible.

Responsibilities:

- upstream commands
- workflows
- templates
- core planning model
- existing tests and docs

### 2. Hermes adapter layer

Add a clearly bounded Hermes runtime support surface.

Responsibilities:

- installer flag and menu entry
- Hermes path detection
- skill/command conversion
- Hermes-specific shims for non-equivalent runtime behavior
- Hermes documentation
- Hermes-specific test coverage

### 3. Distribution lifecycle layer

Keep install lifecycle logic separate from workflow logic.

Responsibilities:

- install
- update
- uninstall
- doctor
- manifest/path ownership
- project-linked install management

## Data / Artifact Flow

1. User runs installer via npm/npx
2. Installer selects Hermes runtime mode
3. Runtime adapter writes Hermes-discoverable command/skill artifacts
4. User invokes `/gsd-*` inside Hermes
5. Standard GSD workflows create and update `.planning/` artifacts
6. Doctor/update flows validate that install and runtime mappings still hold

## Build Order Implications

1. Installer/runtime skeleton
2. Hermes command discovery
3. Core workflow smoke path
4. Project-linked install support
5. Update/uninstall/doctor
6. Broader compatibility closure

## Boundary Guidance

- Keep Hermes support centralized enough to diff and rebase cleanly.
- Prefer conversion hooks over editing many workflow documents.
- Only touch workflow files when Hermes cannot be supported through adapter
  behavior alone.

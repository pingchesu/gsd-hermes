# Stack Research: gsd-hermes

**Researched:** 2026-04-18  
**Confidence:** Medium

## Recommended Base

- **Upstream base:** `gsd-build/get-shit-done` main branch
- **Fork model:** Long-lived downstream fork with explicit `upstream` sync flow
- **Primary runtime target:** Hermes Agent
- **Primary package/runtime manager:** Node.js 18+ and npm
- **Core language surface:** Keep upstream JavaScript/Node code where it already
  exists; avoid unnecessary rewrites to new stacks

## Recommended Technical Stack

### Distribution and installer

- **Node.js 18+**
  - Required because upstream GSD already ships a Node-based installer and CLI
  - Reusing this minimizes divergence
- **npm / npx**
  - Matches desired install UX
  - Supports `npx gsd-hermes` and package-based upgrades

### Runtime integration

- **Hermes skills**
  - Native user-facing surface for `/gsd-*`
  - Best fit for command discoverability
- **Hermes `skills.external_dirs`**
  - Best bridge for project-linked installs
  - Use as a supported mode, not as a claim of native local install
- **Hermes context files**
  - Reuse `AGENTS.md` and related project context instead of inventing another
    project instruction surface

### Testing

- **Reuse upstream GSD test stack first**
  - Preserve current test tooling and patterns where possible
- **Add Hermes-specific regression tests**
  - Install path handling
  - Runtime conversion
  - Workflow smoke tests
  - Project-linked install behavior

## What Not To Do

- Do not redesign the whole project as Hermes-native from scratch in v1.
- Do not replace the Node-based installer unless it becomes a blocker.
- Do not move workflow logic into packaging code.
- Do not introduce a large new abstraction layer before Hermes parity exists.

## Rationale

The cheapest maintainable path is to keep upstream GSD as the source system and
add a bounded Hermes adapter. Every new stack decision that is not forced by
Hermes increases sync cost with little product value.

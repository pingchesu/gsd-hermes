<!-- GSD:project-start source:PROJECT.md -->
## Project

**gsd-hermes**

gsd-hermes is a full-fat fork of get-shit-done that adds Hermes Agent as a
supported runtime without shrinking the original workflow model. It is for solo
developers who want to install GSD, select Hermes during setup, and then run
the familiar `/gsd-*` workflow directly inside Hermes.

The project is intentionally GSD-first: upstream workflow structure stays as
intact as possible, while Hermes support is concentrated in installer,
conversion, compatibility, and test layers.

**Core Value:** A developer can install GSD for Hermes and use the standard get-shit-done
workflow inside Hermes with near-parity to the upstream experience.

### Constraints

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
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Base
- **Upstream base:** `gsd-build/get-shit-done` main branch
- **Fork model:** Long-lived downstream fork with explicit `upstream` sync flow
- **Primary runtime target:** Hermes Agent
- **Primary package/runtime manager:** Node.js 18+ and npm
- **Core language surface:** Keep upstream JavaScript/Node code where it already
## Recommended Technical Stack
### Distribution and installer
- **Node.js 18+**
- **npm / npx**
### Runtime integration
- **Hermes skills**
- **Hermes `skills.external_dirs`**
- **Hermes context files**
### Testing
- **Reuse upstream GSD test stack first**
- **Add Hermes-specific regression tests**
## What Not To Do
- Do not redesign the whole project as Hermes-native from scratch in v1.
- Do not replace the Node-based installer unless it becomes a blocker.
- Do not move workflow logic into packaging code.
- Do not introduce a large new abstraction layer before Hermes parity exists.
## Rationale
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

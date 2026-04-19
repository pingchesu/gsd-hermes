# Phase 1: Fork Foundation - Research

**Researched:** 2026-04-18 [VERIFIED: local system date]
**Domain:** Downstream fork architecture, upstream sync governance, and runtime adapter boundary definition for `gsd-hermes` [VERIFIED: 01-CONTEXT.md + ROADMAP.md]
**Confidence:** MEDIUM [VERIFIED: local repo state + upstream repo clone + official Git/GitHub docs]

<user_constraints>
## User Constraints (from CONTEXT.md)

Verbatim copy from `.planning/phases/01-fork-foundation/01-CONTEXT.md` [VERIFIED: 01-CONTEXT.md].

### Locked Decisions
### Repository Structure
- **D-01:** Preserve the upstream `get-shit-done` layout at the repository root rather
  than wrapping it in a vendor or subtree directory.
- **D-02:** Hermes-specific changes should be concentrated in installer, runtime
  conversion, compatibility, documentation, and test layers rather than broad
  workflow rewrites.
- **D-03:** Avoid repo-wide restructuring in Phase 1 so future upstream syncs stay
  cheap and reviewable.

### Upstream Sync Discipline
- **D-04:** Add an `upstream` remote pointing to `gsd-build/get-shit-done` and treat
  `origin` as the project fork remote.
- **D-05:** Sync from upstream using regular merges from `upstream/main` into this
  fork's `main`, not rebases or cherry-pick-only maintenance.
- **D-06:** Preserve visible merge history so Hermes-specific conflicts and patch drift
  remain traceable over time.

### Phase 1 Baseline Deliverables
- **D-07:** Keep Phase 1 documentation-first: establish compatibility matrix,
  adapter guardrails, upstream sync rules, and known-gaps inventory before building
  runtime features.
- **D-08:** Do not expand Phase 1 into runtime parity implementation or heavy
  executable validation; those belong to later phases.
- **D-09:** Use Phase 1 outputs to define where Hermes changes may live and what must
  remain upstream-aligned before any installer/runtime work begins.

### the agent's Discretion
- Exact document filenames and internal sections for the compatibility matrix,
  sync checklist, and guardrail docs.
- The most pragmatic decomposition of Phase 1 plans, as long as it preserves the
  locked structural and sync decisions above.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ARCH-01 | Maintainer can identify which code belongs to upstream GSD, Hermes adapter logic, and local enhancements. [VERIFIED: REQUIREMENTS.md] | Ownership should be documented by surface area, not by ad hoc file naming: upstream root layout stays intact, Hermes edits are bounded to installer/runtime conversion/docs/tests, and local governance stays in `.planning/` plus repo-root project docs. [VERIFIED: 01-CONTEXT.md + PROJECT.md + upstream repo clone/code search] |
| ARCH-02 | Maintainer can follow a documented upstream sync routine without guessing where Hermes-specific patches should live. [VERIFIED: REQUIREMENTS.md] | The sync routine should explicitly define `origin` vs `upstream`, the first import path for unrelated histories, the normal `git fetch upstream && git merge upstream/main` flow, and a patch-boundary checklist that keeps Hermes changes reviewable. [VERIFIED: 01-CONTEXT.md + git remote show origin + git-scm.com/docs/git-remote + docs.github.com syncing/configuring fork docs] |
</phase_requirements>

## Summary

Phase 1 should stay narrow and documentation-first because the `gsd-hermes` repo currently contains planning artifacts and repo-root `AGENTS.md`, while the upstream `get-shit-done` source tree has not been imported yet. The local repo has `origin` configured, no `upstream` remote, and `origin` reports `HEAD branch: (unknown)`, which means the planner should treat initial fork wiring and initial upstream import as explicit work rather than implicit background state. [VERIFIED: local repo tree + git remote -v + git remote show origin + 01-CONTEXT.md]

The current upstream baseline is active and multi-runtime. A shallow clone of `gsd-build/get-shit-done` shows the root-preserved layout the user wants to keep, including `bin/install.js`, `commands/`, `agents/`, `get-shit-done/`, `hooks/`, `sdk/`, `docs/`, and `tests/`, and the published npm package `get-shit-done-cc` is currently `1.37.1`. That means Phase 1 should document boundaries against real upstream surfaces instead of inventing a new fork shape. [VERIFIED: upstream repo clone + npm registry]

The main operational risk is not missing runtime code yet; it is creating governance documents that imply the fork already has a normal syncable code baseline. The first upstream import will need to reconcile unrelated histories, and after that the steady-state sync routine can follow the locked merge-based flow from `upstream/main` into `main`. This is an inference from verified repo state plus Git/GitHub fork-sync documentation. [VERIFIED: local repo state + upstream repo clone + git-scm.com/docs/git-merge + docs.github.com syncing/configuring fork docs]

**Primary recommendation:** Use Phase 1 to publish three artifacts: an ownership/boundary map, a merge-based upstream sync runbook that includes the first import case, and a compatibility/known-gaps matrix that explicitly says Hermes runtime behavior is not implemented yet. [VERIFIED: 01-CONTEXT.md + ROADMAP.md; inference from verified local/upstream repo state]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Fork layout ownership | Repository root | `.planning/` governance docs | The user locked a root-preserving fork, so ownership rules must describe how the imported upstream tree stays intact while governance lives outside the imported runtime code. [VERIFIED: 01-CONTEXT.md + PROJECT.md + upstream repo clone] |
| Upstream sync routine | Git remotes/history | Repository docs | `origin` already points at the fork, `upstream` is missing, and GitHub/Git both document the add/fetch/merge fork workflow, so the routine belongs to git history operations backed by written instructions. [VERIFIED: git remote -v + git remote show origin + git-scm.com/docs/git-remote + docs.github.com fork docs] |
| Hermes adapter boundaries | Installer/runtime conversion surfaces | Tests and docs | Upstream centralizes runtime-specific path and conversion logic in `bin/install.js` and validates runtimes in dedicated tests, so Hermes should extend that seam rather than fork workflow markdown broadly. [VERIFIED: upstream repo clone + code search in bin/install.js/tests + docs/ARCHITECTURE.md] |
| Compatibility truthfulness | Docs/compatibility matrix | Runtime implementation later | The project explicitly forbids claiming a native local Hermes skill install and says project-linked mode must be described truthfully, so Phase 1 owns the wording before code exists. [VERIFIED: PROJECT.md + AGENTS.md + REQUIREMENTS.md] |
| Validation of Phase 1 outputs | Documentation checks | Git state inspection | ARCH-01 and ARCH-02 are governance/documentation requirements, so Phase 1 verification is primarily document completeness plus git-state sanity, not runtime smoke testing. [VERIFIED: REQUIREMENTS.md + ROADMAP.md + 01-CONTEXT.md] |

## Project Constraints (from AGENTS.md)

- `gsd-hermes` is intended as a full-fat fork of `get-shit-done`, not a wrapper or replacement workflow. [VERIFIED: AGENTS.md]
- The project is intentionally GSD-first, and Hermes support should stay concentrated in installer, conversion, compatibility, documentation, and test layers. [VERIFIED: AGENTS.md]
- Global install is the primary Hermes distribution mode, and project-linked install is secondary. [VERIFIED: AGENTS.md]
- Project-linked Hermes install must be described truthfully as an `external_dirs` bridge, not as a native local install mode. [VERIFIED: AGENTS.md]
- The workflow expectation in this repo is to preserve upstream behavior as much as possible and keep upstream sync cheap enough for frequent updates. [VERIFIED: AGENTS.md]

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `get-shit-done-cc` | `1.37.1` [VERIFIED: upstream package.json + npm registry] | Upstream source baseline and published package identity. [VERIFIED: upstream package.json + npm registry] | This is the current upstream package and the actual source tree the fork will import and preserve at repo root. [VERIFIED: upstream repo clone + npm registry] |
| `git` | local `2.34.1` [VERIFIED: local `git --version`] | Remote configuration, initial import, and ongoing upstream merges. [VERIFIED: local `git --version` + git remote state] | The locked sync model depends on standard git remotes and merge history rather than custom sync tooling. [VERIFIED: 01-CONTEXT.md + git-scm.com/docs/git-remote + git-scm.com/docs/git-merge] |
| `Node.js` | upstream requires `>=22.0.0`; local is `v20.19.5` [VERIFIED: upstream package.json + local `node --version`] | Required runtime for the upstream installer and test scripts after import. [VERIFIED: upstream package.json + local `node --version`] | The planner should treat Node 22+ as a prerequisite for later implementation and validation work because the current local Node version is below the upstream engine floor. [VERIFIED: upstream package.json + local `node --version`] |
| `npm` | local `10.8.2` [VERIFIED: local `npm --version`] | Package install, metadata inspection, and upstream dependency restore after import. [VERIFIED: local `npm --version`] | Upstream ships Node-based install/test scripts and npm-published releases, so npm remains the standard package entrypoint. [VERIFIED: upstream package.json + npm registry + local `npm --version`] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` | upstream pinned `^4.1.2`; registry latest `4.1.4` [VERIFIED: upstream package.json + npm registry] | Typed SDK unit/integration coverage after the upstream tree is imported. [VERIFIED: upstream package.json + upstream `sdk/vitest.config.ts`] | Use when Phase 1 or later work touches `sdk/` after the upstream code lands in this fork. [VERIFIED: upstream package.json + upstream repo clone] |
| `c8` | upstream pinned `^11.0.0`; registry latest `11.0.0` [VERIFIED: upstream package.json + npm registry] | Coverage gate for the existing upstream JS test stack. [VERIFIED: upstream package.json] | Use when validating imported CLI/lib changes with the upstream coverage script. [VERIFIED: upstream package.json] |
| `gh` | local `2.88.1` [VERIFIED: local `gh --version`] | Optional repo/PR inspection and sync assistance. [VERIFIED: local `gh --version`] | Use for maintainership convenience only; the core fork sync contract should remain plain git commands so it is runtime-agnostic. [VERIFIED: local `gh --version` + docs.github.com fork docs] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Root-preserving downstream fork [VERIFIED: locked D-01] | Vendor/subtree import of upstream under a nested directory [ASSUMED] | A nested vendor layout would isolate upstream files, but it directly conflicts with the locked decision to preserve upstream layout at repo root and would make later runtime path assumptions less faithful to upstream. [VERIFIED: 01-CONTEXT.md; inference from upstream repo clone] |
| Regular merges from `upstream/main` [VERIFIED: locked D-05] | Rebase or cherry-pick maintenance [ASSUMED] | Rebase/cherry-pick can reduce visible merge commits, but they also erase the traceability the user explicitly wants for Hermes-specific conflicts and drift. [VERIFIED: 01-CONTEXT.md + git-scm.com/docs/git-merge] |
| Extending upstream runtime seams in `bin/install.js` and tests [VERIFIED: upstream repo clone] | Separate Hermes-only installer or wrapper entrypoint [ASSUMED] | A separate installer would duplicate runtime selection, path ownership, and conversion rules that upstream already centralizes in one file. [VERIFIED: upstream `bin/install.js` + docs/ARCHITECTURE.md] |

**Installation:**
```bash
# Phase 1 should not add new npm dependencies.
# After the upstream source is imported at repo root:
npm install
```
Installation note: upstream already defines the package manifest and scripts that later phases should reuse. [VERIFIED: upstream package.json]

**Version verification:** `npm view get-shit-done-cc version`, `npm view vitest version`, `npm view esbuild version`, and `npm view c8 version` were checked on 2026-04-18. [VERIFIED: npm registry]

## Architecture Patterns

### System Architecture Diagram

```text
Maintainer
  |
  v
Repo main branch (planning-only today)
  |
  +--> Phase 1 governance docs
  |      - ownership map
  |      - sync runbook
  |      - compatibility / gaps matrix
  |
  v
Git remotes
  | \
  |  \--> origin (fork remote; currently no known HEAD)
  |
  \----> upstream (to be added: gsd-build/get-shit-done)
            |
            v
      upstream/main
            |
            v
Initial import merge (first time: unrelated histories)
            |
            v
Steady-state merge flow
  git fetch upstream
  git checkout main
  git merge upstream/main
            |
            v
Imported upstream tree at repo root
  |
  +--> Upstream-owned surfaces remain aligned
  |      - commands/
  |      - agents/
  |      - get-shit-done/
  |      - hooks/
  |      - sdk/
  |
  \--> Hermes-owned bounded patch zones
         - bin/install.js runtime entry
         - runtime conversion logic
         - Hermes docs / compatibility notes
         - Hermes regression tests
```
The diagram reflects the current local repo state, the verified upstream tree shape, and the locked merge-based sync discipline. [VERIFIED: local repo tree + git remote state + upstream repo clone + 01-CONTEXT.md]

### Recommended Project Structure
```text
repo-root/
├── .planning/              # Downstream planning, state, and governance artifacts
├── AGENTS.md               # Downstream runtime-facing contract
├── agents/                 # Imported upstream agent definitions
├── commands/               # Imported upstream command entrypoints
├── get-shit-done/          # Imported upstream workflows, references, templates, CLI libs
├── hooks/                  # Imported upstream hooks
├── sdk/                    # Imported upstream typed query layer
├── tests/                  # Imported upstream tests + Hermes regression coverage later
├── docs/                   # Imported upstream docs + Hermes compatibility docs later
└── bin/install.js          # Primary runtime-selection and install seam
```
This structure keeps the user-locked root-preserving model and matches the verified upstream tree. [VERIFIED: 01-CONTEXT.md + upstream repo clone + AGENTS.md]

### Pattern 1: Root-Preserving First Import, Then Merge-Based Sync
**What:** Keep the imported upstream tree at repo root and treat the first import separately from steady-state sync. [VERIFIED: 01-CONTEXT.md + upstream repo clone]
**When to use:** Use this for the initial upstream code landing and every later sync from `upstream/main`. [VERIFIED: 01-CONTEXT.md + docs.github.com syncing a fork]
**Example:**
```bash
# Source: GitHub Docs + git-merge manual
git remote add upstream https://github.com/gsd-build/get-shit-done.git
git fetch upstream

# First import into a planning-only repo will need unrelated histories.
git checkout main
git merge --allow-unrelated-histories upstream/main

# Later syncs should use ordinary merges from upstream/main.
git fetch upstream
git checkout main
git merge upstream/main
```
Source basis: GitHub documents `git remote add upstream …`, `git fetch upstream`, and `git merge upstream/main` for fork sync; Git documents `--allow-unrelated-histories` as part of `git merge`. [CITED: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/configuring-a-remote-repository-for-a-fork?platform=mac] [CITED: https://docs.github.com/github/collaborating-with-pull-requests/working-with-forks/merging-an-upstream-repository-into-your-fork?platform=mac] [CITED: https://git-scm.com/docs/git-merge]

### Pattern 2: Centralize Runtime-Specific Logic in Existing Installer Seams
**What:** Add Hermes as another runtime inside the existing upstream runtime selection, path resolution, conversion, and manifest machinery instead of creating a separate fork-only installer path. [VERIFIED: upstream `bin/install.js` + runtime-related tests]
**When to use:** Use this for any future Hermes install/discovery work in Phases 2-5. [VERIFIED: ROADMAP.md + upstream repo clone]
**Example:**
```text
Primary Hermes edit zones after import:
- bin/install.js
- tests/runtime-converters.test.cjs
- runtime-specific install/config tests
- Hermes compatibility docs
```
The upstream installer already centralizes runtime dir naming, global dir resolution, conversion helpers, and manifest writing in `bin/install.js`, which is the right seam to extend later. [VERIFIED: upstream repo clone + code search in `bin/install.js`]

### Pattern 3: Governance Before Runtime Code
**What:** Publish the ownership rules, sync checklist, and compatibility/known-gap inventory before adding Hermes runtime behavior. [VERIFIED: locked D-07 through D-09]
**When to use:** Use this for Phase 1 only. [VERIFIED: ROADMAP.md + 01-CONTEXT.md]
**Example:**
```markdown
| Surface | Owner | Allowed Hermes Changes | Notes |
|---------|-------|------------------------|-------|
| commands/ | upstream-first | no broad rewrites | prefer adapter/shim behavior |
| bin/install.js | shared seam | yes | runtime selection, path ownership, conversion |
| tests/ | shared seam | yes | Hermes regression coverage belongs here |
| .planning/ | downstream-only | yes | fork governance and planning state |
```
This directly supports ARCH-01 and ARCH-02 without violating the documentation-first phase scope. [VERIFIED: REQUIREMENTS.md + ROADMAP.md + 01-CONTEXT.md]

### Anti-Patterns to Avoid
- **Nested vendor import:** Do not wrap upstream in a `vendor/` or subtree directory; it violates the locked root-layout decision and makes path-based runtime docs less faithful to upstream. [VERIFIED: 01-CONTEXT.md; inference from upstream repo clone]
- **Early workflow markdown forks:** Do not start Hermes work by editing many command/workflow markdown files before the installer/runtime seams are mapped; upstream architecture explicitly separates commands, workflows, agents, and CLI layers, so broad early edits create expensive drift. [VERIFIED: upstream `docs/ARCHITECTURE.md` + 01-CONTEXT.md]
- **Pretend-local Hermes install wording:** Do not describe project-linked mode as a native local install; the project explicitly says that would be untruthful. [VERIFIED: PROJECT.md + AGENTS.md + REQUIREMENTS.md]
- **Assuming steady-state sync before first import:** Do not write a sync runbook that starts at `git merge upstream/main` without acknowledging the planning-only repo state and unrelated-history first import. [VERIFIED: local repo state + git remote show origin + git-scm.com/docs/git-merge]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Runtime path ownership | A standalone Hermes-only installer [ASSUMED] | Extend upstream `bin/install.js` runtime selection and config-dir helpers. [VERIFIED: upstream repo clone + `bin/install.js`] | Upstream already centralizes runtime directory and config ownership logic there, so duplicating it would create avoidable drift. [VERIFIED: upstream `bin/install.js`] |
| Fork sync discipline | A custom sync script or patch queue [ASSUMED] | Plain git remotes plus documented merge routine. [VERIFIED: git remote state + official Git/GitHub docs] | The locked decisions want visible merge history and traceable conflicts, which native git remotes/merges already provide. [VERIFIED: 01-CONTEXT.md + git-scm.com/docs/git-remote + git-scm.com/docs/git-merge] |
| Ownership classification | Folder-name conventions invented from scratch [ASSUMED] | A written surface-ownership matrix tied to real upstream directories. [VERIFIED: upstream repo clone + REQUIREMENTS.md] | ARCH-01 is about maintainers identifying ownership quickly; a matrix against the actual imported tree solves that without restructuring the repo. [VERIFIED: REQUIREMENTS.md + upstream repo clone] |
| Test harness for later phases | A new custom JS test runner [ASSUMED] | Reuse upstream `npm test`, `scripts/run-tests.cjs`, Vitest projects, and existing runtime tests after import. [VERIFIED: upstream package.json + upstream `sdk/vitest.config.ts` + repo clone] | The upstream repo already ships the test runner, coverage script, and runtime-specific regression patterns. [VERIFIED: upstream package.json + upstream repo clone] |

**Key insight:** Phase 1 should define where future Hermes patches go; it should not invent new infrastructure for patching, syncing, or testing before the upstream code even lands. [VERIFIED: 01-CONTEXT.md + ROADMAP.md + upstream repo clone]

## Common Pitfalls

### Pitfall 1: Treating governance docs as a substitute for a first-import plan
**What goes wrong:** The team writes a sync checklist that assumes the repo already contains upstream code, even though the current fork is still planning-only. [VERIFIED: local repo tree + 01-CONTEXT.md]
**Why it happens:** `origin` exists, so it is easy to assume the fork is already in a normal steady-state sync posture. [VERIFIED: git remote -v]
**How to avoid:** Document the first import separately and call out the unrelated-histories merge explicitly. [VERIFIED: git-scm.com/docs/git-merge + docs.github.com syncing a fork; inference from local repo state]
**Warning signs:** `origin` shows `HEAD branch: (unknown)` or the runbook never explains how upstream code first reaches `main`. [VERIFIED: git remote show origin]

### Pitfall 2: Burying Hermes boundaries inside generic “later” language
**What goes wrong:** Later phases inherit ambiguity because Phase 1 never names which surfaces may receive Hermes edits. [VERIFIED: REQUIREMENTS.md + ROADMAP.md]
**Why it happens:** Documentation-first phases often stay so high-level that they do not map real files or subsystems. [ASSUMED]
**How to avoid:** Name the concrete shared seams now: `bin/install.js`, runtime conversion logic, Hermes docs, Hermes tests, and `.planning/` governance artifacts. [VERIFIED: upstream repo clone + 01-CONTEXT.md]
**Warning signs:** Planner tasks say “add Hermes support” without naming ownership boundaries. [ASSUMED]

### Pitfall 3: Planning against the wrong Node baseline
**What goes wrong:** Later work assumes the current local Node runtime is good enough, but upstream currently declares `>=22.0.0` and the local machine is on Node 20. [VERIFIED: upstream package.json + local `node --version`]
**Why it happens:** Phase 1 is doc-heavy, so environment prerequisites can be missed. [ASSUMED]
**How to avoid:** Capture the Node 22+ requirement in the research and environment sections now so later plans treat upgrade as prerequisite work. [VERIFIED: upstream package.json + local `node --version`]
**Warning signs:** A plan schedules `npm install` or `npm test` without a Node version check. [VERIFIED: upstream package.json]

### Pitfall 4: Reusing upstream architecture words without matching upstream structure
**What goes wrong:** Docs refer to an “adapter layer” in abstract terms, but the actual upstream tree remains opaque to maintainers. [VERIFIED: REQUIREMENTS.md + upstream repo clone]
**Why it happens:** It is easy to talk about clean boundaries before looking at the upstream repository. [ASSUMED]
**How to avoid:** Tie every boundary document back to the verified upstream root tree and installer/test seams. [VERIFIED: upstream repo clone + docs/ARCHITECTURE.md]
**Warning signs:** The ownership doc has categories like “core/runtime/extensions” but does not map them to actual directories or files. [ASSUMED]

## Code Examples

Verified patterns from official sources:

### Configure and Verify `upstream`
```bash
# Source:
# - https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/configuring-a-remote-repository-for-a-fork?platform=mac
git remote -v
git remote add upstream https://github.com/gsd-build/get-shit-done.git
git remote -v
```
This is the canonical fork-remote setup GitHub documents for a forked repository. [CITED: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/configuring-a-remote-repository-for-a-fork?platform=mac]

### Steady-State Upstream Sync
```bash
# Source:
# - https://docs.github.com/github/collaborating-with-pull-requests/working-with-forks/merging-an-upstream-repository-into-your-fork?platform=mac
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```
GitHub documents this exact fetch-and-merge flow for keeping a fork in sync with its upstream default branch. [CITED: https://docs.github.com/github/collaborating-with-pull-requests/working-with-forks/merging-an-upstream-repository-into-your-fork?platform=mac]

### Runtime Boundary Heuristic
```text
If a change touches workflow behavior broadly, default to "upstream-owned".
If a change adds runtime path/config/conversion logic, default to "adapter seam".
If a change records project policy, compatibility truth, or sync rules, default to "downstream governance".
```
This heuristic is derived from the locked decisions plus the verified upstream split between command/workflow layers and installer/runtime layers. [VERIFIED: 01-CONTEXT.md + PROJECT.md + upstream `docs/ARCHITECTURE.md` + upstream repo clone]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `gsd-tools.cjs` as the only orchestration surface. [VERIFIED: upstream docs] | Upstream docs now prefer `gsd-sdk query` where a typed handler exists and keep `gsd-tools.cjs` for gaps like `graphify`. [VERIFIED: upstream `docs/CLI-TOOLS.md` clone + code search] | Present in upstream `1.37.1` docs as observed on 2026-04-18. [VERIFIED: upstream package.json + upstream docs clone] | Hermes planning should fit the current dual-surface contract instead of introducing a third orchestration mechanism. [VERIFIED: upstream docs clone] |
| Runtime installs could be imagined as ad hoc per-runtime scripts. [ASSUMED] | Upstream now centralizes multi-runtime selection, path ownership, and conversion helpers in `bin/install.js`. [VERIFIED: upstream repo clone + code search in `bin/install.js`] | Present in current upstream `main` and package `1.37.1` observed on 2026-04-18. [VERIFIED: upstream repo clone + upstream package.json] | Hermes should be introduced by extending the existing installer seam, not by creating a parallel installer architecture. [VERIFIED: upstream repo clone] |

**Deprecated/outdated:**
- Writing new workflow docs around the assumption that `gsd-sdk query` is unavailable is outdated for the current upstream baseline, although the current local machine’s installed standalone `gsd-sdk` did not expose `query` outside the imported upstream tree during this research session. The planner should therefore document against upstream source contracts, not against whichever globally installed helper happened to be on this workstation. [VERIFIED: upstream docs/code search + local `gsd-sdk` invocation]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A nested vendor/subtree layout would make runtime path assumptions less faithful to upstream than a root-preserving fork. [ASSUMED] | Standard Stack / Alternatives | Low — the user already locked root preservation, so this only affects rationale wording. |
| A2 | Rebase/cherry-pick maintenance would reduce traceability relative to merge-based sync in this fork. [ASSUMED] | Standard Stack / Alternatives | Low — the user already locked merge-based sync, so this only affects explanatory framing. |
| A3 | Creating a separate Hermes-only installer would duplicate upstream runtime ownership logic enough to be meaningfully worse than extending `bin/install.js`. [ASSUMED] | Don't Hand-Roll | Medium — if upstream later refactors installer ownership, the exact seam may move. |
| A4 | Abstract boundary docs without concrete file mapping will likely confuse later planners. [ASSUMED] | Common Pitfalls | Low — even if overstated, naming actual surfaces is still useful for ARCH-01. |

## Open Questions (RESOLVED)

1. **Should Phase 1 add the `upstream` remote immediately, or only document the command?** [VERIFIED: local repo state + 01-CONTEXT.md]
Resolution: Phase 1 adds the `upstream` remote now so the fork already matches D-04 at the repo-config level, while still keeping the phase documentation-first because no upstream code import or runtime implementation is executed. [VERIFIED: 01-CONTEXT.md; inference from locked D-04 plus the approved plan scope]
Why this resolution fits scope: Adding the remote is a narrow git-configuration step that establishes fork topology without expanding into Hermes parity work or heavy validation forbidden by D-08. [VERIFIED: 01-CONTEXT.md + ROADMAP.md]

2. **Should the first unrelated-histories merge happen in Phase 1 or Phase 2?** [VERIFIED: local repo tree + ROADMAP.md]
Resolution: Phase 1 documents the first-import procedure, including `git merge --allow-unrelated-histories upstream/main`, but does not execute that import. The first upstream import remains a later execution step after the governance boundary docs are in place. [VERIFIED: 01-CONTEXT.md + ROADMAP.md; inference from locked D-07 and D-08]
Why this resolution fits scope: The runbook must explain the structurally different first import now, but executing it in Phase 1 would move beyond the documentation-first baseline deliverables. [VERIFIED: local repo tree + 01-CONTEXT.md + git-scm.com/docs/git-merge]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `git` | Remote setup, initial import, ongoing upstream merges | ✓ [VERIFIED: local `git --version`] | `2.34.1` [VERIFIED: local `git --version`] | — |
| `node` | Upstream installer/test runtime after import | ✗ (below required floor) [VERIFIED: upstream package.json + local `node --version`] | local `v20.19.5`; upstream requires `>=22.0.0` [VERIFIED: upstream package.json + local `node --version`] | Upgrade Node before any upstream `npm install` / `npm test` work. [VERIFIED: upstream package.json] |
| `npm` | Upstream dependency restore and package scripts | ✓ [VERIFIED: local `npm --version`] | `10.8.2` [VERIFIED: local `npm --version`] | — |
| `gh` | Optional maintainer convenience for repo inspection | ✓ [VERIFIED: local `gh --version`] | `2.88.1` [VERIFIED: local `gh --version`] | Plain git commands. [VERIFIED: docs.github.com fork docs] |

**Missing dependencies with no fallback:**
- Node 22+ for any plan step that imports upstream dependencies or runs upstream package scripts. [VERIFIED: upstream package.json + local `node --version`]

**Missing dependencies with fallback:**
- None for the documentation-only portion of Phase 1. [VERIFIED: 01-CONTEXT.md + local environment audit]

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None in the local `gsd-hermes` fork yet; upstream baseline after import is `npm test` via `node scripts/run-tests.cjs` plus Vitest projects for `sdk/`. [VERIFIED: local repo tree + upstream package.json + upstream `sdk/vitest.config.ts`] |
| Config file | none locally; upstream target is `sdk/vitest.config.ts` after import. [VERIFIED: local repo tree + upstream repo clone] |
| Quick run command | none yet for the local fork; Phase 1 validation is document/state based. [VERIFIED: local repo tree + ROADMAP.md] |
| Full suite command | none yet locally; upstream target after import is `npm test`. [VERIFIED: local repo tree + upstream package.json] |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ARCH-01 | Ownership boundaries are explicit enough that a maintainer can tell upstream vs Hermes vs downstream governance surfaces. [VERIFIED: REQUIREMENTS.md] | manual / doc audit [VERIFIED: REQUIREMENTS.md + phase scope] | `rg -n "upstream|Hermes|local enhancement|ownership" docs .planning AGENTS.md` [ASSUMED] | ❌ Wave 0 [VERIFIED: local repo tree] |
| ARCH-02 | Sync routine is explicit enough that a maintainer can configure remotes and follow the merge path without guessing. [VERIFIED: REQUIREMENTS.md] | manual / git-state audit [VERIFIED: REQUIREMENTS.md + phase scope] | `git remote -v && rg -n "git remote add upstream|git fetch upstream|git merge upstream/main" docs .planning AGENTS.md` [ASSUMED] | ❌ Wave 0 [VERIFIED: local repo tree] |

### Sampling Rate
- **Per task commit:** Document diff review plus relevant `rg`/`git remote -v` sanity check. [VERIFIED: phase scope + local git availability]
- **Per wave merge:** Re-run document/state checks and confirm sync runbook still matches current repo state. [VERIFIED: local git state + phase scope]
- **Phase gate:** ARCH-01 and ARCH-02 artifacts exist, are internally consistent, and do not promise runtime behavior that Phase 1 does not implement. [VERIFIED: REQUIREMENTS.md + 01-CONTEXT.md]

### Wave 0 Gaps
- [ ] No local upstream source tree yet, so there is no imported test harness or doc verification tooling to lean on. [VERIFIED: local repo tree]
- [ ] No local Phase 1 governance docs exist yet beyond planning/context artifacts, so ARCH-01 and ARCH-02 currently have nothing concrete to audit. [VERIFIED: local repo tree + ROADMAP.md]
- [ ] Node 22+ is not installed locally, which blocks future upstream package-script validation after import. [VERIFIED: upstream package.json + local `node --version`]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no [VERIFIED: Phase 1 scope] | Not applicable to documentation-only fork-foundation work. [VERIFIED: ROADMAP.md + 01-CONTEXT.md] |
| V3 Session Management | no [VERIFIED: Phase 1 scope] | Not applicable to documentation-only fork-foundation work. [VERIFIED: ROADMAP.md + 01-CONTEXT.md] |
| V4 Access Control | no [VERIFIED: Phase 1 scope] | No user-facing authorization surface is introduced in Phase 1. [VERIFIED: ROADMAP.md + REQUIREMENTS.md] |
| V5 Input Validation | yes [VERIFIED: upstream architecture + future installer surface] | Keep future Hermes install/sync work inside upstream installer/security seams and avoid custom shell-evaluated sync helpers. [VERIFIED: upstream `docs/ARCHITECTURE.md` + upstream `bin/install.js`] |
| V6 Cryptography | no [VERIFIED: Phase 1 scope] | No cryptographic behavior is introduced in Phase 1. [VERIFIED: ROADMAP.md + 01-CONTEXT.md] |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path/config drift causes the wrong runtime config tree to be edited later. [VERIFIED: upstream multi-runtime installer structure] | Tampering | Keep runtime path logic centralized in installer helpers and boundary docs rather than scattering hard-coded Hermes paths. [VERIFIED: upstream `bin/install.js` + PROJECT.md] |
| Overstated compatibility docs hide unsupported behavior. [VERIFIED: project constraints] | Spoofing | Publish a compatibility matrix and known-gaps inventory that explicitly marks “not implemented yet” surfaces. [VERIFIED: 01-CONTEXT.md + PROJECT.md + REQUIREMENTS.md] |
| Custom sync scripts or ad hoc shell snippets introduce unsafe git/path handling later. [ASSUMED] | Tampering | Use standard git commands and documented runbooks instead of custom shell wrappers. [VERIFIED: git-scm.com/docs/git-remote + git-scm.com/docs/git-merge] |

## Sources

### Primary (HIGH confidence)
- `.planning/phases/01-fork-foundation/01-CONTEXT.md` - locked decisions, phase scope, deliverables. [VERIFIED: local file]
- `.planning/REQUIREMENTS.md` - ARCH-01 and ARCH-02 definitions. [VERIFIED: local file]
- `.planning/ROADMAP.md` - phase goal, success criteria, and planned decomposition. [VERIFIED: local file]
- `.planning/PROJECT.md` - core constraints and maintainability rules. [VERIFIED: local file]
- `AGENTS.md` - repo-level runtime/project constraints. [VERIFIED: local file]
- Upstream repo `https://github.com/gsd-build/get-shit-done` - verified by shallow clone and code search for repo layout, installer seams, docs, and tests. [VERIFIED: upstream repo clone + code search]
- GitHub Docs: configuring a fork remote - https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/configuring-a-remote-repository-for-a-fork?platform=mac [CITED: docs.github.com]
- GitHub Docs: syncing a fork - https://docs.github.com/github/collaborating-with-pull-requests/working-with-forks/merging-an-upstream-repository-into-your-fork?platform=mac [CITED: docs.github.com]
- Git docs: `git-remote` - https://git-scm.com/docs/git-remote [CITED: git-scm.com]
- Git docs: `git-merge` - https://git-scm.com/docs/git-merge [CITED: git-scm.com]
- npm registry for `get-shit-done-cc`, `vitest`, `esbuild`, and `c8`. [VERIFIED: npm registry]

### Secondary (MEDIUM confidence)
- Upstream `docs/ARCHITECTURE.md` and `docs/CLI-TOOLS.md` from the shallow clone - architecture and query-surface guidance. [VERIFIED: upstream repo clone]

### Tertiary (LOW confidence)
- None. [VERIFIED: this research session]

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - upstream package metadata, current registry data, and local environment state were directly verified. [VERIFIED: upstream package.json + npm registry + local environment audit]
- Architecture: MEDIUM - the upstream seams are verified, but the exact Hermes implementation seam placement is still forward-looking because the fork has not imported upstream code yet. [VERIFIED: upstream repo clone + local repo state]
- Pitfalls: MEDIUM - the repo-state and engine-version pitfalls are verified, while some documentation-quality failure modes are informed by experience and marked as assumptions where necessary. [VERIFIED: local repo state + upstream package.json] [ASSUMED]

**Research date:** 2026-04-18 [VERIFIED: local system date]
**Valid until:** 2026-04-25 because upstream `main` and the package release train are active and could shift quickly. [VERIFIED: npm registry modification date + upstream remote heads]

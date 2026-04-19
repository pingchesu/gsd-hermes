# Pitfalls Research: gsd-hermes

**Researched:** 2026-04-18  
**Confidence:** Medium

## Pitfall 1: Workflow divergence from upstream

**What goes wrong:** Hermes support leaks into many workflow files and makes
upstream sync expensive.

**Warning signs:**

- many workflow markdown files forked early
- frequent merge conflicts outside installer/runtime code
- bug fixes must be applied twice

**Prevention:**

- enforce a GSD-first adapter strategy
- isolate Hermes changes to installer, conversion, tests, and shims
- document when workflow edits are unavoidable

**Phase mapping:** Early architecture and adapter phases

## Pitfall 2: Treating `external_dirs` as true local install

**What goes wrong:** Docs overpromise local install behavior that Hermes does
not natively provide.

**Warning signs:**

- inconsistent skill visibility between projects
- users think uninstall is repo-local when global config still references paths
- confusing bug reports around path persistence

**Prevention:**

- call it `project-linked install`
- document exactly how `external_dirs` works
- add doctor checks for stale `external_dirs` entries

**Phase mapping:** Installer and docs phases

## Pitfall 3: Command surface appears but workflows are broken

**What goes wrong:** `/gsd-*` commands load, but runtime-specific behavior fails
deep in execution.

**Warning signs:**

- install success with execution failure
- planning artifacts partially written
- workflow smoke tests pass only superficially

**Prevention:**

- build end-to-end smoke paths for core workflows
- test init, planning, execution, and update flows
- accept temporary shims but document degraded behavior

**Phase mapping:** Compatibility and verification phases

## Pitfall 4: Sync discipline never becomes operational

**What goes wrong:** The fork starts strong but upstream drift accumulates until
Hermes support falls behind.

**Warning signs:**

- large sync jumps instead of small updates
- no clearly owned Hermes patch surface
- no compatibility checklist after merges

**Prevention:**

- define an upstream sync routine early
- maintain Hermes regression tests before widening scope
- keep a change log of local-only patches

**Phase mapping:** Ongoing maintenance phase

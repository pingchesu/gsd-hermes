# Research Summary: gsd-hermes

**Date:** 2026-04-18

## Key Findings

**Stack:** Keep get-shit-done as the base system and extend it through a bounded
Hermes adapter layer rather than rewriting the workflow core.

**Table Stakes:** Hermes must be installable as a runtime, surface `/gsd-*`
commands, and run the core GSD workflow path with stable `.planning/` artifact
behavior.

**Watch Out For:** The biggest risks are upstream workflow divergence,
overclaiming Hermes local install semantics, and letting install success hide
runtime incompatibility deeper in the workflow.

## Recommended Product Shape

- Full downstream fork
- GSD-first engineering strategy
- Hermes adapter concentrated in installer, conversion, docs, and tests
- Global install as the primary path
- Project-linked install via `skills.external_dirs` as a supported secondary
  path

## Roadmap Implications

### Phase 1 candidate

Establish the fork, define adapter boundaries, and add a Hermes runtime skeleton
to the installer.

### Phase 2 candidate

Make Hermes discover `/gsd-*` commands through converted skills and validate the
basic command surface.

### Phase 3 candidate

Run core workflow compatibility end-to-end and close the highest-value parity
gaps before adding lifecycle niceties.

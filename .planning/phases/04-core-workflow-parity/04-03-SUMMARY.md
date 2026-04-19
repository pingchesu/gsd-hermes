---
phase: 04-core-workflow-parity
plan: 03
subsystem: docs
tags: [hermes, degraded-paths, runtime-guidance, compatibility]

requires:
  - phase: 04-02-workflow-path-hardening
    provides: "Hermes-safe copied workflow paths and core fixture tests"
provides:
  - "Hermes runtime compatibility note in generated skills"
  - "Core workflow smoke docs with degraded-path guidance"
  - "Compatibility matrix updated to supported with degraded paths"
affects: [04-04-core-smoke, hermes-docs, hermes-installer]

tech-stack:
  added: []
  patterns: [generated-skill-runtime-note, supported-with-degraded-paths-docs]

key-files:
  created:
    - .planning/phases/04-core-workflow-parity/04-03-SUMMARY.md
  modified:
    - bin/install.js
    - tests/hermes-core-workflow.test.cjs
    - docs/hermes-install.md
    - docs/hermes-compatibility.md
    - tests/hermes-docs.test.cjs

key-decisions:
  - "Post-process generated Hermes skills to add compatibility guidance instead of duplicating the full Claude skill converter."
  - "Document Phase 4 as supported with degraded paths, not full native parity."

requirements-completed: [FLOW-03]

duration: 8min
completed: 2026-04-19
---

# Phase 4 Plan 03 Summary

Added explicit Hermes degraded-path guidance to generated skills and updated
Hermes docs so Phase 4 claims core workflow execution only as supported with
documented fallbacks.

## Accomplishments

- Added `appendHermesRuntimeNote()` and routed generated Hermes skills through
  it after skill conversion.
- Added regression coverage proving `gsd-plan-phase/SKILL.md` includes fallback
  guidance for unavailable `AskUserQuestion` and `Task` style capabilities.
- Added `Core Workflow Smoke` docs and updated compatibility matrix wording to
  `supported with degraded paths`.

## Deviations from Plan

The plan described injecting the note before write. The implementation
post-processes generated Hermes skills after the shared Claude skill converter
runs. This keeps Hermes behavior in the explicit `copyCommandsAsHermesSkills()`
adapter seam without duplicating upstream converter logic.

## Verification

- `node --test tests/hermes-docs.test.cjs`
- `node --test tests/hermes-core-workflow.test.cjs`

## Self-Check: PASSED

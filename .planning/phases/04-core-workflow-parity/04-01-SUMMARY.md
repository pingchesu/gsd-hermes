---
phase: 04-core-workflow-parity
plan: 01
subsystem: tests
tags: [hermes, core-workflow, fixture-tests, skills]

requires:
  - phase: 03-hermes-command-discovery
    provides: "Hermes global and project-linked command discovery"
  - phase: 04-core-workflow-parity
    provides: "Phase 4 context, research, and validation contract"
provides:
  - "Deterministic Hermes core lifecycle skill fixture suite"
  - "Global and project-linked assertions for the FLOW-01/FLOW-02 command set"
affects: [04-02-workflow-path-hardening, 04-03-degraded-path-guidance, 04-04-core-smoke]

tech-stack:
  added: []
  patterns: [sandboxed-installer-fixture, core-skill-contract-test]

key-files:
  created:
    - tests/hermes-core-workflow.test.cjs
    - .planning/phases/04-core-workflow-parity/04-01-SUMMARY.md
  modified: []

key-decisions:
  - "Use generated skill directories and frontmatter as deterministic CI proof of core command availability."
  - "Keep real Hermes CLI execution out of 04-01 so CI remains independent of local runtime availability."

requirements-completed: []

duration: 6min
completed: 2026-04-19
---

# Phase 4 Plan 01 Summary

Added `tests/hermes-core-workflow.test.cjs`, which installs Hermes into temp
`HOME` and temp project fixtures and asserts the core lifecycle skills exist in
both global and project-linked modes.

## Accomplishments

- Defined the exact Phase 4 core skill set: `gsd-new-project`,
  `gsd-discuss-phase`, `gsd-plan-phase`, `gsd-execute-phase`,
  `gsd-verify-work`, `gsd-progress`, `gsd-settings`, and `gsd-update`.
- Verified global Hermes fixture installs generate command-discoverable
  `SKILL.md` frontmatter for every core lifecycle skill.
- Verified project-linked Hermes fixture installs generate the same skill set
  under `.gsd-hermes/skills` and register one `skills.external_dirs` entry.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `node --test tests/hermes-core-workflow.test.cjs`

## Self-Check: PASSED

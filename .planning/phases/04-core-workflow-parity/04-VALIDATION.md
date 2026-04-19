---
phase: 04-core-workflow-parity
validation_version: 1
created: 2026-04-19
---

# Phase 4 Validation Strategy

## Validation Architecture

Phase 4 is runtime adapter work. The validation strategy must verify generated
Hermes artifacts and fixture installs without requiring an interactive Hermes
runtime in CI.

## Required Dimensions

| Dimension | Required Evidence |
| --- | --- |
| Install fixture | `--hermes --global --no-sdk` and `--hermes --local --no-sdk` run in temp `HOME` and temp project dirs. |
| Core skill set | Installed Hermes skills include `gsd-new-project`, `gsd-discuss-phase`, `gsd-plan-phase`, `gsd-execute-phase`, `gsd-verify-work`, `gsd-progress`, `gsd-settings`, and `gsd-update`. |
| Path safety | Installed Hermes command/workflow docs contain no executable `~/.claude` or `$HOME/.claude` references outside changelog/history files. |
| Degraded path | Generated Hermes skill or docs explain text-mode/sequential fallback for unavailable `AskUserQuestion` and `Task` style capabilities. |
| Optional runtime smoke | Real Hermes CLI check is skipped clearly when `hermes` is missing and does not fail CI for absence alone. |

## Gate Criteria

- All deterministic Node tests for Hermes install and workflow parity pass.
- The full `npm test` suite remains green after Phase 4.
- Any real Hermes smoke result is captured as pass, skip, or fail evidence.

## Non-Goals

- No production dependency on a real Hermes binary in CI.
- No native local Hermes install claim.
- No complete lifecycle update/uninstall/doctor validation in this phase.

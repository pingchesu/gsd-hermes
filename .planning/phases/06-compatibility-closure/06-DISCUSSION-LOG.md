# Phase 6: Compatibility Closure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 06-compatibility-closure
**Areas discussed:** Parity closure strategy, Upstream sync operating model, Compatibility evidence and reporting, Maintenance boundaries

---

## Parity Closure Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Supported workflow parity | Treat near-parity as parity for install, command discovery, core lifecycle, lifecycle tooling, and docs, with degraded paths where Hermes lacks exact primitives. | yes |
| Absolute Claude parity | Require Hermes to match every Claude-native behavior before closure. | |
| Docs-only closure | Avoid more code/tests and only document remaining gaps. | |

**User's choice:** Auto-selected supported workflow parity.
**Notes:** Recommended because previous phases already validated a scoped Hermes support surface and the project explicitly accepts degraded paths when exact parity is not possible.

---

## Upstream Sync Operating Model

| Option | Description | Selected |
|--------|-------------|----------|
| Merge-first checklist | Preserve the Phase 1 merge-based upstream flow and add concrete validation/checklist steps. | yes |
| Rebase/cherry-pick routine | Replace merge history with a cleaner-looking but less traceable maintenance model. | |
| Copy-over sync | Periodically copy upstream files into the fork manually. | |

**User's choice:** Auto-selected merge-first checklist.
**Notes:** Recommended because `docs/upstream-sync.md` already locks merge history as the maintainable fork model.

---

## Compatibility Evidence and Reporting

| Option | Description | Selected |
|--------|-------------|----------|
| Test-linked compatibility matrix | Tie compatibility status to deterministic tests, known gaps, and validation commands. | yes |
| Narrative-only compatibility docs | Explain support boundaries without making them regression-checkable. | |
| Full runtime-only evidence | Require real Hermes CLI in every validation run. | |

**User's choice:** Auto-selected test-linked compatibility matrix.
**Notes:** Recommended because real Hermes may be unavailable in CI, while fixture-based tests already provide deterministic evidence.

---

## Maintenance Boundaries

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve current runtime vocabulary | Keep npm/npx installer flags and `/gsd-*` commands, with truthful global/project-linked language. | yes |
| Add Hermes-only command vocabulary | Add separate Hermes-specific command names for lifecycle and compatibility. | |
| Claim native local install | Treat project-linked mode as a native local Hermes install. | |

**User's choice:** Auto-selected preserve current runtime vocabulary.
**Notes:** Recommended because Phase 5 explicitly avoided Hermes-only vocabulary and the project must not claim native local Hermes skill install support.

---

## the agent's Discretion

- Exact checklist structure and whether to add a helper script.
- Exact compatibility matrix grouping, as long as status language remains truthful and test-linked.
- Exact test assertion placement across existing Hermes test files.

## Deferred Ideas

- Native local Hermes skill installation.
- Hermes-native enhancements beyond upstream parity.
- Optional plugin-assisted compatibility reporting.

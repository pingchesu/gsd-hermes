# Phase 1: Fork Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-18T23:01:53+08:00
**Phase:** 01-fork-foundation
**Areas discussed:** Repository Structure, Upstream Sync Strategy, Phase 1 Compatibility Baseline

---

## Repository Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Keep upstream layout at repo root | Preserve upstream `get-shit-done` structure and isolate Hermes changes to focused adapter areas | ✓ |
| Vendor/subtree layout | Put upstream inside a nested directory and wrap it externally with Hermes-specific scaffolding | |
| Freely restructure for clarity | Reorganize the repo to optimize for local readability even if sync cost rises | |

**User's choice:** Keep upstream layout at repo root
**Notes:** The goal is to minimize upstream sync cost and keep Hermes support concentrated in installer, conversion, docs, tests, and other targeted adapter layers.

---

## Upstream Sync Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Regular merge from upstream/main into main | Keep visible merge history and make Hermes-specific conflicts easy to track | ✓ |
| Regular rebase onto upstream/main | Linear history, but repeated history rewriting increases maintenance pain | |
| Cherry-pick selected upstream changes | Maximum control, but quickly drifts away from full-fork behavior | |

**User's choice:** Regular merge from upstream/main into main
**Notes:** The fork should use an `upstream` remote and merge upstream changes into `main` rather than rebasing or selectively cherry-picking.

---

## Phase 1 Compatibility Baseline

| Option | Description | Selected |
|--------|-------------|----------|
| Documentation-first baseline | Define compatibility matrix, adapter guardrails, sync rules, and known gaps before runtime implementation | ✓ |
| Docs + light executable baseline | Add a small runtime probe or smoke checklist during Phase 1 | |
| Comprehensive baseline now | Build broad parity validation immediately in the foundation phase | |

**User's choice:** Documentation-first baseline
**Notes:** Phase 1 should establish governance and structure, not spill into the runtime implementation responsibilities of later phases.

---

## the agent's Discretion

- Final naming and exact structure of the governance artifacts created in Phase 1.
- How to split the documentation-first baseline across the three planned tasks in this phase.

## Deferred Ideas

None.

---

*Phase: 01-fork-foundation*
*Discussion log generated: 2026-04-18T23:01:53+08:00*

# Phase 1: Fork Foundation - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Define the foundational structure for `gsd-hermes` as a maintainable full fork of
`get-shit-done`, including repo layout rules, upstream sync discipline, and the
initial compatibility-governance artifacts that will guide later Hermes runtime work.
This phase does not implement Hermes runtime support yet.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Definition
- `.planning/PROJECT.md` — project identity, constraints, and already-locked fork strategy decisions
- `.planning/REQUIREMENTS.md` — Phase 1 requirement targets (`ARCH-01`, `ARCH-02`) and maintainability constraints
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, and initial plan breakdown
- `.planning/STATE.md` — current project position and recorded blockers

### Research Basis
- `.planning/research/SUMMARY.md` — synthesized recommendation for full-fork + GSD-first adapter strategy
- `.planning/research/ARCHITECTURE.md` — proposed three-layer architecture for upstream base, Hermes adapter, and distribution lifecycle
- `.planning/research/STACK.md` — recommended technical base and runtime integration direction
- `.planning/research/PITFALLS.md` — known failure modes to avoid while structuring the fork

### Runtime Contract
- `AGENTS.md` — project-level contract generated from planning artifacts; use as the runtime-facing summary, not as a substitute for the planning docs above

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.planning/` project artifacts — already define the fork intent, constraints, roadmap, and research basis for Phase 1
- `AGENTS.md` — generated runtime-facing summary that should stay aligned with the planning artifacts

### Established Patterns
- The repository is still pre-code for product implementation; no upstream `get-shit-done` source has been imported yet
- Planning-first workflow is already in effect, so Phase 1 should produce governance artifacts before code movement or runtime edits

### Integration Points
- Future upstream import will land at the repository root
- Hermes-specific changes are expected to integrate primarily around installer/runtime files, generated skill/agent surfaces, compatibility docs, and regression tests

</code_context>

<specifics>
## Specific Ideas

- `gsd-opencode` is the closest precedent for a downstream runtime-focused port, but
  this project should be more explicit about fork governance and upstream sync
  discipline.
- Project-linked Hermes install must be described truthfully as an
  `external_dirs`-based bridge mode, not as a native local runtime install.
- Phase 1 should create the documents that later phases can enforce against,
  rather than trying to validate Hermes parity before the adapter exists.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-fork-foundation*
*Context gathered: 2026-04-18*

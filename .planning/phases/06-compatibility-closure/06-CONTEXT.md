# Phase 6: Compatibility Closure - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Lock in near-parity for the Hermes surfaces already shipped in Phases 2-5 and
make upstream sync repeatable enough for routine maintenance. This phase is the
closure pass for COMP-01 and COMP-02: supported Hermes workflows should behave
like upstream GSD where Hermes can support them, and any remaining drift should
be visible, bounded, tested, and documented.

This phase is not a native Hermes-local-install project and not a broad rewrite
of upstream GSD workflows. Project-linked mode remains an `external_dirs`
bridge. Unsupported Hermes runtime primitives should keep documented degraded
paths instead of being presented as exact parity.

</domain>

<decisions>
## Implementation Decisions

### Parity Closure Strategy
- **D-01:** Define "near-parity" as supported workflow parity, not absolute
  Claude feature parity. The supported Phase 6 surface is install, command
  discovery, core GSD lifecycle commands, update, uninstall, doctor,
  compatibility docs, and upstream-sync validation.
- **D-02:** Close only high-value parity gaps that are reproducible through
  deterministic tests, install fixtures, docs assertions, or explicit manual
  smoke instructions. Do not chase every upstream wording difference.
- **D-03:** Existing Hermes regression tests are the Phase 6 baseline:
  `tests/hermes-core-workflow.test.cjs`, `tests/hermes-lifecycle.test.cjs`,
  `tests/hermes-docs.test.cjs`, and `tests/multi-runtime-select.test.cjs`.
- **D-04:** The Phase 2 deferred `~/.claude` leak is in scope only if still
  reproducible as an executable path leak or misleading installed Hermes
  content. Fix concrete runtime/content leaks; do not perform broad prose
  rewrites for upstream-owned documents.
- **D-05:** Exact Hermes CLI smoke remains optional and probe-gated. Missing
  `hermes` on `PATH` is a skipped diagnostic, not a deterministic failure.

### Upstream Sync Operating Model
- **D-06:** Preserve the merge-first upstream sync model from
  `docs/upstream-sync.md`. Phase 6 should improve checklist quality and
  validation, not switch to rebase-only, cherry-pick-only, or copy-over
  maintenance.
- **D-07:** A routine upstream sync must start from a clean tree, fetch
  `upstream/main`, merge into the downstream branch, classify conflicts by
  ownership surface, run targeted Hermes tests, and then run the broader test
  suite when feasible.
- **D-08:** Conflict and drift review should classify every relevant change as
  `Upstream base`, `Hermes adapter seam`, or `Downstream governance` using
  `docs/fork-ownership.md`.
- **D-09:** If upstream changes internals in a way Hermes cannot support
  immediately, the correct result is a visible known gap or degraded path, not
  hidden divergence that pretends parity exists.

### Compatibility Evidence and Reporting
- **D-10:** The compatibility matrix should become an ongoing maintenance
  artifact tied to test evidence, known gaps, and validation commands.
- **D-11:** Phase 6 should make release-blocker vs warning criteria explicit:
  install/command discovery/core lifecycle/lifecycle safety regressions block
  release; optional real Hermes CLI unavailability is a warning/skip.
- **D-12:** Drift visibility matters more than zero drift. Hermes-specific
  changes are acceptable when they stay inside the adapter seam or downstream
  governance docs and are covered by focused tests.
- **D-13:** Documentation should tell maintainers exactly which commands prove
  compatibility after upstream sync, including targeted Hermes tests and the
  broader `npm test` gate when feasible.

### Maintenance Boundaries
- **D-14:** Keep runtime vocabulary unchanged: use existing npm/npx installer
  flags and `/gsd-*` command names. Do not introduce Hermes-only command names
  in Phase 6.
- **D-15:** Do not claim native local Hermes install. Continue describing local
  selection as project-linked mode through `skills.external_dirs`.
- **D-16:** Do not make MCP mandatory for Hermes operation. Hermes support
  should work through the installer, generated skills, docs, and existing CLI
  validation first.

### the agent's Discretion
- Exact checklist formatting and whether to add a small helper script for
  compatibility validation.
- Exact grouping of compatibility matrix rows, as long as the status language
  stays truthful and test-linked.
- Exact test names or assertions for parity closure, provided they reuse the
  existing temp `HOME` and temp project fixture patterns.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Definition
- `.planning/ROADMAP.md` - Phase 6 goal, success criteria, and planned work
  items.
- `.planning/REQUIREMENTS.md` - COMP-01 and COMP-02 plus completed v1
  requirement traceability.
- `.planning/PROJECT.md` - GSD-first fork goal, maintainability constraints,
  and runtime truthfulness boundary.
- `.planning/STATE.md` - current focus, deferred Hermes content conversion
  concern, and Phase 6 readiness.

### Prior Phase Context
- `.planning/phases/01-fork-foundation/01-CONTEXT.md` - fork ownership,
  adapter seam, and upstream sync discipline.
- `.planning/phases/03-hermes-command-discovery/03-CONTEXT.md` - global and
  project-linked command discovery decisions.
- `.planning/phases/04-core-workflow-parity/04-CONTEXT.md` - core lifecycle
  parity decisions, fallback policy, and high-value workflow scope.
- `.planning/phases/04-core-workflow-parity/04-04-SUMMARY.md` - final core
  workflow smoke verification and optional real Hermes boundary.
- `.planning/phases/05-lifecycle-tooling/05-CONTEXT.md` - lifecycle command,
  doctor, update, uninstall, and documentation decisions.
- `.planning/phases/05-lifecycle-tooling/05-04-SUMMARY.md` - final lifecycle
  docs and test evidence for Phase 5 closure.

### Governance and Docs
- `docs/fork-ownership.md` - ownership labels and change routing rules.
- `docs/upstream-sync.md` - current merge-first upstream sync workflow.
- `docs/hermes-compatibility.md` - current compatibility matrix and guardrails.
- `docs/hermes-install.md` - install modes, command discovery, lifecycle
  commands, smoke checks, and known boundaries.
- `docs/README.md` - docs index that should surface compatibility and sync
  guidance.

### Implementation and Test Surfaces
- `bin/install.js` - Hermes runtime selection, skill generation, path
  conversion, lifecycle, doctor, and install finish output.
- `tests/hermes-core-workflow.test.cjs` - core lifecycle skill install,
  executable path leak, compatibility guidance, and optional real Hermes smoke.
- `tests/hermes-lifecycle.test.cjs` - update, uninstall, doctor, config
  cleanup, and lifecycle end-to-end coverage.
- `tests/hermes-docs.test.cjs` - docs and compatibility matrix assertions.
- `tests/multi-runtime-select.test.cjs` - installer runtime-selection
  regression coverage.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `copyCommandsAsHermesSkills()` and `appendHermesCompatibilitySection()` in
  `bin/install.js` are the current Hermes command conversion and guidance seam.
- `doctorHermesInstall()` in `bin/install.js` already detects missing skills,
  invalid skill frontmatter, executable Claude path leaks, duplicate/stale
  `external_dirs`, and manifest gaps.
- The Hermes tests already use isolated temp `HOME` and temp project
  directories; Phase 6 should extend that fixture style instead of touching the
  real user install.

### Established Patterns
- Hermes support is adapter-layer work in installer helpers, generated skill
  conversion, docs, and tests.
- Upstream-owned workflows should stay merge-friendly unless a proven Hermes
  incompatibility requires a bounded shim.
- Project-linked install is an accurate bridge mode through
  `skills.external_dirs`, not native local runtime support.
- Docs assertions are treated as regression tests for runtime truthfulness.

### Integration Points
- `docs/upstream-sync.md` needs a stronger routine validation checklist and
  release/blocker criteria.
- `docs/hermes-compatibility.md` should reflect Phase 6 closure evidence and
  ongoing known gaps.
- `docs/hermes-install.md` should link the final compatibility validation path
  without overstating exact runtime parity.
- Test coverage should prove no high-value parity closure regression across
  install, core workflow, lifecycle, docs, and runtime selection.

</code_context>

<specifics>
## Specific Ideas

- Add or document a single "post-upstream-sync validation" command sequence:
  targeted Hermes tests first, then full `npm test` when feasible.
- Convert the compatibility matrix from a static status table into a
  maintenance surface with test evidence and release-blocker notes.
- Add a drift review checklist that starts with `docs/fork-ownership.md` and
  explicitly prevents broad workflow rewrites unless a test proves the need.
- Re-check the installed Hermes copy for stale executable Claude paths as part
  of parity closure, because this was deferred earlier and now belongs to COMP
  closure.

</specifics>

<deferred>
## Deferred Ideas

- Native local Hermes skill installation remains out of scope unless Hermes
  adds a stable native local skill discovery contract.
- Hermes-native enhancements beyond upstream parity belong to v2 EXT-01.
- Additional optional plugin-assisted compatibility reporting belongs to v2
  EXT-02/ECO-02.

</deferred>

---

*Phase: 06-compatibility-closure*
*Context gathered: 2026-04-19*

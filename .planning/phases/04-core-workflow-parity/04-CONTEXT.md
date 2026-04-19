# Phase 4: Core Workflow Parity - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the core GSD development loop usable inside Hermes after Phase 3 command
discovery. This phase must prove that Hermes users can initialize a project,
run the main GSD lifecycle, and receive intentional fallback behavior where
exact runtime parity is not yet available.

The core success signal is not conversational style parity. The success signal
is standard GSD artifact creation and lifecycle continuity: `.planning/`
creation, discuss context, phase plans, execution summaries, progress/status
visibility, settings handling, update behavior, and clear degraded-path
messages when Hermes cannot match Claude-native runtime capabilities.

</domain>

<decisions>
## Implementation Decisions

### Core Workflow Smoke Ladder
- **D-01:** Validate Hermes workflow parity with a staged smoke ladder from
  low-risk to mutating commands: `/gsd-help`, `/gsd-progress`,
  `/gsd-new-project`, `/gsd-discuss-phase 1 --auto`, `/gsd-plan-phase`,
  `/gsd-execute-phase`, `/gsd-verify-work`, `/gsd-settings`, and
  `/gsd-update`.
- **D-02:** Treat generated GSD artifacts as the primary proof of parity:
  `.planning/PROJECT.md`, `.planning/config.json`, `.planning/REQUIREMENTS.md`,
  `.planning/ROADMAP.md`, `.planning/STATE.md`, phase `CONTEXT.md`, `PLAN.md`,
  `SUMMARY.md`, and UAT/progress artifacts where applicable.
- **D-03:** Do not expand Phase 4 into every `/gsd-*` command. Focus on the
  lifecycle commands required by FLOW-01 and FLOW-02; long-tail command parity
  belongs to later compatibility closure unless it blocks the core loop.

### Runtime Validation Strategy
- **D-04:** Automated tests should be deterministic and should not require a
  real Hermes binary in CI. Use sandboxed installer/skill/workflow checks as
  the baseline.
- **D-05:** If a real `hermes` CLI is available, smoke it only in disposable
  `HOME` and project directories, capture evidence, and avoid mutating the
  repo root or the user's real `~/.hermes`.
- **D-06:** Any manual Hermes smoke command must be optional or probe-gated.
  Missing Hermes should produce a skipped/diagnostic result, not a false test
  failure.

### Workflow and Content Compatibility
- **D-07:** Fix executable-blocking stale Claude references through the Hermes
  conversion/shim layer before editing upstream workflow markdown directly.
- **D-08:** Audit generated Hermes skills and the workflow paths they load for
  `~/.claude`, `$HOME/.claude`, `./.claude`, `CLAUDE.md`, Claude-specific tool
  assumptions, and stale user guidance. Replace only the references that affect
  Hermes execution or misleading operator output.
- **D-09:** Preserve the upstream workflow tree unless a Hermes incompatibility
  is proven by smoke evidence or test failure. Broad workflow rewrites increase
  sync cost and violate the fork ownership rules.

### Shims and Degraded Paths
- **D-10:** When Hermes cannot provide exact runtime behavior, fail clearly with
  Hermes-specific guidance or a documented shim. Do not silently claim parity.
- **D-11:** Prefer existing Node/CLI fallbacks (`gsd-tools.cjs`, installer
  helpers, filesystem artifact checks, and text-mode workflow branches) over
  Hermes-specific rewrites.
- **D-12:** Treat unavailable `AskUserQuestion`, `Task`, and other
  Claude-native tools as compatibility decisions, not runtime bugs. Hermes
  should either route through text/sequential fallback behavior or document the
  unsupported path.

### Fixture and Safety
- **D-13:** Mutating parity tests must run in temporary fixture workspaces with
  isolated `HOME`. They must not write `.planning/` artifacts into this repo
  root except for the Phase 4 planning documents themselves.
- **D-14:** Project-linked Hermes smoke should install to `.gsd-hermes/skills`
  in the fixture and register only the fixture path in the fixture
  `~/.hermes/config.yaml`.
- **D-15:** Tests should verify artifact shape and content contracts instead of
  relying on fragile interactive transcript matching.

### Scope Boundary
- **D-16:** Phase 4 may add compatibility shims, converter fixes, docs, and
  tests for `/gsd-new-project`, discuss, plan, execute, verify, progress,
  settings, and update.
- **D-17:** Full lifecycle tooling for update/uninstall/doctor remains Phase 5.
  Phase 4 can make `/gsd-update` fail clearly or smoke safely, but does not own
  complete Hermes lifecycle management.
- **D-18:** Upstream sync closure, broad parity matrix hardening, and native
  local Hermes install claims remain out of scope.

### the agent's Discretion
- Exact test file split, helper names, fixture layout, and evidence file names.
- Whether to add a Hermes-specific compatibility helper or extend existing
  conversion helpers, provided the adapter seam remains bounded.
- Exact degraded-path wording, provided it is truthful and actionable for
  Hermes users.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Definition
- `.planning/ROADMAP.md` - Phase 4 goal, success criteria, and 4 planned work items.
- `.planning/REQUIREMENTS.md` - FLOW-01, FLOW-02, and FLOW-03.
- `.planning/PROJECT.md` - GSD-first fork goal, Hermes runtime intent, and upstream-aligned constraints.
- `.planning/STATE.md` - current focus and known deferred Hermes path issues.

### Prior Phase Context
- `.planning/phases/01-fork-foundation/01-CONTEXT.md` - root-preserving fork structure and adapter seam rules.
- `.planning/phases/03-hermes-command-discovery/03-CONTEXT.md` - command discovery decisions and Phase 4 deferrals.
- `.planning/phases/03-hermes-command-discovery/03-01-SUMMARY.md` - global Hermes skill conversion seam and stale path regression.
- `.planning/phases/03-hermes-command-discovery/03-02-SUMMARY.md` - project-linked `.gsd-hermes/skills` and `skills.external_dirs`.
- `.planning/phases/03-hermes-command-discovery/03-03-SUMMARY.md` - docs and compatibility boundaries after Phase 3.

### Governance Docs
- `docs/fork-ownership.md` - path ownership and change routing rules.
- `docs/hermes-install.md` - current global/project-linked install behavior and manual smoke checks.
- `docs/hermes-compatibility.md` - supported, planned, and out-of-scope Hermes surfaces.
- `docs/upstream-sync.md` - sync discipline for avoiding unnecessary drift.

### Implementation Surfaces
- `bin/install.js` - Hermes runtime selection, command-to-skill conversion, project-linked install, and finish output.
- `tests/hermes-install.test.cjs` - Hermes global install and skill conversion coverage.
- `tests/hermes-project-linked.test.cjs` - `skills.external_dirs` mutation and project-linked install coverage.
- `tests/hermes-docs.test.cjs` - compatibility docs and installer copy assertions.
- `tests/multi-runtime-select.test.cjs` - installer runtime selection coverage.
- `commands/gsd/new-project.md` - `/gsd-new-project` entrypoint and loaded workflow refs.
- `commands/gsd/discuss-phase.md` - `/gsd-discuss-phase` entrypoint and auto-mode rules.
- `commands/gsd/plan-phase.md` - `/gsd-plan-phase` entrypoint and auto-advance behavior.
- `commands/gsd/execute-phase.md` - `/gsd-execute-phase` entrypoint and non-Claude runtime fallback notes.
- `commands/gsd/progress.md` - `/gsd-progress` entrypoint.
- `commands/gsd/verify-work.md` - `/gsd-verify-work` entrypoint.
- `commands/gsd/settings.md` - `/gsd-settings` entrypoint.
- `commands/gsd/update.md` - `/gsd-update` entrypoint.
- `get-shit-done/workflows/new-project.md` - project initialization workflow.
- `get-shit-done/workflows/discuss-phase.md` - context-gathering workflow.
- `get-shit-done/workflows/plan-phase.md` - planning workflow.
- `get-shit-done/workflows/execute-phase.md` - execution workflow and runtime fallback guidance.
- `get-shit-done/workflows/progress.md` - progress routing workflow.
- `get-shit-done/workflows/verify-work.md` - UAT workflow.
- `get-shit-done/workflows/settings.md` - settings workflow.
- `get-shit-done/workflows/update.md` - update workflow and known runtime directory gaps.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `copyCommandsAsHermesSkills()` in `bin/install.js` is the explicit Hermes
  command-to-skill conversion seam.
- `ensureHermesExternalDir()` in `bin/install.js` is the existing conservative
  `skills.external_dirs` mutation helper for project-linked installs.
- The sandboxed installer test pattern in `tests/hermes-install.test.cjs` and
  `tests/hermes-project-linked.test.cjs` already isolates `HOME` and project
  directories and should be reused for Phase 4 smoke fixtures.
- Existing command conversion replaces `~/.claude/`, `$HOME/.claude/`, and
  `./.claude/` references in generated skills, but workflow bodies still
  contain direct Claude-oriented references that may matter once the loaded
  workflow executes.

### Established Patterns
- Hermes changes should stay in installer, runtime conversion, docs, tests,
  and targeted compatibility shims.
- Project-linked mode is a truthful `external_dirs` bridge, not a native local
  Hermes install.
- Non-Claude runtimes rely on `~/.gsd/defaults.json` with
  `resolve_model_ids: "omit"`; Phase 4 must not regress that behavior.
- Docs pin Phase 4 as the point where core workflow execution moves from
  planned to supported/degraded.

### Known Risk Areas
- `get-shit-done/workflows/update.md` has runtime directory lists that currently
  omit Hermes and still reference `.claude`, `.codex`, `.gemini`, OpenCode, and
  Kilo paths only.
- `get-shit-done/workflows/settings.md` directly invokes
  `$HOME/.claude/get-shit-done/bin/gsd-tools.cjs` for config path resolution.
- `get-shit-done/workflows/verify-work.md`, `plan-phase.md`, and
  `execute-phase.md` include Claude-native `Task()` and `AskUserQuestion`
  assumptions, though some workflows already describe text-mode or non-Claude
  fallbacks.
- `new-project`, `plan-phase`, and `discuss-phase` search project skills under
  `.claude/skills` in places; Hermes project-linked skills live under
  `.gsd-hermes/skills`.

</code_context>

<specifics>
## Specific Ideas

- Build a reusable Phase 4 fixture harness that installs Hermes project-linked
  skills with a temp `HOME`, then checks generated skill content and selected
  workflow references for Hermes-safe paths.
- Add a small runtime compatibility audit that fails on executable-blocking
  bare `~/.claude` or `$HOME/.claude` references in the installed Hermes command
  set and high-value workflow paths.
- Treat `/gsd-new-project` as the first mutating parity target because it proves
  the entire project can start from Hermes rather than only operate on an
  existing `.planning/` directory.
- For commands that cannot be fully exercised without a real Hermes runtime,
  document the manual smoke command and add deterministic tests for the
  generated instructions and fallback wording.

</specifics>

<deferred>
## Deferred Ideas

- Complete update/uninstall/doctor lifecycle management for Hermes installs in
  Phase 5.
- Final upstream sync parity matrix and broad compatibility closure in Phase 6.
- Native Hermes local install semantics remain out of scope unless Hermes
  itself adds a stable local discovery contract.
- Long-tail `/gsd-*` command parity outside the core lifecycle remains a later
  compatibility effort unless a command blocks FLOW-01 or FLOW-02.

</deferred>

---

*Phase: 04-core-workflow-parity*

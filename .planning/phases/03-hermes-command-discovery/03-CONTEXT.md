# Phase 3: Hermes Command Discovery - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Make installed GSD command skills visible and usable as `/gsd-*` commands in
Hermes for the two supported Phase 3 modes: global install under `~/.hermes`
and project-linked install through Hermes `skills.external_dirs`. This phase
does not prove full GSD workflow parity; Phase 4 owns core workflow execution
inside Hermes after command discovery works.

</domain>

<decisions>
## Implementation Decisions

### Discovery Success Contract
- **D-01:** Treat command discovery as successful when generated Hermes skill
  directories have stable `gsd-*` names, valid `SKILL.md` files, and install
  paths that Hermes can scan for slash-command invocation.
- **D-02:** If Hermes does not expose a stable noninteractive command-list API,
  Phase 3 should use deterministic filesystem and skill-shape tests plus a
  documented manual smoke check instead of blocking on fragile CLI scraping.
- **D-03:** The visible command surface remains `/gsd-*`; do not rename commands
  to Hermes-specific verbs or introduce a separate workflow vocabulary.

### Global Skill Conversion
- **D-04:** Keep the Phase 2 global install root: GSD-managed Hermes command
  skills are installed directly under `~/.hermes/skills/gsd-*/SKILL.md`.
- **D-05:** Add the smallest Hermes-specific conversion needed for discoverable
  skill metadata and path references. Reuse the existing Claude/Codex skill
  conversion seam where practical, but do not force Hermes through a misleading
  Claude-named helper if a bounded `copyCommandsAsHermesSkills` wrapper makes
  ownership clearer.
- **D-06:** Fix command-discovery-blocking content/path issues in generated
  Hermes skills, including stale bare `~/.claude` or `$HOME/.claude` references
  that would point Hermes users at the wrong installed workflow tree.

### Project-Linked external_dirs Mode
- **D-07:** Name the secondary mode "project-linked install", not "local
  install". It is an `external_dirs` bridge, not a native Hermes local install.
- **D-08:** Generate project-owned Hermes skills under a GSD-owned directory in
  the target project, preferably `.gsd-hermes/skills/`, to avoid implying that
  Hermes has native `.hermes/` local install semantics.
- **D-09:** Project-linked install must add the absolute project skills path to
  `~/.hermes/config.yaml` under `skills.external_dirs` so Hermes can discover
  project-scoped `/gsd-*` skills.

### Config Mutation and Safety
- **D-10:** Mutate only the Hermes `skills.external_dirs` setting for
  project-linked mode. Preserve unrelated `~/.hermes/config.yaml` content,
  comments where reasonably possible, and all non-GSD paths.
- **D-11:** Make config mutation idempotent: repeated project-linked installs
  must not duplicate the same path, and global installs must not mutate
  `external_dirs`.
- **D-12:** If YAML support requires a new dependency, the planner should
  evaluate whether a small focused YAML dependency is safer than ad hoc parsing.
  The implementation must still avoid broad config rewrites.

### Scope Boundary
- **D-13:** Phase 3 may update installer messages and Hermes install docs to
  state that command discovery is now supported. It should not claim discuss,
  plan, execute, update, uninstall, or doctor parity yet.
- **D-14:** Update/uninstall lifecycle behavior remains Phase 5. Phase 3 tests
  can verify install idempotence for discovery paths, but full removal/update
  semantics are out of scope.
- **D-15:** Broad workflow markdown rewrites remain disallowed unless they
  directly block Hermes skill discovery. Full workflow compatibility belongs to
  Phase 4.

### Tests and Documentation
- **D-16:** Add automated coverage for global Hermes skill generation, project-
  linked skill generation, `external_dirs` config mutation, path de-duplication,
  and stale Claude-path replacement in generated Hermes skills.
- **D-17:** Add mode-specific documentation that tells users where files are
  written, how to restart or reload Hermes if needed, and how to run a manual
  smoke check for `/gsd-help` or `/gsd-progress`.
- **D-18:** Keep success criteria tied to HERM-01 and HERM-02 only. Regression
  coverage should not expand Phase 3 into FLOW-01/FLOW-02 workflow execution.

### the agent's Discretion
- Exact helper names and function decomposition inside `bin/install.js`.
- Exact YAML mutation implementation, provided it is conservative,
  idempotent, and covered by tests.
- Exact documentation filename or section placement, provided downstream users
  can find Hermes global and project-linked discovery behavior from the repo
  docs.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Definition
- `.planning/ROADMAP.md` — Phase 3 goal, HERM-01/HERM-02 success criteria, and planned work breakdown.
- `.planning/REQUIREMENTS.md` — Hermes runtime requirements and explicit out-of-scope native local install claim.
- `.planning/PROJECT.md` — GSD-first fork strategy, Hermes global/project-linked intent, and runtime truthfulness constraints.
- `.planning/STATE.md` — Phase 2 decisions, current blockers, and the deferred stale `~/.claude` path warning.

### Prior Phase Context
- `.planning/phases/01-fork-foundation/01-CONTEXT.md` — locked fork structure, adapter seam, and external_dirs truthfulness decisions.
- `.planning/phases/02-hermes-runtime-install/02-01-SUMMARY.md` — Hermes runtime selection and Phase 2 local-mode rejection baseline.
- `.planning/phases/02-hermes-runtime-install/02-02-SUMMARY.md` — Hermes `~/.hermes/skills` global install root and no-settings decision.
- `.planning/phases/02-hermes-runtime-install/02-03-SUMMARY.md` — current Hermes installer regression coverage and explicit Phase 3 deferrals.

### Governance Docs
- `docs/fork-ownership.md` — ownership map for installer, runtime conversion, docs, and test seams.
- `docs/hermes-compatibility.md` — compatibility guardrails for command discovery, external_dirs, and native local install non-goals.
- `docs/upstream-sync.md` — merge-first upstream sync and patch discipline constraints.

### Implementation Surfaces
- `bin/install.js` — installer runtime selection, path resolution, command-to-skill conversion, Hermes install branch, and finish output.
- `tests/hermes-install.test.cjs` — existing Phase 2 Hermes install-path and no-settings regression suite.
- `tests/claude-skills-migration.test.cjs` — existing command-to-skill conversion and path replacement coverage to reuse or mirror.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `copyCommandsAsClaudeSkills()` in `bin/install.js`: existing skill directory generator with path replacement and stale GSD skill cleanup behavior.
- `listCodexSkillNames()` in `bin/install.js`: reusable verifier for `skills/gsd-*/SKILL.md` directory shape.
- `tests/hermes-install.test.cjs`: sandboxed HOME installer smoke harness already verifies `~/.hermes/skills` output and can be extended.
- `tests/claude-skills-migration.test.cjs`: path replacement tests already cover `~/.claude` and `$HOME/.claude` patterns for skill generation.

### Established Patterns
- Runtime support is added through additive installer branches, helper cases,
  and targeted tests rather than broad workflow rewrites.
- Non-Claude runtimes inherit `~/.gsd/defaults.json` with
  `resolve_model_ids: "omit"`; Phase 3 should preserve that behavior.
- Hermes currently skips `settings.json`/runtime config mutation in global
  mode; only project-linked `external_dirs` should change Hermes config.

### Integration Points
- `bin/install.js` flag parsing and location selection currently reject
  `--hermes --local`; Phase 3 needs to replace that blanket rejection with the
  project-linked bridge path where appropriate.
- The Hermes install branch currently writes global skills through
  `copyCommandsAsClaudeSkills()` to `getGlobalDir('hermes')/skills`.
- Finish output currently says command discovery and project-linked support are
  planned later; Phase 3 should update it only after implementation and tests.
- Documentation updates should stay in `docs/` and avoid broad edits to
  upstream workflow files unless discovery truly requires them.

</code_context>

<specifics>
## Specific Ideas

- The command surface should feel like GSD in Hermes: users should type
  `/gsd-help`, `/gsd-progress`, `/gsd-discuss-phase`, and other familiar
  commands rather than learning a Hermes-only naming layer.
- Project-linked mode should be explicit and boring: generate project skills,
  add one absolute path to `skills.external_dirs`, document the path, and do
  not pretend it is a native local install.

</specifics>

<deferred>
## Deferred Ideas

- Full core workflow parity for `/gsd-new-project`, discuss, plan, execute,
  verify, progress, settings, and update belongs to Phase 4.
- Hermes update, uninstall, doctor, lifecycle diagnostics, and cleanup of stale
  project-linked config entries belong to Phase 5.
- Remaining broad workflow content conversion after command discovery belongs
  to Phase 4 or Phase 6 depending on whether it affects executable parity or
  compatibility closure.

</deferred>

---

*Phase: 03-hermes-command-discovery*
*Context gathered: 2026-04-19*

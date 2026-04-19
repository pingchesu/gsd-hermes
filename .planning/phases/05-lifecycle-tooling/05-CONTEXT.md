# Phase 5: Lifecycle Tooling - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Make Hermes installations maintainable after command discovery and core workflow
execution are already supported. This phase owns Hermes-specific update,
uninstall, doctor, lifecycle regression checks, and operator documentation.

This phase must not claim native local Hermes install support. Project-linked
mode remains an `external_dirs` bridge that writes project skills under
`.gsd-hermes/skills` and registers that absolute path in
`~/.hermes/config.yaml`.

</domain>

<decisions>
## Implementation Decisions

### Lifecycle Command Scope
- **D-01:** Phase 5 should implement lifecycle behavior for both supported
  Hermes install modes: global mode under `~/.hermes/skills` and
  project-linked mode under `.gsd-hermes/skills` plus
  `~/.hermes/config.yaml` `skills.external_dirs`.
- **D-02:** Update, uninstall, and doctor should remain Hermes adapter work in
  `bin/install.js`, docs, and focused tests. Do not rewrite upstream workflow
  markdown unless a Hermes lifecycle path is demonstrably broken.
- **D-03:** The command surface stays the existing installer/lifecycle surface:
  npm/npx installer flags and existing GSD lifecycle commands. Do not introduce
  a Hermes-only command vocabulary.

### Update Behavior
- **D-04:** Treat Hermes update as reinstall-over-existing with explicit
  preflight: detect existing Hermes GSD artifacts, save local patches through
  the existing manifest/patch backup mechanism, replace GSD-owned files, then
  report where patches were saved.
- **D-05:** For global Hermes updates, update only GSD-owned skills under
  `~/.hermes/skills/gsd-*`, the copied `get-shit-done/` tree, and the
  `gsd-file-manifest.json` metadata under the Hermes target root.
- **D-06:** For project-linked Hermes updates, update only the current
  project's `.gsd-hermes/skills/gsd-*`, `.gsd-hermes/get-shit-done/`, and
  `.gsd-hermes/gsd-file-manifest.json`; ensure the project skills path remains
  registered exactly once in `skills.external_dirs`.
- **D-07:** If local patches are found, Hermes should not advertise
  `/gsd-reapply-patches` until that command is proven in Hermes. Use manual
  reapply guidance unless Phase 5 explicitly validates a Hermes reapply path.

### Uninstall Safety
- **D-08:** Hermes uninstall must remove only GSD-owned artifacts: `gsd-*`
  skill directories, copied `get-shit-done/`, GSD agents if present, and
  `gsd-file-manifest.json`.
- **D-09:** Project-linked uninstall must also remove only the matching absolute
  `.gsd-hermes/skills` entry from `~/.hermes/config.yaml`
  `skills.external_dirs`. Preserve unrelated config keys, comments where
  practical, and non-GSD external directories.
- **D-10:** Global Hermes uninstall must not mutate `skills.external_dirs`,
  because global mode does not add project-linked config entries.
- **D-11:** If uninstall cannot confidently identify a GSD-owned path, it should
  skip that path and report the skip instead of deleting ambiguous user content.

### Doctor Diagnostics
- **D-12:** Hermes doctor should be read-only by default. It reports findings
  and suggested fixes, but does not mutate config or delete files.
- **D-13:** Doctor must check both modes: global skill presence, project-linked
  `.gsd-hermes/skills` presence, `skills.external_dirs` entries, duplicate
  entries, stale/missing external_dirs targets, command skill shape, manifest
  presence, copied workflow path leaks, and optional real `hermes` binary
  availability.
- **D-14:** Doctor results should be actionable and testable: each finding
  should include severity, affected path, and the install/update/uninstall
  command or manual cleanup step that resolves it.

### Regression and Documentation Contract
- **D-15:** Deterministic temp `HOME`/temp project tests remain the source of
  truth. A real Hermes CLI can be used as optional smoke only, never as a
  required CI dependency.
- **D-16:** Add tests for update, uninstall, doctor, config preservation,
  external_dirs cleanup, duplicate prevention, stale path detection, and
  lifecycle docs.
- **D-17:** Update `docs/hermes-install.md` and
  `docs/hermes-compatibility.md` so Phase 5 lifecycle support moves from
  `planned` to the precise implemented status. Do not overstate unsupported
  surfaces.

### the agent's Discretion
- Exact helper/function names for Hermes update, uninstall, doctor, and config
  cleanup helpers.
- Whether doctor is exposed as an installer flag, a GSD CLI helper, or both,
  provided the user-facing docs and tests match the implemented surface.
- Exact severity labels for doctor findings, as long as output is stable enough
  for regression tests.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Definition
- `.planning/ROADMAP.md` - Phase 5 goal, success criteria, and planned work
  items.
- `.planning/REQUIREMENTS.md` - DIST-02, DIST-03, QUAL-01, and DOCS-01.
- `.planning/PROJECT.md` - GSD-first fork goal, Hermes runtime intent, and
  runtime truthfulness constraints.
- `.planning/STATE.md` - current project position and prior lifecycle
  deferrals.

### Prior Phase Context
- `.planning/phases/01-fork-foundation/01-CONTEXT.md` - adapter seam,
  upstream-sync discipline, and no broad workflow rewrite rule.
- `.planning/phases/03-hermes-command-discovery/03-CONTEXT.md` - global and
  project-linked install mode decisions, including `external_dirs`
  truthfulness.
- `.planning/phases/04-core-workflow-parity/04-CONTEXT.md` - core workflow
  parity decisions and explicit Phase 5 lifecycle deferrals.
- `.planning/phases/04-core-workflow-parity/04-04-SUMMARY.md` - final Phase 4
  verification and optional real Hermes smoke boundary.

### Governance and Docs
- `docs/fork-ownership.md` - path ownership and change routing rules.
- `docs/hermes-install.md` - current Hermes install modes, smoke commands,
  troubleshooting, and Phase 5 lifecycle gap.
- `docs/hermes-compatibility.md` - compatibility matrix, known gaps, and
  adapter guardrails.
- `docs/upstream-sync.md` - merge-first upstream sync discipline.
- `docs/manual-update.md` - existing update guidance that may need Hermes-aware
  references.
- `docs/CLI-TOOLS.md` - existing CLI lifecycle documentation patterns.
- `docs/COMMANDS.md` - user-facing GSD command documentation patterns.

### Implementation Surfaces
- `bin/install.js` - installer runtime selection, Hermes install branch,
  `ensureHermesExternalDir()`, `uninstall()`, manifest writing, local patch
  detection, and finish output.
- `tests/hermes-install.test.cjs` - Hermes global/project-linked install
  coverage and local patch reporting tests.
- `tests/hermes-project-linked.test.cjs` - `skills.external_dirs` mutation and
  idempotence coverage.
- `tests/hermes-core-workflow.test.cjs` - deterministic core workflow smoke and
  optional real Hermes CLI smoke.
- `tests/hermes-docs.test.cjs` - Hermes docs and compatibility assertions.
- `tests/bug-1908-uninstall-manifest.test.cjs` - existing uninstall manifest
  cleanup regression pattern.
- `tests/multi-runtime-select.test.cjs` - installer runtime selection and help
  text coverage.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `copyCommandsAsHermesSkills()` in `bin/install.js` is the explicit Hermes
  skill generation seam.
- `ensureHermesExternalDir()` in `bin/install.js` already performs conservative
  idempotent insertion of project-linked paths into `skills.external_dirs`.
- `writeManifest()`, `saveLocalPatches()`, and `reportLocalPatches()` already
  provide the core update-safety mechanism for preserving locally modified GSD
  files.
- `uninstall()` already removes GSD-owned artifacts and `gsd-file-manifest.json`
  for other runtimes; Hermes needs a dedicated branch instead of falling into
  Claude global/local assumptions.
- Existing Hermes tests use temp `HOME` and temp project directories and should
  be extended rather than replaced.

### Established Patterns
- Hermes support is adapter-layer work: installer helpers, generated skill
  conversion, compatibility docs, and regression tests.
- Project-linked mode is a bridge, not native local install.
- Hermes does not write `settings.json`; lifecycle tooling should not invent
  settings files for Hermes.
- Deterministic filesystem tests are preferred over fragile real-Hermes CLI
  transcript matching.

### Integration Points
- `install(isGlobal, 'hermes')` already chooses `~/.hermes` for global mode and
  `.gsd-hermes` for project-linked mode.
- `writeManifest(configDir, 'hermes')` already includes `skills/gsd-*` and
  skips hooks, matching Hermes' current no-settings behavior.
- `uninstall(isGlobal, runtime)` currently lacks Hermes-specific config cleanup
  and may route Hermes local/global behavior through generic branches.
- Hermes docs currently mark update/uninstall/doctor as Phase 5 work and should
  be changed only after behavior and tests exist.

</code_context>

<specifics>
## Specific Ideas

- Use a small helper to remove one normalized project-linked skills path from
  `skills.external_dirs`, preserving the rest of `~/.hermes/config.yaml`.
- Add a `--doctor` or equivalent lifecycle diagnostic surface that can be run
  without Hermes installed.
- Keep real Hermes smoke optional and diagnostic-only; temp filesystem fixtures
  are the required verification path.
- Make lifecycle docs explicit about how to choose global vs project-linked
  cleanup when both modes exist.

</specifics>

<deferred>
## Deferred Ideas

- Full upstream sync closure and broad compatibility matrix hardening remain
  Phase 6.
- Native local Hermes install semantics remain out of scope unless Hermes adds
  a stable native local skill discovery contract.
- Proving `/gsd-reapply-patches` as a Hermes slash command can be deferred
  unless Phase 5 explicitly validates it as part of update lifecycle.

</deferred>

---

*Phase: 05-lifecycle-tooling*
*Context gathered: 2026-04-19*

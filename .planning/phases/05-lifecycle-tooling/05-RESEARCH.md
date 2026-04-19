---
phase: 05-lifecycle-tooling
status: complete
created: 2026-04-19
---

# Phase 5 Research: Lifecycle Tooling

## Research Complete

Phase 5 should extend the existing installer lifecycle seam rather than create
new workflow machinery. Hermes already has working global and project-linked
install paths, generated skills, manifest writing, local patch detection, and
project-linked `skills.external_dirs` insertion. The missing pieces are safe
cleanup, health diagnostics, update-facing tests, and docs that no longer say
update/uninstall/doctor are future work after implementation.

## Existing Implementation Facts

- `bin/install.js` parses `--hermes`, `--global`, `--local`, and
  `--uninstall`.
- `install(isGlobal, 'hermes')` writes global skills under
  `~/.hermes/skills` or project-linked skills under `.gsd-hermes/skills`.
- `ensureHermesExternalDir(configPath, skillsDir)` conservatively adds one
  normalized project skills path under `skills.external_dirs`.
- `writeManifest(configDir, 'hermes')` tracks copied `get-shit-done/` files and
  `skills/gsd-*` files while intentionally skipping hooks/settings.
- `saveLocalPatches()` and `reportLocalPatches(configDir, 'hermes')` already
  support update safety; Hermes currently reports manual reapply guidance.
- `uninstall(isGlobal, runtime)` lacks explicit Hermes mode behavior and does
  not remove project-linked `external_dirs` entries.

## Recommended Implementation Shape

### Update

Use reinstall-over-existing as the update path. The existing install flow
already calls `saveLocalPatches(targetDir)`, removes orphaned files, writes the
new command skills and copied workflow tree, and rewrites the manifest.
Planning should verify this behavior for Hermes global and project-linked
targets instead of creating a parallel updater.

### Uninstall

Add a Hermes-specific branch in `uninstall()` before the generic Claude global
and local branches. It should remove:

- `skills/gsd-*` directories from the selected Hermes target root
- copied `get-shit-done/`
- GSD agent files if present
- `gsd-file-manifest.json`
- for project-linked mode only, the matching normalized `.gsd-hermes/skills`
  entry from `~/.hermes/config.yaml`

It should not remove `~/.hermes`, unrelated `skills.external_dirs` entries,
model/provider config, comments where practical, or user-owned non-GSD skill
directories.

### Doctor

Implement read-only Hermes diagnostics in testable helper functions. The helper
should return structured findings and the CLI surface should print them in
stable text. Minimum checks:

- global skill root exists and contains `skills/gsd-help/SKILL.md`
- project-linked `.gsd-hermes/skills/gsd-help/SKILL.md` exists when checking
  local mode
- `~/.hermes/config.yaml` has the project-linked path exactly once
- `skills.external_dirs` entries do not point to missing paths
- generated GSD skills have `name: gsd-*` frontmatter
- installed workflow content has no executable `~/.claude`, `$HOME/.claude`,
  or `./.claude` path leaks
- manifest exists
- optional `hermes --version` is diagnostic only

## Validation Architecture

Phase 5 validation should be deterministic and CI-friendly:

- Unit tests for config cleanup helpers and doctor result helpers
- Installer subprocess tests with temp `HOME` and temp project directories
- Docs tests asserting lifecycle support language only after code support exists
- Optional real Hermes probe remains non-blocking

Required commands:

- `node --test tests/hermes-lifecycle.test.cjs`
- `node --test tests/hermes-install.test.cjs tests/hermes-project-linked.test.cjs tests/hermes-docs.test.cjs tests/hermes-lifecycle.test.cjs`
- `npm test`

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Removing non-GSD Hermes config | Only remove exact normalized project-linked paths and `gsd-*` skill directories. |
| Update corrupts local modifications | Reuse manifest/local patch backup and test the backup report for Hermes. |
| Doctor becomes destructive | Keep doctor read-only by default and test that it only reports findings. |
| Real Hermes availability destabilizes CI | Keep real CLI probes optional and diagnostic-only. |

## Planning Recommendation

Use four plans:

1. Update/uninstall lifecycle safety
2. Read-only doctor diagnostics
3. Lifecycle regression tests
4. Operator docs and compatibility closure


# Phase 3: Hermes Command Discovery - Patterns

## Existing Patterns to Reuse

### Installer runtime branching

- `bin/install.js` uses runtime booleans such as `isCodex`, `isHermes`, and
  `isQwen` to route install behavior.
- Runtime install branches are additive and localized. Preserve this pattern:
  add Hermes-specific behavior around existing Hermes branches instead of
  refactoring all runtimes.

### Skill generation

- `copyCommandsAsClaudeSkills()` converts command markdown into
  `skills/gsd-*/SKILL.md`.
- `listCodexSkillNames()` already validates the directory shape
  `skills/<name>/SKILL.md` and can be reused for Hermes.
- Existing path replacement patterns already rewrite `~/.claude`,
  `$HOME/.claude`, and `./.claude` for command skill content. Hermes needs this
  coverage pinned by tests.

### Installer tests

- `tests/hermes-install.test.cjs` already has a sandboxed HOME runner,
  `runInstaller(args, { home, cwd })`, and helper assertions for Hermes.
- Existing tests prefer direct file assertions and source seam assertions over
  brittle terminal interaction.

### Documentation guardrails

- `docs/hermes-compatibility.md` is the compatibility truth table.
- `docs/fork-ownership.md` defines `bin/install.js` and `tests/` as Hermes
  adapter seam surfaces.
- New docs should be linked from `docs/README.md` rather than scattered through
  upstream-owned workflow files.

## Target File Roles

| File | Role in Phase 3 |
|------|------------------|
| `bin/install.js` | Hermes skill conversion wrapper, project-linked target path, and config mutation helper |
| `tests/hermes-install.test.cjs` | Existing Hermes install test extension for global discovery behavior |
| `tests/hermes-project-linked.test.cjs` | New focused tests for `.gsd-hermes/skills` and `skills.external_dirs` |
| `tests/hermes-docs.test.cjs` | New docs/source seam test for discovery copy and smoke instructions |
| `docs/hermes-install.md` | User-facing Hermes install and command discovery guide |
| `docs/hermes-compatibility.md` | Update matrix from planned/documented boundary to supported Phase 3 status |
| `docs/README.md` | Link the Hermes install guide from the fork documentation index |

## Dependency Map

- Plan 03-01 can run first and establishes reusable Hermes skill generation.
- Plan 03-02 depends on 03-01 because project-linked mode should use the same
  generated skill shape.
- Plan 03-03 depends on 03-01 and 03-02 because docs and final regression
  coverage must describe the implemented modes.

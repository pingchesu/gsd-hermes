---
phase: 03-hermes-command-discovery
generated: 2026-04-19
status: complete
sources:
  - https://hermes-agent.nousresearch.com/docs/guides/work-with-skills/
  - https://github.com/NousResearch/hermes-agent/blob/main/agent/skill_commands.py
  - https://github.com/NousResearch/hermes-agent/blob/main/agent/prompt_builder.py
---

# Phase 3: Hermes Command Discovery - Research

## Research Complete

Phase 3 should stay focused on Hermes skill discovery, not full GSD workflow
execution. Hermes documents custom skills as `SKILL.md` files with YAML
frontmatter stored under `~/.hermes/skills/...`; the docs also show `/skills`,
`hermes skills list`, and `hermes chat -q "/my-skill ..."` as discovery and
smoke paths. Hermes source scans `SKILL.md` files, reads frontmatter `name` and
`description`, normalizes command names, and includes both the built-in skills
directory and configured external skill directories.

## Implementation Findings

### Global install

- Global GSD skills should remain under `~/.hermes/skills/gsd-*/SKILL.md`.
- Frontmatter `name` should be the slash-command name without a slash, for
  example `gsd-help`, because Hermes derives command names from skill
  frontmatter or the parent directory.
- The existing `copyCommandsAsClaudeSkills()` seam already creates
  `skills/gsd-*/SKILL.md` and rewrites `~/.claude` references to the runtime
  path prefix. Phase 3 should either wrap it as `copyCommandsAsHermesSkills()`
  or specialize the helper path enough that Hermes ownership is explicit.
- Generated Hermes `SKILL.md` files should not contain `~/.claude`,
  `$HOME/.claude`, or `./.claude` path references. The source workflow tree may
  still contain Claude examples until Phase 4/5 unless those paths break command
  discovery directly.

### Project-linked install

- Hermes external directories are read-only discovery roots from Hermes'
  perspective. Project-linked GSD should therefore write generated skills into
  a repo-owned path such as `.gsd-hermes/skills/`, then register the absolute
  path in `~/.hermes/config.yaml` under `skills.external_dirs`.
- A project-linked install must not be presented as a native Hermes local
  install. The CLI flag may still be `--local` for installer consistency, but
  user-facing output should say `project-linked mode`.
- External skill names should not collide with global skills. Hermes source
  scans local skills before external dirs and skips duplicate names, so docs
  should warn users that global GSD skills may take precedence if both are
  installed.

### Config mutation

- The safest no-dependency approach is a conservative text updater that handles
  the common Hermes config shape:
  - No config file: create `skills.external_dirs` with the absolute path.
  - Existing `skills:` without `external_dirs`: insert `external_dirs`.
  - Existing block list: append the quoted absolute path only if absent.
  - Existing unrelated config and comments: preserve text outside the inserted
    block.
- If implementation discovers complex YAML cases that cannot be safely edited
  textually, it should fail with a clear message instead of rewriting the whole
  config. Adding a direct `yaml` runtime dependency is acceptable only if the
  executor proves it is safer and updates `package.json`/`package-lock.json`
  intentionally.

## Validation Architecture

Phase 3 validation should prove command discovery through deterministic
installer artifacts and optional live Hermes smoke instructions:

- Global install smoke: run installer in a temp HOME, assert
  `~/.hermes/skills/gsd-help/SKILL.md` exists, frontmatter contains
  `name: gsd-help`, and generated skill content has no `~/.claude`,
  `$HOME/.claude`, or `./.claude` references.
- Project-linked smoke: run installer with `--hermes --local --no-sdk` in a temp
  project, assert `.gsd-hermes/skills/gsd-help/SKILL.md` exists, assert
  `~/.hermes/config.yaml` contains the absolute `.gsd-hermes/skills` path under
  `skills.external_dirs`, and assert repeated installs do not duplicate the
  path.
- Docs smoke: assert user-facing docs mention global mode, project-linked mode,
  `skills.external_dirs`, `/gsd-help`, `/gsd-progress`, and the boundary that
  workflow parity is Phase 4.
- Manual live smoke, when Hermes is installed: run `hermes skills list` and
  `hermes chat -q "/gsd-help"` after restart/reload. This is not a hard CI gate
  unless a stable Hermes runtime is available.

## Planning Recommendation

Use three plans:

1. Global Hermes command skill conversion and discovery shape.
2. Project-linked install through `.gsd-hermes/skills` plus
   `skills.external_dirs`.
3. Discovery regression coverage and user-facing documentation.

Keep lifecycle tooling, uninstall/update cleanup, and deep workflow execution
out of Phase 3.

## Sources

- Hermes "Working with Skills" docs: https://hermes-agent.nousresearch.com/docs/guides/work-with-skills/
- Hermes skill command discovery source: https://github.com/NousResearch/hermes-agent/blob/main/agent/skill_commands.py
- Hermes prompt builder external-dir scan source: https://github.com/NousResearch/hermes-agent/blob/main/agent/prompt_builder.py

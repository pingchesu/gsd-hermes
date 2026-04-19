# Hermes Install and Command Discovery

This guide documents the Hermes install, command discovery, and core workflow
smoke surface for `gsd-hermes`. It covers the two supported install modes and
the checks that verify Hermes can discover and run GSD commands.

## Install Modes

Hermes support has two install modes:

| Mode | Command | Writes | Hermes discovery path |
| --- | --- | --- | --- |
| Global mode | `npx gsd-hermes --hermes --global` | `~/.hermes/skills/gsd-*/SKILL.md` | Hermes scans the user-level skills directory. |
| Project-linked mode | `npx gsd-hermes --hermes --local` | `.gsd-hermes/skills/gsd-*/SKILL.md` | The installer registers the absolute project skills path in `~/.hermes/config.yaml` under `skills.external_dirs`. |

Project-linked mode is not a native local Hermes install. It is a project-owned
skills directory that Hermes discovers through `skills.external_dirs`.

The package also exposes `get-shit-done-cc` as a compatibility executable when
installed from `gsd-hermes`, but new Hermes installs should use
`npx gsd-hermes`.

## Global Mode

Run:

```bash
npx gsd-hermes --hermes --global
```

Global mode writes GSD command skills to:

```text
~/.hermes/skills/gsd-*/SKILL.md
```

After install, restart or reload Hermes if it does not immediately show the new
commands. Then run the command discovery smoke checks below.

## Project-Linked Mode

Run from the target project directory:

```bash
npx gsd-hermes --hermes --local
```

Project-linked mode writes GSD command skills to:

```text
.gsd-hermes/skills/gsd-*/SKILL.md
```

It also registers the absolute project skills path in:

```text
~/.hermes/config.yaml
```

under:

```yaml
skills:
  external_dirs:
    - "/absolute/path/to/project/.gsd-hermes/skills"
```

If both global and project-linked skills exist with duplicate names, Hermes may
prefer globally discovered duplicate names depending on its discovery order. Use
one mode per command set when debugging discovery conflicts.

## Command Discovery Smoke

Use Hermes' skill list command first:

```bash
hermes skills list
```

Then try a non-mutating GSD command:

```bash
hermes chat -q "/gsd-help"
```

For an installed GSD workspace, `/gsd-progress` is also a useful smoke command:

```bash
hermes chat -q "/gsd-progress"
```

If the command is not visible, restart or reload Hermes and repeat
`hermes skills list`.

## Core Workflow Smoke

After command discovery works, smoke the core GSD workflow path from low-risk
commands to mutating commands:

```bash
hermes chat -q "/gsd-new-project"
hermes chat -q "/gsd-progress"
hermes chat -q "/gsd-discuss-phase 1 --auto"
hermes chat -q "/gsd-plan-phase 1 --auto"
hermes chat -q "/gsd-execute-phase 1"
```

Hermes support uses documented degraded paths for runtime capabilities that may
not exactly match Claude Code. Use text-mode fallback when `AskUserQuestion` is
unavailable, use sequential inline execution when `Task` style subagents are
unavailable, and do not report full parity when a workflow needs a degraded
path.

### Optional real Hermes smoke

Deterministic Node tests are the CI source of truth for Hermes core workflow
coverage:

```bash
node --test tests/hermes-core-workflow.test.cjs
```

Real Hermes CLI checks are best-effort because not every contributor or CI
environment has Hermes installed. When available, run:

```bash
hermes skills list
hermes chat -q "/gsd-help"
```

If `hermes` is missing from `PATH`, treat the real-runtime smoke as skipped, not
as a deterministic test failure.

## Hermes Lifecycle

Hermes lifecycle support uses the same installer entrypoint as install. Update
is reinstall-over-existing: the installer refreshes GSD-owned files and saves
modified GSD files under `gsd-local-patches` before replacement.

### Update

Update a global Hermes install:

```bash
npx gsd-hermes --hermes --global
```

Update a project-linked Hermes install from the project directory:

```bash
npx gsd-hermes --hermes --local
```

### Uninstall

Uninstall global Hermes GSD artifacts:

```bash
npx gsd-hermes --hermes --global --uninstall
```

Uninstall project-linked Hermes GSD artifacts from the project directory:

```bash
npx gsd-hermes --hermes --local --uninstall
```

Global uninstall removes GSD-owned `~/.hermes/skills/gsd-*` skill directories,
the copied `get-shit-done/` tree, and `gsd-file-manifest.json`. It does not
mutate `skills.external_dirs`.

The project-linked uninstall removes only the matching `.gsd-hermes/skills`
`skills.external_dirs` entry for the current project. In operational shorthand:
project-linked uninstall removes only the matching project skills entry. It
preserves unrelated Hermes config and unrelated external dirs.

### Doctor

Doctor is read-only. It reports install-health findings without changing files
or config.

Check a global Hermes install:

```bash
npx gsd-hermes --hermes --global --doctor
```

Check a project-linked Hermes install from the project directory:

```bash
npx gsd-hermes --hermes --local --doctor
```

Doctor checks for missing `gsd-help`, invalid skill frontmatter, missing file
manifests, executable Claude path leaks, duplicate project-linked
`skills.external_dirs` entries, and stale `skills.external_dirs` targets.

## Compatibility Validation

Run the targeted Hermes compatibility gate after install-path,
command-discovery, lifecycle, or upstream-sync changes:

```bash
npm run test:hermes
```

Run the full suite before release when feasible:

```bash
npm test
```

The targeted command uses deterministic fixture tests. Optional real Hermes CLI
smoke remains best-effort and skipped when `hermes` is unavailable.

## Current Boundaries

Hermes command discovery is supported for global and project-linked installs.
Phase 4 core workflow execution is supported with degraded paths for
`/gsd-new-project`, discuss, plan, execute, verify, progress, settings, and
update smoke coverage.

Update, uninstall, and doctor lifecycle support for Hermes-specific artifacts is
implemented through the lifecycle commands above. This is the Phase 5 lifecycle
surface.

Native local Hermes install mode remains out of scope. Use project-linked mode
through `skills.external_dirs` instead.

## Troubleshooting

If `/gsd-help` is missing, check that the relevant `SKILL.md` exists under
`~/.hermes/skills/gsd-help/SKILL.md` for global mode or
`.gsd-hermes/skills/gsd-help/SKILL.md` for project-linked mode.

If project-linked mode is missing, check `~/.hermes/config.yaml` and confirm the
absolute `.gsd-hermes/skills` path appears exactly once under
`skills.external_dirs`.

If duplicate command names behave unexpectedly, remove either the global GSD
skills or the project-linked entry while debugging. Hermes may prefer globally
discovered duplicates.

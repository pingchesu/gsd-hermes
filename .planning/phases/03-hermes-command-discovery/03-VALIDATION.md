# Phase 3: Hermes Command Discovery - Validation Strategy

**Created:** 2026-04-19
**Status:** Required for execution verification

## Validation Architecture

### Dimension 1: Global Discovery

- `node --test tests/hermes-install.test.cjs` must prove a sandboxed
  `--hermes --global --no-sdk` install creates `~/.hermes/skills/gsd-*`
  directories with `SKILL.md` files.
- At least `gsd-help` must have frontmatter `name: gsd-help`.
- Generated Hermes skill files must not contain `~/.claude`, `$HOME/.claude`,
  or `./.claude`.

### Dimension 2: Project-Linked Discovery

- `node --test tests/hermes-project-linked.test.cjs` must prove
  `--hermes --local --no-sdk` writes `.gsd-hermes/skills/gsd-*`.
- `~/.hermes/config.yaml` must contain one `skills.external_dirs` entry pointing
  at the absolute `.gsd-hermes/skills` path.
- Repeated installs must not duplicate that path.
- Existing unrelated config text must remain present after mutation.

### Dimension 3: Documentation and Boundary Truth

- `node --test tests/hermes-docs.test.cjs` must prove docs mention global mode,
  project-linked mode, `skills.external_dirs`, `/gsd-help`, `/gsd-progress`,
  and that core workflow parity remains Phase 4.

### Dimension 4: Full Regression

- `npm test` must pass after Phase 3.

## Manual Smoke

If a local Hermes runtime is available, restart/reload Hermes after install and
run:

```bash
hermes skills list
hermes chat -q "/gsd-help"
```

This live smoke is best-effort and should not block automated Phase 3
verification unless Hermes is present in the execution environment.

# Upstream Sync Workflow

This runbook defines how `gsd-hermes` keeps `origin` and `upstream` aligned with
the Phase 1 fork-governance decisions. It separates the one-time first import
from the steady-state merge flow so maintainers do not guess which history
operation applies.

## Remote Roles

Per D-04, `origin` is the fork remote for `pingchesu/gsd-hermes` and
`upstream` is `gsd-build/get-shit-done`.

```bash
git remote add upstream https://github.com/gsd-build/get-shit-done.git
```

## First Import Into This Planning-Only Repo

Use this flow the first time upstream code is imported into the current
planning-only repository. The histories start unrelated, so the merge must be
explicit.

```bash
git remote add upstream https://github.com/gsd-build/get-shit-done.git
git fetch upstream
git checkout main
git merge --allow-unrelated-histories upstream/main
```

After the first import, review the merge result before adding Hermes-specific
changes so the imported upstream base remains easy to diff.

## Steady-State Merge Flow

After the first import, all routine sync work should use standard merges from
`upstream/main` into `main`.

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

Merges are required per D-05, and visible merge history is preserved per D-06
so future Hermes-specific conflicts stay reviewable.

## Post-Sync Validation Checklist

Run this checklist after every routine sync from `upstream/main`:

1. Confirm the working tree is clean before starting:
   ```bash
   git status --short
   ```
2. Fetch the upstream branch:
   ```bash
   git fetch upstream
   ```
3. Merge upstream into the downstream branch:
   ```bash
   git merge upstream/main
   ```
4. Classify any conflict or material drift using the ownership labels from
   `docs/fork-ownership.md`: `Upstream base`, `Hermes adapter seam`, and
   `Downstream governance`.
5. Run the targeted Hermes compatibility gate:
   ```bash
   npm run test:hermes
   ```
6. Run the full-suite gate when feasible:
   ```bash
   npm test
   ```
7. Review `docs/hermes-compatibility.md` when the sync changes runtime
   behavior, support status, install paths, lifecycle behavior, or known gaps.

`npm run test:hermes` is the targeted Hermes compatibility gate. `npm test` is
the full-suite release gate when feasible.

## Release Blocker Criteria

Regressions in install, command discovery, core workflow lifecycle, update,
uninstall, doctor, or compatibility docs are release blockers for Hermes
compatibility.

optional real Hermes CLI unavailability is a warning/skip, not a release
blocker by itself. The deterministic fixture tests remain the required CI
evidence; real Hermes smoke is an additional manual check when `hermes` is
available on `PATH`.

## Patch Discipline

Hermes-specific patches belong in installer, runtime conversion, compatibility,
documentation, and test layers per D-02. Broad workflow rewrites are not
allowed in Phase 1, because that would make future upstream merges harder to
review and maintain.

Keep the default assumption simple:

- If a change touches workflow behavior broadly, treat it as upstream-owned.
- If a change adds runtime path, config, or conversion logic, treat it as a
  Hermes adapter seam.
- If a change records fork policy, sync rules, or compatibility truth, keep it
  in downstream governance docs.

## Conflict Review Checklist

- Confirm the merge target is `upstream/main` and not another branch or remote.
- Review conflicts for installer, runtime conversion, compatibility,
  documentation, and test seams first, because those are the approved Hermes
  patch zones.
- Check whether a conflict suggests accidental drift in broader workflow files;
  if it does, move the change back toward the adapter seam instead of expanding
  fork-only behavior.
- Preserve the merge commit so the conflict resolution remains traceable in
  history.

## Explicit Non-Goals

Phase 1 does not import upstream code yet as part of this runbook alone. Phase 1
also does not run upstream package scripts because Node 22+ is not installed locally,
and it does not use rebase or cherry-pick-only maintenance in place of the
documented merge flow.

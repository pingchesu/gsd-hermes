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

## Version Policy for Upstream Syncs

`gsd-hermes` has an independent npm version line. Upstream GSD versions are
recorded as compatibility metadata, not copied into the downstream npm version.

Use this mapping when preparing a release after an upstream sync:

| Scenario | Downstream release | Release note wording |
|----------|-------------------|----------------------|
| Upstream patch sync, no downstream breaking change | Patch bump, for example `gsd-hermes@1.0.1` | `Based on get-shit-done-cc@1.37.2` |
| Upstream minor sync or new Hermes capability | Minor bump, for example `gsd-hermes@1.1.0` | `Based on get-shit-done-cc@1.38.0` |
| Downstream breaking installer/config behavior | Major bump, for example `gsd-hermes@2.0.0` | Include upstream base and migration notes |

Do not publish `gsd-hermes@1.37.2` just because upstream releases
`get-shit-done-cc@1.37.2`. The package identity is the Hermes fork; the
upstream base is documented separately in README, CHANGELOG, release notes, and
sync PRs.

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
8. Update release metadata:
   - README version identity banner, if the upstream base changed.
   - CHANGELOG release heading with both `gsd-hermes` version and upstream base.
   - GitHub Release notes with the same two-version wording.

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

## Sync Logs

Persistent per-sync classification records live in [`docs/sync-logs/`](./sync-logs/).
Each upstream sync produces one file (`YYYY-MM-sync-<upstream-short-sha>.md`) recording
every resolved conflict hunk with `owner`, `resolution`, and `risk` per
[`docs/fork-ownership.md`](./fork-ownership.md).

See [`docs/sync-logs/2026-04-sync-0a049149.md`](./sync-logs/2026-04-sync-0a049149.md) for the
v1.3 sync precedent — 226 files resolved across 97 upstream commits, with per-hunk
granularity for `bin/install.js` (the Hermes adapter seam) and per-file granularity
for bulk `upstream base` and whole-file governance decisions.

See [`docs/sync-logs/2026-04-sync-f3685d91.md`](./sync-logs/2026-04-sync-f3685d91.md) for the
v1.5 sync precedent — upstream `get-shit-done-cc@1.38.5` merged from
`cd057255..f3685d91`, preserving downstream package identity, Hermes dash-form
command discovery, SDK/CJS parity, and strict runtime/model binding receipts.

The sync log captures Verification Evidence (D-08 triad results, fork-identity output,
ARCHIVE-03 housekeeping, `.gitattributes` scope containment), Deferred Decisions (items
pushed to subsequent phases), and Operator Notes (granularity adaptations, scan-evidence,
handoff hints). Populate the log incrementally during conflict resolution and finalize
the Verification Evidence section after the post-merge test gates pass.

## Explicit Non-Goals

Phase 1 does not import upstream code yet as part of this runbook alone. Phase 1
also does not run upstream package scripts because Node 22+ is not installed locally,
and it does not use rebase or cherry-pick-only maintenance in place of the
documented merge flow.

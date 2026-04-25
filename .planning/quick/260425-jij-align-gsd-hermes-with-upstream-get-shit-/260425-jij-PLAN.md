---
quick_id: 260425-jij
slug: align-gsd-hermes-with-upstream-get-shit-
status: planned
created: 2026-04-25
---

# Quick Task 260425-jij: align gsd-hermes with upstream get-shit-done cd057255

## Goal
Bring gsd-hermes forward from the shipped v1.3.0 upstream base `0a049149` to `upstream/main@cd057255`, while preserving Hermes-specific adapter/release behavior and creating a traceable upstream ancestry bridge for future syncs.

## Current facts
- Current active branch after cleanup: `ga-bump/1.3.0` at `3fd32a24`.
- Backup branch preserving accidental release/planning commits: `backup/ga-bump-1.3.0-before-upstream-align-20260425-140027` at `c343e317`.
- `upstream` remote: `https://github.com/gsd-build/get-shit-done.git`.
- `upstream/main`: `cd057255`.
- Shipped v1.3.0 upstream base: `0a049149`.
- `0a049149..upstream/main`: 25 upstream commits.
- Direct unrelated-history merge probe produced 84 conflicted files.
- Synthetic ancestry bridge probe (`git merge -s ours --allow-unrelated-histories 0a049149`) reduced the real upstream merge conflicts to 3 files:
  - `.github/workflows/release.yml`
  - `CHANGELOG.md`
  - `bin/install.js`

## Patch plan
1. Create a dedicated sync branch from `3fd32a24`: `sync/upstream-cd057255`.
2. Create an ancestry bridge merge commit using `git merge -s ours --allow-unrelated-histories 0a049149` so future upstream merges use `0a049149` as the merge base instead of treating the histories as unrelated.
3. Merge `upstream/main@cd057255` into the sync branch.
4. Resolve the three expected conflicts:
   - Keep downstream `gsd-hermes` release/package identity in `.github/workflows/release.yml`.
   - Preserve downstream release history in `CHANGELOG.md`, then add an unreleased/upstream-sync note if needed.
   - Preserve Hermes installer/adapter behavior in `bin/install.js` while incorporating upstream bugfixes where compatible.
5. Run verification:
   - `git diff --check`
   - `npm run test:hermes`
   - `npm test` if targeted gate passes and runtime budget permits.
6. Commit the merge/sync result with clear upstream base metadata.
7. Record a quick-task summary under `.planning/quick/260425-jij-align-gsd-hermes-with-upstream-get-shit-/`.

## Non-goals
- Do not publish npm.
- Do not edit GitHub release body.
- Do not bump package version unless the sync requires a release-prep phase later.

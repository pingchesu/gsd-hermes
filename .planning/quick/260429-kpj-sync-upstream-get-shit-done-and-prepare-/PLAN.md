---
status: in_progress
created: 2026-04-29
quick_id: 260429-kpj
slug: sync-upstream-get-shit-done-and-prepare-
---

# Quick Plan: Sync upstream get-shit-done and publish gsd-hermes

## Goal
Synchronize `pingchesu/gsd-hermes` with latest `gsd-build/get-shit-done` upstream, then create a downstream release and npm package using the `pingchesu` GitHub account.

## Current evidence
- GitHub active account switched to `pingchesu`.
- `origin`: `https://github.com/pingchesu/gsd-hermes.git`.
- `upstream`: `https://github.com/gsd-build/get-shit-done.git`.
- Current downstream latest release/npm: `gsd-hermes@1.6.0`.
- `origin/main`: `f82f29b9`.
- `upstream/main`: `eeaf9c55`.
- Divergence observed: downstream has Hermes-specific commits; upstream has newer commits after previous sync.
- Local npm is not authenticated; publishing should use the repo GitHub Actions release workflow / npm trusted publishing or stored `NPM_TOKEN` secret.

## Steps
1. Create safety branch from current `origin/main` before merge.
2. Merge `upstream/main` into a sync branch preserving merge history.
3. Resolve conflicts with ownership discipline:
   - Upstream workflow/base changes stay upstream-owned.
   - Hermes adapter, installer, command conversion, docs, and tests preserve downstream semantics.
4. Update sync/release metadata:
   - `package.json` / lockfile version to next downstream minor release, expected `1.7.0` unless collision checks require another version.
   - `CHANGELOG.md`, README/COMMANDS/CONFIGURATION if upstream base or user-facing behavior changed.
   - `docs/releases/v1.7.0.md` and a sync log under `docs/sync-logs/`.
5. Run release gates:
   - `npm run test:hermes`
   - `npm test`
   - `npm run test:coverage` if feasible
   - `npm pack --dry-run`
6. Push sync branch and open PR to `main`; monitor CI.
7. Merge when green.
8. Run GitHub Actions `Release` workflow for `1.7.0`:
   - `action=create`
   - `action=rc` (publish `next`) if required by release policy
   - validate install path
   - `action=finalize` (publish `latest`, create GitHub Release)
9. Verify:
   - `npm view gsd-hermes@1.7.0 version`
   - `gh release view v1.7.0`
   - repo main contains release version after release PR merge.

## Guardrails
- Do not publish an already-used npm version, git tag, or GitHub release.
- Do not silently skip Hermes-specific model/runtime semantics during conflict resolution.
- Do not rely on local `npm publish` because this machine is not npm-authenticated.

# Versioning & Release Strategy

GSD Hermes follows [Semantic Versioning 2.0.0](https://semver.org/) for the
downstream `gsd-hermes` npm package.

This project does not mirror upstream `get-shit-done-cc` package versions.
Instead, every release records two separate values:

| Field | Meaning | Example |
|-------|---------|---------|
| `gsd-hermes` version | Public npm package version for this Hermes-focused fork | `1.0.0` |
| Upstream GSD base | Upstream package or release synced into this fork | `get-shit-done-cc@1.37.1` |

If upstream releases `get-shit-done-cc@1.37.2`, the normal downstream release is
`gsd-hermes@1.0.1` with release notes that say it is based on
`get-shit-done-cc@1.37.2`. Do not jump the downstream package to `1.37.2`
unless the downstream project intentionally decides to abandon the independent
version line.

This keeps the npm user experience clear: `npx gsd-hermes@latest` installs the
latest Hermes-focused fork, while the README, changelog, and release notes tell
users which upstream GSD base it contains.

## Release Tiers

| Tier | What ships | Version format | npm tag | Branch | Install |
|------|-----------|---------------|---------|--------|---------|
| **Patch** | Bug fixes, docs, upstream patch syncs | `1.0.1` | `latest` | `hotfix/1.0.1` | `npx gsd-hermes@latest` |
| **Minor** | Non-breaking Hermes support improvements, downstream feature milestones, or upstream minor syncs | `1.2.0` | `latest` (after RC) | `release/1.2.0` | `npx gsd-hermes@next` (RC) |
| **Major** | Breaking downstream CLI, install, or config behavior | `2.0.0` | `latest` (after beta) | `release/2.0.0` | `npx gsd-hermes@next` (beta) |

## npm Dist-Tags

Only two tags, following Angular/Next.js convention:

| Tag | Meaning | Installed by |
|-----|---------|-------------|
| `latest` | Stable production release | `npm install gsd-hermes` (default) |
| `next` | Pre-release (RC or beta) | `npm install gsd-hermes@next` (opt-in) |

The version string (`-rc.1` vs `-beta.1`) communicates stability level. Users never get pre-releases unless they explicitly opt in.

## Semver Rules

| Increment | When | Examples |
|-----------|------|----------|
| **PATCH** (1.0.x) | Bug fixes, docs, test additions, upstream patch syncs with no downstream behavior break | Hermes install fix, SDK repair fix, upstream `1.37.2` sync |
| **MINOR** (1.x.0) | Non-breaking enhancements, new Hermes compatibility features, upstream minor syncs | New Hermes doctor check, new install mode |
| **MAJOR** (x.0.0) | Breaking changes to config format, CLI flags, install layout, or runtime API | Removing a command, changing Hermes config schema |

## Pre-Release Version Progression

Major and minor releases use different pre-release types:

```
Minor: 1.2.0-rc.1   →  1.2.0-rc.2   →  1.2.0
Major: 2.0.0-beta.1 →  2.0.0-beta.2 →  2.0.0
```

- **beta** (major releases only): Feature-complete but not fully tested. API mostly stable. Used for major releases to signal a longer testing cycle.
- **rc** (minor releases only): Production-ready candidate. Only critical fixes expected.
- Each version uses one pre-release type throughout its cycle. The `rc` action in the release workflow automatically selects the correct type based on the version.

## Branch Structure

```
main                              ← stable, always deployable
  │
  ├── hotfix/1.0.1                ← patch: cherry-pick fix from main, publish to latest
  │
  ├── release/1.2.0               ← minor: accumulate fixes + enhancements, RC cycle
  │     ├── v1.2.0-rc.1           ← tag: published to next
  │     └── v1.2.0                ← tag: promoted to latest
  │
  ├── release/2.0.0               ← major: features + breaking changes, beta cycle
  │     ├── v2.0.0-beta.1         ← tag: published to next
  │     ├── v2.0.0-beta.2         ← tag: published to next
  │     └── v2.0.0                ← tag: promoted to latest
  │
  ├── fix/1200-bug-description    ← bug fix branch (merges to main)
  ├── feat/925-feature-name       ← feature branch (merges to main)
  └── chore/1206-maintenance      ← maintenance branch (merges to main)
```

## Release Workflows

### Patch Release (Hotfix)

For critical bugs that can't wait for the next minor release.

1. Trigger `hotfix.yml` with version (e.g., `1.0.1`)
2. Workflow creates `hotfix/1.0.1` branch from the latest patch tag for that minor version (e.g., `v1.0.0` or `v1.0.1`)
3. Cherry-pick or apply fix on the hotfix branch
4. Push — CI runs tests automatically
5. Trigger `hotfix.yml` finalize action
6. Workflow runs full test suite, bumps version, tags, publishes to `latest`
7. Merge hotfix branch back to main

### Minor Release (Standard Cycle)

For accumulated fixes and enhancements.

1. Trigger `release.yml` with action `create` and version (e.g., `1.2.0`)
2. Workflow creates `release/1.2.0` branch from main, bumps package.json
3. Trigger `release.yml` with action `rc` to publish `1.2.0-rc.1` to `next`
4. Test the RC: `npx gsd-hermes@next`
5. If issues found: fix on release branch, publish `rc.2`, `rc.3`, etc.
6. Trigger `release.yml` with action `finalize` — publishes `1.2.0` to `latest`
7. Merge release branch to main

### Major Release

Same as minor but uses `-beta.N` instead of `-rc.N`, signaling a longer testing cycle.

1. Trigger `release.yml` with action `create` and version (e.g., `2.0.0`)
2. Trigger `release.yml` with action `rc` to publish `2.0.0-beta.1` to `next`
3. If issues found: fix on release branch, publish `beta.2`, `beta.3`, etc.
4. Trigger `release.yml` with action `finalize` -- publishes `2.0.0` to `latest`
5. Merge release branch to main

## Conventional Commits

Branch names map to commit types:

| Branch prefix | Commit type | Version bump |
|--------------|-------------|-------------|
| `fix/` | `fix:` | PATCH |
| `feat/` | `feat:` | MINOR |
| `hotfix/` | `fix:` | PATCH (immediate) |
| `chore/` | `chore:` | none |
| `docs/` | `docs:` | none |
| `refactor/` | `refactor:` | none |

## Publishing Commands (Reference)

Current manual npm publishing should use `.github/workflows/publish-npm.yml`
from `main` after the release PR is merged. Prefer Trusted Publishing once npm
trust is configured; use `auth_mode=npm-token` only as a fallback until
[#6](https://github.com/pingchesu/gsd-hermes/issues/6) is resolved.

```bash
# Stable release (sets latest tag automatically)
npm publish

# Pre-release (must use --tag to avoid overwriting latest)
npm publish --tag next

# Verify what latest and next point to
npm dist-tag ls gsd-hermes
```

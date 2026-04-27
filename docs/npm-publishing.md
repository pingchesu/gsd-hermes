# npm Publishing

`gsd-hermes` publishes through GitHub Actions instead of requiring local `npm publish` from a developer machine.

## Recommended Flow

Use the `Publish npm` workflow in `.github/workflows/publish-npm.yml`.

The workflow validates the package name and version, runs the test suite, checks the npm tarball with `npm pack --dry-run`, publishes to npm, and verifies that the expected package version is visible in the npm registry.

For the `gsd-hermes@1.6.0` upstream-sync release, the downstream version is independent from upstream `get-shit-done-cc@1.38.5`. Before running the release/publish workflow, verify npm, local/remote tag, and GitHub Release collision guards are clear:

```bash
npm view gsd-hermes@1.6.0 version --json 2>/dev/null || true
git tag --list v1.6.0
git ls-remote --tags origin refs/tags/v1.6.0
gh release view v1.6.0 --json tagName,url 2>/dev/null || true
```

Local upstream tags can collide with downstream release tags. If `git tag --list v1.6.0` reports a tag that exists only on `upstream` and not on `origin`, delete the local stale tag before creating the downstream `gsd-hermes` release tag.

Do not reuse an existing npm version, git tag, or GitHub Release. If any guard reports an existing artifact, pick the next patch version and update `package.json`, `package-lock.json`, CHANGELOG, and `docs/releases/` before publishing.

For minor upstream-sync releases such as `gsd-hermes@1.6.0`, use the formal `Release` workflow rather than the patch-oriented hotfix workflow:

1. Merge release docs and workflow readiness updates to `main`.
2. Run `Release` with `action=create`, `version=1.6.0`.
3. Run `Release` with `action=rc`, `version=1.6.0` to publish `1.6.0-rc.1` to `next`.
4. Validate the RC install path with `npx gsd-hermes@next`.
5. Run `Release` with `action=finalize`, `version=1.6.0` to publish `latest`.
6. Merge the release branch back to `main` so the repository version matches the published package.

## Publish Workflow Inputs

Use these workflow inputs in GitHub Actions:

- `tag`: `latest` for stable release, `next` for preview distribution
- `auth_mode`: `trusted-publishing` first, `npm-token` if trusted publishing is still failing
- `dry_run`: `true` for readiness validation, `false` for the actual publish

## Trusted Publishing Setup

The preferred long-term path is npm Trusted Publishing. The trusted publisher configuration must match the workflow filename and GitHub environment name exactly:

- Repository: `pingchesu/gsd-hermes`
- Workflow filename: `publish-npm.yml`
- Environment: `npm-publish`

You can configure it with npm package settings UI, or run:

```bash
npm trust github gsd-hermes --repo pingchesu/gsd-hermes --file publish-npm.yml --env npm-publish
```

## Token Fallback

Trusted publishing for this repo still has a tracked setup issue in [#6](https://github.com/pingchesu/gsd-hermes/issues/6). Until that issue is fully closed and re-verified, keep `NPM_TOKEN` available as a controlled fallback for release maintainers.

## Dry Runs

Keep `dry_run` enabled when validating release readiness. Dry runs run the same install, metadata, test, pack, and publish validation path without writing to npm.

```text
GitHub Actions -> Publish npm -> Run workflow -> dry_run=true
```

## Local Fallback Before npm Publish

If you need the unreleased main branch before the next npm publish, install directly from GitHub:

```bash
npx --yes github:pingchesu/gsd-hermes
```

# npm Publishing

`gsd-hermes` publishes through GitHub Actions instead of requiring local `npm publish` from a developer machine.

## Recommended Flow

Use the `Publish npm` workflow in `.github/workflows/publish-npm.yml`.

The workflow validates the package name and version, runs the test suite, checks the npm tarball with `npm pack --dry-run`, publishes to npm, and verifies that the expected package version is visible in the npm registry.

For the upcoming `gsd-hermes@1.2.0` Cross-Provider Agent Execution release, keep the publishing flow simple:

1. Update README / CHANGELOG / release notes first.
2. Run `Publish npm` with `dry_run: true`.
3. If dry run is clean, rerun with `dry_run: false`.
4. Prefer `auth_mode: trusted-publishing`, but keep `npm-token` as the break-glass fallback until issue #6 is closed.

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

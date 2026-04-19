# npm Publishing

`gsd-hermes` publishes through GitHub Actions instead of requiring local `npm publish` from a developer machine.

## Recommended Flow

Use the `Publish npm` workflow in `.github/workflows/publish-npm.yml`.

The workflow validates the package name and version, runs the test suite, checks the npm tarball with `npm pack --dry-run`, publishes to npm, and verifies that the expected package version is visible in the npm registry.

## First Publish

Because `gsd-hermes` is not published yet, the first npm publish cannot use Trusted Publishing. npm trusted publisher configuration is attached to an existing npm package, so bootstrap the package once with a short-lived npm token.

1. Create a granular npm token that can publish `gsd-hermes`.
2. Add it to the GitHub repository as the `NPM_TOKEN` secret.
3. Open GitHub Actions, run `Publish npm`, and use:
   - `tag`: `latest`
   - `auth_mode`: `npm-token`
   - `dry_run`: `false`
4. Delete or rotate the temporary token after the package exists.

## Trusted Publishing Setup

After the first publish, configure npm Trusted Publishing so future releases do not require a long-lived token.

Use npm's package settings UI, or run:

```bash
npm trust github gsd-hermes --repo pingchesu/gsd-hermes --file publish-npm.yml --env npm-publish
```

The trusted publisher configuration must match the workflow filename and GitHub environment name exactly:

- Repository: `pingchesu/gsd-hermes`
- Workflow filename: `publish-npm.yml`
- Environment: `npm-publish`

Future publishes should use:

- `tag`: `latest` or `next`
- `auth_mode`: `trusted-publishing`
- `dry_run`: `false`

## Dry Runs

Keep `dry_run` enabled when validating release readiness. Dry runs run the same install, metadata, test, pack, and publish validation path without writing to npm.

```text
GitHub Actions -> Publish npm -> Run workflow -> dry_run=true
```

## Local Fallback Before npm Publish

Until the package is visible in npm, users can install from GitHub:

```bash
npx --yes github:pingchesu/gsd-hermes
```

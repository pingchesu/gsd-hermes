---
quick_id: 260425-jij
slug: align-gsd-hermes-with-upstream-get-shit-
status: complete
completed: 2026-04-25T06:17:21Z
branch: sync/upstream-cd057255
upstream: cd057255
base_release: 3fd32a24
---

# Summary: align gsd-hermes with upstream get-shit-done

Aligned `gsd-hermes` with `upstream/main@cd057255` from `gsd-build/get-shit-done`.

## Safety

- Preserved pre-sync work on backup branch `backup/ga-bump-1.3.0-before-upstream-sync`.
- Recreated sync work from release commit `3fd32a24` on branch `sync/upstream-cd057255`.
- Bridged ancestry with upstream base `0a049149`, then merged `upstream/main@cd057255`.

## Conflict/local adapter decisions

- Kept upstream release workflow additions while preserving `gsd-hermes` package naming.
- Kept v1.3.0 changelog content and added an Unreleased sync-candidate note for `cd057255`.
- Preserved Hermes installer adapter behavior:
  - Hermes skill frontmatter remains hyphen command-discoverable, e.g. `name: gsd-help`.
  - Upstream Claude/Qwen colon-form skill identity remains available in upstream-owned paths/tests.
  - SDK missing-dist handling remains fail-fast and does not attempt nested npm installs.
- Updated stale-colon reference test allowlist for newly imported upstream-owned tests.

## Verification

Passed:

- `git diff --check`
- `node --test tests/bug-2649-sdk-fail-fast.test.cjs tests/stale-colon-refs.test.cjs`
- `node --test tests/bugs-1656-1657.test.cjs tests/hermes-install.test.cjs tests/hermes-core-workflow.test.cjs tests/hermes-lifecycle.test.cjs`
- `npm run test:hermes` — 97 TAP tests plus 25 SDK config-query tests passed
- `npm test` — 5591 tests passed
- Independent pre-commit review passed with no security concerns or logic errors.

## Notes

- `npm test` emitted environment/dependency warnings under Node v20.19.5 while package engines require Node >=22, plus npm audit notices; tests still passed.
- Static scan false-positive matches were JavaScript `RegExp.exec()` calls, not dangerous `eval`/`exec` execution.

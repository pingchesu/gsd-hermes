# Phase 13 Research — Tracker, Documentation, Release

Date: 2026-04-26
Route: `/gsd-plan-phase 13 --auto`
Mode: sequential inline planning under Hermes runtime compatibility fallback

## Research question

How should the v1.4 Hermes Runtime Model Binding Receipts milestone be made reviewable and shippable after Phases 10–12 landed resolver receipts, Hermes child model propagation, fail-fast validation tests, and safe provider diagnostics?

## Inputs read

- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/phases/12-fail-fast-validation-and-proof-tests/12-SUMMARY.md`
- `README.md`
- `docs/COMMANDS.md`
- `docs/CONFIGURATION.md`
- `docs/hermes-compatibility.md`
- `CHANGELOG.md`
- `package.json`
- GitHub repository metadata via `gh repo view`
- Existing issue search via `gh issue list`
- Published package/release state via `npm view gsd-hermes version` and `gh release view v1.4.0`

## Current release facts

- Repository: `pingchesu/gsd-hermes`
- Default branch: `main`
- Current local branch: `main`
- Package file version: `1.4.0`
- npm registry already has `gsd-hermes@1.4.0`
- GitHub Release `v1.4.0` already exists and was published on 2026-04-25 for the upstream-sync release.
- Local HEAD is ahead of tag `v1.4.0` with the v1.4 runtime binding receipt work from Phase 10–12.

## Important release constraint

npm package versions are immutable. Because `gsd-hermes@1.4.0` already exists, Phase 13 execution must not attempt to publish `1.4.0` again. The default release plan is therefore:

- Treat this milestone as the `v1.4` feature line.
- Ship the new runtime binding receipt work as `gsd-hermes@1.4.1` / GitHub Release `v1.4.1`, unless the maintainer explicitly chooses a different semver.
- Update docs/release notes to explain that `1.4.0` was the upstream-sync package and `1.4.1` is the Hermes runtime model binding receipt patch release.

This reconciles REL-04 with the actual registry state without violating npm immutability.

## Existing tracker issue search

A search for `Hermes Runtime Model Binding Receipts OR model binding OR runtime model` found only unrelated closed issue #14 (`Ship v1.2 Cross-Provider Agent Execution milestone`). Phase 13 should create a new tracker issue instead of updating #14.

## Documentation gaps to close

1. `README.md`
   - Currently mentions package `gsd-hermes@1.4.0` and links the existing v1.4 upstream-sync release note.
   - Needs a short Hermes strict model binding section that points users to verification commands and proof boundaries.

2. `docs/COMMANDS.md`
   - Current v1.4 release note only describes upstream command-surface sync.
   - Needs command-level explanation of `/gsd-plan-phase` and `/gsd-execute-phase` model binding receipts, plus how to interpret `runtime_enforced=unknown`.

3. `docs/CONFIGURATION.md`
   - Already says Hermes avoids silent model fallback.
   - Needs concrete config examples for `model_overrides`, invalid override fail-fast behavior, and `workflow.cross_ai_execution` as an explicit alternative rather than silent fallback.

4. `docs/hermes-compatibility.md`
   - Already contains Phase 10–11 receipt layer wording.
   - Needs Phase 12 update for fail-fast validation, safe provider diagnostics, and the remaining provider-wire proof boundary.

5. `CHANGELOG.md` and `docs/releases/`
   - Existing `1.4.0` section is an upstream-sync release.
   - Needs a new `1.4.1` section/release note for runtime model binding receipts.

## PR / CI / publish constraints

- Keep `.planning/` artifacts out of clean PR branches unless intentionally shipping planning records. In this repo, planning artifacts may be committed locally, but PR preparation should use the established clean-branch workflow if security/CI rejects `.planning/`.
- Before PR, run at minimum:
  - `npm run build:sdk`
  - `npm run test:hermes`
  - `npm test`
  - Hermes Agent targeted tests relevant to local patched runtime if release notes claim Hermes child construction proof.
- PR body should include tracker issue link, root cause, proof boundary, validation output, and release-version decision (`1.4.1` because `1.4.0` already exists).
- Publish should only occur after PR CI passes and the maintainer confirms release credentials/scope.

## Recommended Phase 13 plan shape

1. Tracker + PR acceptance artifact.
2. Docs/release note/version metadata update.
3. PR/CI/release/publish flow with explicit version-collision guard.

## Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Duplicate issue | Search first, create only if no matching open issue exists. |
| Attempting to republish `1.4.0` | Default to `1.4.1`; verify `npm view gsd-hermes version` before publish. |
| Overclaiming provider proof | Docs must say child-construction proof exists; provider wire-level enforcement remains not overclaimed. |
| Leaking secrets in diagnostics | Only mention sanitized metadata; never include headers/body/tokens/API keys. |
| PR contaminated with planning artifacts | Use clean PR branch workflow if required by CI/security; planning artifacts can stay local/shared history. |
| CI mismatch from Node version | Note local Node v20 emits `EBADENGINE` warnings for package `>=22`; release/CI should run on Node 22+. |

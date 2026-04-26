# Phase 13 Plan Validation — Tracker, Documentation, Release

Date: 2026-04-26

## Validation architecture

Phase 13 is a release/documentation phase with external side effects. The plan therefore validates three layers:

1. Tracker/review layer — issue and PR body must record root cause, acceptance criteria, proof boundary, and validation commands.
2. Docs/release metadata layer — README, COMMANDS, CONFIGURATION, Hermes compatibility docs, changelog, release note, and package metadata must agree.
3. Shipping layer — local tests, PR CI, npm publish, and GitHub Release evidence must be recorded.

## Plan coverage

| Plan | Requirements | Primary risk addressed |
| --- | --- | --- |
| 13-01 | REL-01 | Missing or duplicate tracker; weak acceptance criteria |
| 13-02 | REL-02, REL-03 | Docs overclaiming provider proof or omitting strict fail-fast semantics |
| 13-03 | REL-04 | Publishing wrong/duplicate version or releasing before CI passes |

## Release-version validation

Discovery found `gsd-hermes@1.4.0` already published and GitHub Release `v1.4.0` already present. The plans therefore require a publishable patch version, selected `1.4.30`, before npm publish.

This is a hard validation gate: execution must abort if `package.json` remains `1.4.0` at publish time.

## Verification matrix

| Gate | Command / evidence | Owner plan |
| --- | --- | --- |
| Tracker issue exists | `gh issue list --state open --search "Hermes runtime model binding receipts"` | 13-01 |
| PR body draft exists | `.planning/phases/13-tracker-documentation-release/13-PR-BODY-DRAFT.md` | 13-01 |
| Package version is publishable | `npm view gsd-hermes versions --json`; package version not already present | 13-02 / 13-03 |
| Package metadata matches | `node -e "const p=require('./package.json'); const l=require('./package-lock.json'); if (p.version !== l.version) throw new Error(...)"` | 13-02 |
| Hermes docs gate | `npm run test:hermes` | 13-02 / 13-03 |
| Full regression | `npm test` | 13-03 |
| Tarball sanity | `npm pack --dry-run` | 13-03 |
| CI green | `gh pr checks --watch` | 13-03 |
| Release evidence | npm version + GitHub Release URL in summary | 13-03 |

## Plan-check result

Automated artifact validation: PASS.

Plan-checker review: PASS after revisions.

Revisions applied after checker feedback:

- Updated stale `1.4.0` release wording in ROADMAP validation matrix and REL-04 to the next publishable v1.4 patch release, default `1.4.30`.
- Added explicit static evidence and runtime evidence sections to the tracker issue draft.
- Strengthened Plan 13-01 acceptance criteria to require static/runtime evidence.
- Strengthened Plan 13-03 publish preflight to require package-version, tag, and GitHub Release non-existence checks.
- Made Phase 13 closeout artifacts and state updates explicit.

Rationale:

- Every Phase 13 success criterion maps to at least one plan.
- The discovered `1.4.0` publication conflict is explicitly handled before publish.
- External side effects are gated in the execution plans.
- Proof boundaries remain conservative and layered.
- Verification commands are concrete and measurable.

## Known caveat

`npx gsd-sdk query state.begin-phase` emitted local `EBADENGINE` warnings because the current Node is v20.19.5 while `package.json` requires Node >=22. The command still completed. Phase 13 release validation should run on Node 22+.

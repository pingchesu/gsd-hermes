---
phase: 05-lifecycle-tooling
status: complete
created: 2026-04-19
---

# Phase 5 Pattern Map

## Closest Existing Patterns

| Target | Closest Analog | Pattern to Reuse |
| --- | --- | --- |
| Hermes project-linked config cleanup | `ensureHermesExternalDir()` in `bin/install.js` | Normalize paths, preserve unrelated YAML text, mutate only `skills.external_dirs`. |
| Hermes lifecycle tests | `tests/hermes-install.test.cjs` and `tests/hermes-project-linked.test.cjs` | Use temp `HOME`, temp project, subprocess installer runs, and deterministic filesystem assertions. |
| Manifest/uninstall safety | `tests/bug-1908-uninstall-manifest.test.cjs` | Build fake installs and assert `gsd-file-manifest.json` cleanup. |
| Docs assertions | `tests/hermes-docs.test.cjs` | Assert exact strings in docs and installer help to prevent stale support claims. |
| Optional runtime smoke | `tests/hermes-core-workflow.test.cjs` | Probe `hermes --version`; skip diagnostically when unavailable. |

## Files Likely Modified

- `bin/install.js` - add Hermes-specific uninstall/config cleanup and doctor helpers.
- `tests/hermes-lifecycle.test.cjs` - new lifecycle regression suite.
- `tests/hermes-install.test.cjs` - update safety assertions if needed.
- `tests/hermes-docs.test.cjs` - lifecycle docs assertions.
- `docs/hermes-install.md` - update/uninstall/doctor operator guide.
- `docs/hermes-compatibility.md` - lifecycle support status.

## Implementation Constraints

- Do not remove or rewrite unrelated Hermes config.
- Do not require real Hermes in CI.
- Do not advertise native local Hermes install.
- Keep update as reinstall-over-existing unless a concrete failing test proves a separate updater is required.


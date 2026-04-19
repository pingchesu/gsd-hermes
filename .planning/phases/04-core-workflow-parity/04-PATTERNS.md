# Phase 4 Pattern Map

**Phase:** 04 - Core Workflow Parity
**Date:** 2026-04-19

## Closest Existing Patterns

| Target Work | Closest Analog | Reuse Pattern |
| --- | --- | --- |
| Hermes install fixture tests | `tests/hermes-install.test.cjs` | Use temp `HOME`, temp project, `spawnSync(process.execPath, [installPath, ...])`, and fixture cleanup helpers. |
| Project-linked config checks | `tests/hermes-project-linked.test.cjs` | Count path occurrences and assert idempotent `skills.external_dirs` mutation. |
| Docs/compatibility assertions | `tests/hermes-docs.test.cjs` | Read docs and installer source as strings, assert exact compatibility wording. |
| Runtime conversion seam | `bin/install.js` `copyCommandsAsHermesSkills()` | Keep Hermes-specific behavior behind a named helper, even when sharing implementation. |
| Path replacement hardening | `copyWithPathReplacement()` and runtime-specific converters | Extend replacement centrally instead of editing every workflow markdown file. |

## File Roles

| File | Role |
| --- | --- |
| `bin/install.js` | Runtime adapter seam, path replacement, generated skill output, optional smoke output. |
| `tests/hermes-core-workflow.test.cjs` | New deterministic fixture suite for core workflow parity contracts. |
| `tests/hermes-docs.test.cjs` | Compatibility docs and boundary regression tests. |
| `docs/hermes-install.md` | User-facing install and smoke guide. |
| `docs/hermes-compatibility.md` | Truth table for supported/degraded/planned Hermes surfaces. |

## Implementation Notes

- Keep all mutating tests inside temporary directories.
- Do not use real `~/.hermes` or this repo's `.planning/` for smoke fixtures.
- Prefer generated-output assertions over editing upstream workflow source files.
- If a workflow source edit is unavoidable, keep it surgical and test why.

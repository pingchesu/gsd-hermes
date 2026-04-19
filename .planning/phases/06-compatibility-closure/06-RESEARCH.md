---
phase: 06-compatibility-closure
status: complete
created: 2026-04-19
---

# Phase 6 Research: Compatibility Closure

## Research Complete

Phase 6 should turn the Hermes support surface from "implemented across prior
phases" into a repeatable compatibility contract. The high-value gap is not a
large new runtime feature. The gap is that maintainers need one obvious
validation path after upstream sync, and the docs need to connect support claims
to deterministic evidence.

## Current Implementation Facts

- Hermes install, command discovery, core workflow smoke, update, uninstall,
  and doctor behavior are already covered by deterministic tests.
- `tests/hermes-core-workflow.test.cjs` verifies global/project-linked core
  skill installation, executable Claude path leaks in installed workflow
  copies, compatibility guidance, and optional real Hermes smoke skip behavior.
- `tests/hermes-lifecycle.test.cjs` verifies external_dirs cleanup, update patch
  backup, uninstall, doctor, and lifecycle end-to-end behavior.
- `tests/hermes-docs.test.cjs` verifies the install guide and compatibility
  matrix contain truthful support language.
- `tests/multi-runtime-select.test.cjs` verifies Hermes runtime selection and
  installer help text.
- `docs/upstream-sync.md` documents the merge-first sync model, but does not yet
  provide a post-sync validation command sequence or release-blocker criteria.
- `docs/hermes-compatibility.md` has the compatibility matrix, but the matrix is
  still mostly a status table rather than a test-linked maintenance artifact.

## Recommended Implementation Shape

### Compatibility Validation Entry Point

Add a small repository-local validation entry point that runs the targeted
Hermes compatibility tests. Keep it deterministic and CI-friendly:

- `scripts/validate-hermes-compat.cjs`
- `npm run test:hermes`
- targeted command:
  `node --test tests/hermes-core-workflow.test.cjs tests/hermes-lifecycle.test.cjs tests/hermes-docs.test.cjs tests/multi-runtime-select.test.cjs`

This avoids asking maintainers to remember the exact test list and gives
upstream-sync docs a stable command to cite. It should not require a real Hermes
binary; optional real CLI checks remain skipped diagnostics.

### Upstream Sync Checklist

Strengthen `docs/upstream-sync.md` with an operational checklist:

1. Clean tree preflight.
2. Fetch `upstream/main`.
3. Merge into downstream branch.
4. Classify conflicts as `Upstream base`, `Hermes adapter seam`, or
   `Downstream governance`.
5. Run `npm run test:hermes`.
6. Run `npm test` when feasible.
7. Review `docs/hermes-compatibility.md` if runtime behavior or status changed.

Release-blocker criteria should be explicit. Regressions in install, command
discovery, core lifecycle, update/uninstall/doctor safety, or docs truthfulness
block release. Missing real Hermes binary does not block release by itself.

### Compatibility Matrix

Update `docs/hermes-compatibility.md` so each support claim points at validation
evidence or manual smoke. The matrix should continue to say project-linked mode
is `skills.external_dirs`, not native local install.

## Validation Architecture

Phase 6 validation should run at two levels:

- Targeted Hermes validation: `npm run test:hermes`
- Full repository validation: `npm test`

The targeted command should stay under a few seconds locally and should be the
required check after touching Hermes adapter seams or upstream sync docs. Full
suite validation remains the final release gate when feasible.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Sync checklist diverges from actual commands | Add docs tests that assert the checklist references `npm run test:hermes` and `npm test`. |
| Compatibility docs overstate support | Keep docs tests asserting `project-linked`, `skills.external_dirs`, degraded paths, and native local out-of-scope language. |
| New validation command becomes a hidden dependency on real Hermes | Keep optional real Hermes checks probe-gated inside existing tests. |
| Package script creates upstream drift | Keep the change small, explicitly downstream, and route it through compatibility validation. |

## Planning Recommendation

Use three plans:

1. Add the compatibility validation command and regression test.
2. Formalize upstream sync checklist and release-blocker criteria.
3. Publish test-linked compatibility matrix and maintenance guidance.


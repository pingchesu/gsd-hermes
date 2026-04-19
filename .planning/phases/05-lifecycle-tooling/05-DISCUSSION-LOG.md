# Phase 5: Lifecycle Tooling - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19
**Phase:** 05-lifecycle-tooling
**Mode:** `--auto`
**Areas discussed:** Lifecycle command scope, Update behavior, Uninstall safety, Doctor diagnostics, Regression and documentation contract

---

## Lifecycle Command Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Hermes adapter seam | Implement lifecycle behavior in installer helpers, compatibility docs, and focused tests. | ✓ |
| Workflow rewrite | Rewrite broad upstream workflow markdown to be Hermes-native. | |
| New Hermes-only vocabulary | Add separate Hermes lifecycle command names. | |

**User's choice:** `[auto]` Hermes adapter seam.
**Notes:** This follows the Phase 1 fork rule and Phase 4 degraded-path strategy. Phase 5 should not create broad upstream drift.

---

## Update Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Reinstall-over-existing with manifest backup | Reuse existing manifest/local patch backup before replacing GSD-owned Hermes files. | ✓ |
| In-place patch individual files | Mutate individual installed files without rebuilding the install tree. | |
| Require real Hermes CLI for update | Make update dependent on a live Hermes runtime. | |

**User's choice:** `[auto]` Reinstall-over-existing with manifest backup.
**Notes:** This is the lowest-drift path because `writeManifest()`, `saveLocalPatches()`, and `reportLocalPatches()` already exist.

---

## Uninstall Safety

| Option | Description | Selected |
|--------|-------------|----------|
| Remove only GSD-owned artifacts | Delete `gsd-*` skills, copied GSD files, manifest, and matching project-linked external_dirs entry only. | ✓ |
| Remove whole Hermes config root | Delete `~/.hermes` or broad config sections. | |
| Leave project-linked external_dirs behind | Avoid config mutation but leave stale paths. | |

**User's choice:** `[auto]` Remove only GSD-owned artifacts.
**Notes:** Project-linked uninstall must remove only the exact normalized path it added and preserve unrelated Hermes config.

---

## Doctor Diagnostics

| Option | Description | Selected |
|--------|-------------|----------|
| Read-only actionable diagnostics | Report install health, stale paths, duplicate entries, path leaks, manifest state, and optional Hermes availability. | ✓ |
| Auto-repair by default | Mutate configs and delete files automatically. | |
| Real-Hermes-only doctor | Require `hermes` on PATH before diagnostics can run. | |

**User's choice:** `[auto]` Read-only actionable diagnostics.
**Notes:** Doctor must work in CI and maintainer machines without Hermes installed; real CLI probe remains optional.

---

## Regression and Documentation Contract

| Option | Description | Selected |
|--------|-------------|----------|
| Deterministic temp fixture tests plus docs assertions | Extend existing temp `HOME`/project tests and docs tests. | ✓ |
| Manual-only lifecycle validation | Document commands without automated regression coverage. | |
| Full live-runtime CI | Require real Hermes in CI. | |

**User's choice:** `[auto]` Deterministic temp fixture tests plus docs assertions.
**Notes:** This matches Phase 4's verification contract: real Hermes smoke is best-effort; deterministic tests are required.

---

## the agent's Discretion

- Exact helper names and file split for lifecycle diagnostics.
- Exact doctor severity labels and output shape, provided they are stable and testable.
- Whether lifecycle doctor is exposed as installer flag, CLI helper, or both, provided docs and tests match implementation.

## Deferred Ideas

- Phase 6 owns upstream sync closure and broad compatibility hardening.
- Native local Hermes install remains out of scope.
- Hermes `/gsd-reapply-patches` slash command can be validated later unless Phase 5 explicitly includes it.

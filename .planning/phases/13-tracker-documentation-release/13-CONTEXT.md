# Phase 13 Context — Tracker, Documentation, Release

Generated: 2026-04-26
Route: `/gsd-plan-phase 13 --auto`

## Phase objective

Make the v1.4 Hermes runtime model binding work reviewable, documented, and releasable.

Phase 13 covers requirements:

- REL-01 — GitHub tracker issue exists with root cause and acceptance criteria.
- REL-02 — Documentation explains resolver output, workflow receipts, Hermes child construction, and provider request metadata diagnostics.
- REL-03 — README, COMMANDS.md, CONFIGURATION.md, and release notes describe strict per-agent model binding semantics for Hermes.
- REL-04 — The v1.4 release line is shipped with GitHub Release and npm evidence after tests/CI pass.

## Completed technical foundation

Phase 10:

- Added structured plan/execute init model binding receipts.
- Kept proof semantics conservative: resolver intent and workflow handoff are visible, but runtime enforcement is unknown unless proven.

Phase 11:

- Added Hermes Agent `delegate_task(model=...)` and batch `tasks[].model` support.
- Precedence: `tasks[i].model > top-level model > delegation.model > parent inheritance`.
- Added GSD `runtime_binding_channel` receipt metadata.
- Proved Hermes child `AIAgent(model=...)` construction, not provider wire-level dispatch.

Phase 12:

- Added SDK/CJS validation tests for unavailable explicit channel fail-fast behavior.
- Proved invalid explicit tokens are preserved rather than replaced by parent/default model.
- Added Hermes tests for planner/executor child construction.
- Added offline safe provider diagnostics that preserve model/provider metadata while redacting credentials.
- Full GSD suite passed `5597/5597`; Hermes targeted suite passed `128/128`.

## Release-version decision

The original roadmap success criterion says `gsd-hermes@1.4.0`, but registry/release discovery found:

- `npm view gsd-hermes version` returns `1.4.0`.
- GitHub Release `v1.4.0` already exists.
- Local HEAD contains runtime binding receipt commits after tag `v1.4.0`.

Because npm versions are immutable, the executable default is to ship this as `1.4.30` in the v1.4 line. Execution should not publish until this is reflected in docs/release notes and confirmed in the PR body.

## Proof wording to preserve

Use this exact distinction in docs and release notes:

- GSD resolver proof: `model_overrides` resolve to explicit configured/resolved model tokens.
- Workflow receipt proof: `/gsd-plan-phase` and `/gsd-execute-phase` show structured `model_binding_receipts` before dispatch.
- Hermes child-construction proof: delegated children are constructed with the intended `model` value.
- Provider diagnostics: sanitized metadata can expose model/provider/request proof fields without credentials.
- Provider wire-level enforcement: still not overclaimed unless future live provider instrumentation proves provider-side `model=` dispatch.

## External side-effect gates

Phase 13 execution may create GitHub issues/PRs and publish packages. Before publish:

1. Confirm release target version (`1.4.30` recommended).
2. Confirm npm auth and release scope are available.
3. Confirm PR CI is green.
4. Confirm no unintended `.planning/` artifacts are included in the PR branch unless explicitly desired.

## Suggested tracker title

`Track v1.4 Hermes runtime model binding receipts and fail-fast enforcement`

## Suggested PR title

`Ship Hermes runtime model binding receipts and fail-fast enforcement`

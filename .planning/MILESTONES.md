# Milestones

## v1.2 Cross-Provider Agent Execution (Shipped: 2026-04-23)

**Delivered:** Established strict cross-provider runtime/model semantics for `gsd-hermes`, including canonical runtime-model contract, fail-fast validation, Hermes direct mixed-provider support, explicit cross-AI fallback hardening, and broad workflow/docs/test propagation.

**Phases completed:** 5-8 (8 plans total)

**Key accomplishments:**
- Added a canonical SDK runtime-model contract and aligned legacy CJS model resolution to the same semantics.
- Enforced fail-fast runtime/model validation with actionable diagnostics and no silent fallback.
- Fixed `runtime: "hermes"` handling so Hermes can directly honor mixed-provider explicit bindings.
- Hardened `cross_ai_execution` as the explicit fallback path with deterministic routing and stricter external result validation.
- Propagated runtime/model/cross-AI visibility through init payloads, workflow surfaces, and settings/progress UX.
- Aligned configuration, user guide, features, commands, and key translated docs to one consistent semantic model.

**Stats:**
- 45 product files changed across milestone execution commits.
- 2,675 insertions and 23 deletions from `3deb76a` through `078be9e`.
- 4 phases, 8 plans.
- 1 day from milestone start to close.

**Evidence:**
- Root targeted runtime-model suite passed.
- `npm run test:hermes` passed.
- Git tag: `v1.2`

**What's next:** Start a new milestone for release workflow automation and/or downstream release packaging of the v1.2 semantics.

---

## v1.1 Upstream Sync and Release (Shipped: 2026-04-22)

**Delivered:** Published `gsd-hermes@1.1.0` with upstream `get-shit-done-cc@1.38.2` synced and Hermes runtime compatibility preserved.

**Phases completed:** 1-4 (10 plans total)

**Key accomplishments:**

- Merged upstream `get-shit-done` at `7397f580a555491eb2ba0d4e51d8dafbd489a1db` while preserving downstream Hermes runtime support.
- Verified Hermes install, SDK query behavior, model override configuration, and command discovery after the upstream sync.
- Updated package, README, and changelog metadata for downstream `gsd-hermes@1.1.0` and upstream base `get-shit-done-cc@1.38.2`.
- Opened, validated, and merged release PR #12 with all GitHub checks passing.
- Published `gsd-hermes@1.1.0` to npm with `latest -> 1.1.0`.
- Created GitHub Release `v1.1.0`.

**Stats:**

- 280 product files changed in release PR #12.
- 22,608 insertions and 2,087 deletions from `af97571` to `a7b0d33`.
- 4 phases, 10 plans.
- 1 day from milestone start to ship.

**Release evidence:**

- PR: https://github.com/pingchesu/gsd-hermes/pull/12
- npm publish workflow: https://github.com/pingchesu/gsd-hermes/actions/runs/24759583653
- GitHub Release: https://github.com/pingchesu/gsd-hermes/releases/tag/v1.1.0
- npm package: https://www.npmjs.com/package/gsd-hermes/v/1.1.0

**What's next:** Start the next milestone for upstream sync automation and release workflow hardening.

---

## v1.0 Initial Hermes Fork Launch

**Status:** Shipped
**Downstream releases:** `gsd-hermes@1.0.0`, `gsd-hermes@1.0.1`
**Upstream base:** `get-shit-done-cc@1.37.1`

**Shipped:**

- Independent `gsd-hermes` npm package identity.
- Hermes Agent runtime install support.
- Stale SDK rebuild check for `gsd-sdk query`.
- SDK user-prefix fallback for root-owned global npm prefixes.
- Version strategy documenting downstream version and upstream base separately.

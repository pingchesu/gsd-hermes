# Hermes Compatibility and Guardrails

This document makes the current Hermes support boundary explicit after Phase 6.
It should be read alongside [Fork Ownership](./fork-ownership.md),
[Upstream Sync Workflow](./upstream-sync.md), and
[Hermes Install](./hermes-install.md) so future runtime work stays inside the
approved seams.

## Compatibility Matrix

| Surface | Status | Validation evidence | Notes |
| --- | --- | --- | --- |
| Global Hermes install | supported | `npm run test:hermes` | `--hermes --global` writes command skills to `~/.hermes/skills/gsd-*/SKILL.md`. |
| Project-linked external_dirs mode | supported | `npm run test:hermes` | `--hermes --local` writes `.gsd-hermes/skills/gsd-*/SKILL.md` and registers the absolute path in `~/.hermes/config.yaml` under `skills.external_dirs`. |
| Hermes runtime selection in installer | supported | `npm run test:hermes` | Hermes is available through `--hermes`, runtime selection prompts, and `--all`. |
| Command discovery for /gsd-* | supported | `npm run test:hermes` | Phase 3 generates Hermes `SKILL.md` command skills with `name: gsd-*`; smoke with `/gsd-help`. |
| Core workflow execution | supported with degraded paths | `npm run test:hermes` | Covers new-project, discuss, plan, execute, verify, progress, settings, and update smoke coverage with documented fallbacks for unavailable Hermes runtime capabilities. |
| Update / uninstall / doctor | supported | `npm run test:hermes` | Phase 5 complete: global and project-linked lifecycle coverage includes reinstall updates, safe uninstall, read-only doctor diagnostics, and deterministic fixture coverage. |
| Upstream sync routine | supported maintenance workflow | `npm run test:hermes` plus `npm test` when feasible | Sync review stays anchored to governance docs and merge history from upstream/main so Hermes drift remains visible. |
| Native local Hermes install mode | out of scope | Documentation and docs tests | Project-linked mode uses skills.external_dirs instead. |

## Known Gaps

- Project-linked mode depends on `~/.hermes/config.yaml` `skills.external_dirs`, so duplicate global and project-linked command names can depend on Hermes discovery order.

## Adapter Guardrails

- Prefer adapter or shim changes over workflow rewrites.
- Do not claim a native local Hermes install mode.
- Keep Hermes patches concentrated in installer, runtime conversion, compatibility, documentation, and test layers.
- If a change touches get-shit-done/workflows/ broadly, stop and justify it against D-02 before implementation.
- Use merge history from upstream/main to review Hermes drift before broadening a patch.

## Maintenance Contract

Run `npm run test:hermes` after Hermes adapter seam changes and after every
upstream sync. Run `npm test` as the full-suite release gate when feasible.

When Hermes cannot support an upstream behavior immediately, record known gaps instead of claiming unsupported parity. Release notes and docs should preserve the distinction between supported behavior, supported degraded paths, and out-of-scope native local install semantics.

## Phase Mapping

| Surface | Target phase | Ownership label | Routing note |
| --- | --- | --- | --- |
| Global Hermes install | Phase 3 | Hermes adapter seam | Supported through generated `~/.hermes/skills/gsd-*` command skills. |
| Project-linked external_dirs mode | Phase 3 | Hermes adapter seam | Supported through `.gsd-hermes/skills` plus `~/.hermes/config.yaml` `skills.external_dirs`. |
| Hermes runtime selection in installer | Phase 2 | Hermes adapter seam | Runtime selection belongs in installer surfaces, not a broad rewrite of the upstream workflow tree. |
| Command discovery for /gsd-* | Phase 3 | Hermes adapter seam | Supported through Hermes `SKILL.md` command generation and discovery smoke checks. |
| Core workflow execution | Phase 4 | Upstream base | Phase 4 complete: supported with degraded paths through deterministic fixture coverage plus documented degraded paths where Hermes needs them. |
| Update / uninstall / doctor | Phase 5 | Hermes adapter seam | Phase 5 complete: supported through update/uninstall/doctor lifecycle tests and operator docs. |
| Upstream sync routine | Phase 6 | Downstream governance | Sync review stays anchored to governance docs and merge history from upstream/main so Hermes drift remains visible. |
| Native local Hermes install mode | Phase 6 | Downstream governance | This remains out of scope; later phases preserve the boundary rather than turning it into a supported mode. |

The ownership labels above follow [Fork Ownership](./fork-ownership.md):
`Upstream base` stays merge-friendly, `Hermes adapter seam` contains bounded
runtime work, and `Downstream governance` records the policy and compatibility
truth that future phases must not overstate.

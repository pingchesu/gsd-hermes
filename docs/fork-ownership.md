# Fork Ownership

## Goal

Make ARCH-01 mechanically answerable by defining which paths belong to the
upstream base, which paths form the Hermes adapter seam, and which paths remain
Downstream governance in this fork.

## Root-Preserving Layout

The upstream `get-shit-done` layout will remain at repo root per D-01.
Phase 1 will avoid repo-wide restructuring per D-03.
Hermes-specific changes should stay concentrated in installer, runtime
conversion, compatibility, documentation, and test layers per D-02.

## Path Ownership Matrix

| Path | Owner | Why it routes here |
| --- | --- | --- |
| `.planning/` | Downstream governance | Planning state, roadmap, requirements, and execution artifacts are fork-local governance records. |
| `AGENTS.md` | Downstream governance | Runtime-facing contract for this fork that must stay aligned with planning decisions and compatibility truth. |
| `agents/` | Upstream base | Imported upstream agent definitions should stay merge-friendly and upstream-aligned by default. |
| `commands/` | Upstream base | Broad workflow entrypoints belong to the upstream base unless a later plan proves a bounded runtime seam is required. |
| `get-shit-done/` | Upstream base | Core workflows, references, and templates remain upstream-owned surfaces at repo root. |
| `hooks/` | Upstream base | Hook behavior is shared workflow infrastructure and should default to upstream alignment. |
| `sdk/` | Upstream base | Core CLI/query implementation belongs to the upstream base unless a later bounded runtime seam is explicitly defined. |
| `tests/` | Hermes adapter seam | Hermes-specific regression coverage belongs in the test layer without implying broad workflow rewrites. |
| `docs/` | Downstream governance | Governance docs, compatibility truth, and sync rules live here for maintainers and must stay explicit. |
| `bin/install.js` | Hermes adapter seam | Runtime selection, path ownership, and install conversion logic belong in the Hermes adapter seam. |

## Change Routing Rules

If a change touches workflow behavior broadly, default to "upstream-owned".
If a change adds runtime path, config, or conversion logic, default to "Hermes adapter seam".
If a change records project policy, compatibility truth, or sync rules, default to "Downstream governance".

Use the matrix above to route concrete file paths after that default:
`Upstream base` keeps the imported repo layout merge-friendly, `Hermes adapter seam`
contains bounded runtime work, and `Downstream governance` stays aligned with
`AGENTS.md` and planning artifacts.

## Phase 1 Boundaries

Hermes runtime implementation is intentionally out of scope for this phase per D-08.
Phase 1 only defines the ownership map and routing rules needed before upstream
import, installer work, or broader runtime changes begin.

# GSD Hermes

**GSD Hermes** is a downstream fork of [get-shit-done-cc](https://github.com/gsd-build/get-shit-done) that adds Hermes Agent runtime support while preserving upstream GSD workflows.

- **Package:** `gsd-hermes@1.3.0`
- **Upstream base:** `upstream/main@0a049149` (97 commits above `v1.38.2`)
- **Install:** `npx gsd-hermes --hermes --global`

## Install & Quickstart

Hermes install modes (global, project-linked external-dir, macOS canonicalization) are documented in [docs/hermes-install.md](docs/hermes-install.md).

Quick start:

```bash
npx gsd-hermes --hermes --global
```

Other modes — project-linked external-dir, per-user prefix fallback, macOS canonicalization — see [docs/hermes-install.md](docs/hermes-install.md).

## Workflow

After install, GSD commands (`/gsd-new-project`, `/gsd-plan-phase`, `/gsd-execute-phase`, etc.) run against a Hermes Agent runtime the same way they run on any other supported runtime. Hermes-specific semantics — runtime selection, model profile composition, `/gsd:` slash syntax dual-track — are documented in [docs/hermes-compatibility.md](docs/hermes-compatibility.md).

Compatibility gate: `npm run test:hermes` validates Hermes install modes + SDK query behavior + runtime-model parity + slash command inventory. This gate is the single authoritative Hermes-specific regression signal.

## Docs

- [docs/hermes-install.md](docs/hermes-install.md) — Hermes install modes (global, external-dir, macOS canonicalization)
- [docs/hermes-compatibility.md](docs/hermes-compatibility.md) — Compatibility surface contract, runtime-model composition, slash command inventory
- [docs/fork-ownership.md](docs/fork-ownership.md) — Path ownership matrix + merge-conflict routing rules
- [docs/upstream-sync.md](docs/upstream-sync.md) — Upstream sync workflow + sync-log precedent
- [docs/sync-logs/2026-04-sync-0a049149.md](docs/sync-logs/2026-04-sync-0a049149.md) — Per-hunk classification for the v1.3 upstream sync

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Based on Upstream GSD

Based on upstream `get-shit-done-cc@0a049149` — see [the upstream project](https://github.com/gsd-build/get-shit-done) for the source GSD system this fork extends.

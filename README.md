# GSD Hermes

**GSD Hermes** is a downstream fork of [get-shit-done-cc](https://github.com/gsd-build/get-shit-done) that adds Hermes Agent runtime support while preserving upstream GSD workflows.

- **Package:** `gsd-hermes@1.6.0`
- **Upstream base:** `upstream/main@9472f343` (`get-shit-done-cc@1.38.5`, synced from `f3685d91..9472f343`)
- **Install:** `npx gsd-hermes --hermes --global`

## Install & Quickstart

Hermes install modes (global, project-linked external-dir, macOS canonicalization) are documented in [docs/hermes-install.md](docs/hermes-install.md).

Quick start:

```bash
npx gsd-hermes --hermes --global
```

Other modes — project-linked external-dir, per-user prefix fallback, macOS canonicalization — see [docs/hermes-install.md](docs/hermes-install.md).

## Workflow

After install, GSD commands (`/gsd-new-project`, `/gsd-plan-phase`, `/gsd-execute-phase`, etc.) run against a Hermes Agent runtime the same way they run on any other supported runtime. Hermes-specific semantics — runtime selection, model profile composition, dash-form command discovery, and upstream colon-namespace compatibility boundaries — are documented in [docs/hermes-compatibility.md](docs/hermes-compatibility.md).

Compatibility gate: `npm run test:hermes` validates Hermes install modes + SDK query behavior + runtime-model parity + slash command inventory. This gate is the single authoritative Hermes-specific regression signal.

### Hermes runtime model binding receipts

`gsd-hermes@1.6.0` preserves per-agent model binding receipts and imports upstream `upstream/main@9472f343` fixes/features. The v1.4.30 model-binding release made per-agent model binding explicit in plan-phase and execute-phase init payloads through `model_binding_receipts`. These receipts show the resolver decision, configured model, resolved runtime token, binding source, Hermes runtime binding channel, and proof boundary for each spawned GSD agent.

Hermes model override semantics are strict: if `.planning/config.json` configures a per-agent model, GSD must either pass that model to the Hermes child construction path or fail before spawn with an actionable diagnostic. Silent fallback to the parent/default model is not acceptable.

Current proof boundary is conservative:

- GSD resolver and workflow receipts prove the configured intent and handoff metadata.
- Hermes Agent child-construction tests prove `delegate_task(model=...)` and batch `tasks[].model` reach `AIAgent(model=...)`.
- Safe provider diagnostics expose sanitized model/provider metadata only.
- Live provider wire-level `model=...` enforcement is not claimed unless captured through future sanitized provider instrumentation.

## Docs

- [docs/hermes-install.md](docs/hermes-install.md) — Hermes install modes (global, external-dir, macOS canonicalization)
- [docs/hermes-compatibility.md](docs/hermes-compatibility.md) — Compatibility surface contract, runtime-model composition, slash command inventory
- [docs/fork-ownership.md](docs/fork-ownership.md) — Path ownership matrix + merge-conflict routing rules
- [docs/upstream-sync.md](docs/upstream-sync.md) — Upstream sync workflow + sync-log precedent
- [docs/sync-logs/2026-04-sync-0a049149.md](docs/sync-logs/2026-04-sync-0a049149.md) — Per-hunk classification for the v1.3 upstream sync
- [docs/releases/v1.4.0-upstream-sync-cd057255.md](docs/releases/v1.4.0-upstream-sync-cd057255.md) — Release notes for the v1.4 upstream sync package
- [docs/releases/v1.4.30-runtime-model-binding-receipts.md](docs/releases/v1.4.30-runtime-model-binding-receipts.md) — Release notes for Hermes runtime model binding receipts and fail-fast validation
- [docs/releases/v1.5.0-upstream-sync-f3685d91.md](docs/releases/v1.5.0-upstream-sync-f3685d91.md) — Release notes for the upstream `get-shit-done-cc@1.38.5` sync
- [docs/releases/v1.6.0-upstream-sync-9472f343.md](docs/releases/v1.6.0-upstream-sync-9472f343.md) — Release notes for the upstream `9472f343` sync

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Based on Upstream GSD

Based on upstream `get-shit-done@9472f343` — see [the upstream project](https://github.com/gsd-build/get-shit-done) for the source GSD system this fork extends.

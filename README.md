<div align="center">

# GSD Hermes

**Run the full Get Shit Done workflow inside Hermes, with model routing you can actually trust.**

`gsd-hermes` is the Hermes-first distribution of [Get Shit Done](https://github.com/gsd-build/get-shit-done). It gives you the familiar `/gsd-*` planning, execution, review, and shipping loop, then adds the piece Hermes users keep needing in real projects: explicit per-agent provider routing with no quiet fallback to the wrong CLI.

[![npm version](https://img.shields.io/npm/v/gsd-hermes?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/gsd-hermes)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

```bash
npx gsd-hermes@latest --hermes --global
```

</div>

---

## Why use gsd-hermes?

GSD is great at turning messy software work into concrete phases, plans, execution passes, reviews, and release steps. Hermes is great at running a tool-rich local agent environment. `gsd-hermes` brings those two together without pretending they are the same system.

Use it when you want:

- 🧭 the upstream GSD command model (`/gsd-new-project`, `/gsd-plan-phase`, `/gsd-execute-phase`, `/gsd-ship`, ...);
- ⚡ a Hermes-native install path that works globally or links cleanly into one repo;
- 📁 inspectable project-local skills under `./.gsd-hermes` when you choose local mode;
- 🛡 `model_overrides` that mean what they say for planner/executor/verifier agents;
- 🔀 OpenAI/GPT agents routed through Codex CLI, Claude agents routed through Claude Code CLI, or `hermes/*` routed through Hermes chat/tooling;
- 🚦 fail-fast diagnostics instead of a configured GPT executor quietly running as `claude -p`.

Upstream GSD now includes basic Hermes support. This package stays close to upstream, but keeps the Hermes-first packaging, compatibility gates, and strict provider-routed execution layer that make mixed-provider workflows safer to operate.

---

## Quick start

### Install into Hermes globally

```bash
npx gsd-hermes@latest --hermes --global
```

Use this when you want the `/gsd-*` commands available everywhere you run Hermes. The installer writes the GSD skills into your Hermes home directory (`~/.hermes` by default, or `HERMES_HOME` / an explicit config dir when provided).

### Link it to one project

```bash
npx gsd-hermes@latest --hermes --local
```

Use this when a repo should carry its own inspectable GSD skill tree. For Hermes, local install means **project-linked mode**:

```text
./.gsd-hermes/skills/...
~/.hermes/config.yaml  # updated with skills.external_dirs
```

Hermes does not have a true per-project native skills root, so `gsd-hermes` links the project into Hermes via `skills.external_dirs`. You get a repo-visible skill tree without hiding how Hermes actually loads skills.

### Verify

In Hermes Agent, run:

```text
/gsd-help
```

Then start a project:

```text
/gsd-new-project
/gsd-plan-phase 1
/gsd-execute-phase 1
```

---

## Strict provider-routed execution

The point of this package is simple: if you say the executor should use GPT, it should not quietly become a Claude subprocess just because delegation fell back to an older path.

`model_overrides` is the source of per-agent model intent. The simple Hermes-native path is now just a model prefix: use `hermes/<model>` and GSD routes that agent through Hermes chat/tool execution automatically — no `workflow.agent_execution_*` setup needed.

```json
{
  "runtime": "hermes",
  "resolve_model_ids": "omit",
  "model_overrides": {
    "gsd-executor": "hermes/gpt-5.5",
    "gsd-verifier": "hermes/claude-opus-4-7"
  }
}
```

| Configured model | Default execution driver | Command shape |
| --- | --- | --- |
| `hermes/gpt-5.5` | Hermes chat + terminal/file toolsets | `hermes chat --toolsets terminal,file --model gpt-5.5` |
| `hermes/claude-opus-4-7` | Hermes chat + terminal/file toolsets | `hermes chat --toolsets terminal,file --model claude-opus-4-7` |
| `openai/*`, `gpt-*` | Codex CLI | `codex exec --model {model}` |
| `anthropic/*`, `claude-*` | Claude Code CLI | `claude -p --model {model}` |
| unsupported / unavailable | none | fail fast with diagnostics |

Guarantees:

- `hermes/gpt-5.5` uses Hermes-native execution and must not silently run through `claude -p` or `codex exec`; Hermes provider selection comes from the currently configured Hermes provider.
- `openai/gpt-5.5` still routes directly to Codex CLI.
- `anthropic/claude-opus-4-7` still routes directly to Claude Code CLI.
- unsupported direct provider-CLI model families fail before spawn with actionable diagnostics; `hermes/*` routes are only blocked when Hermes command rendering/preflight cannot produce a valid Hermes invocation.
- init payloads expose both `model_binding_receipts` and `agent_execution_bindings` so the effective runtime/provider/model/driver is visible.

Boundary: this proves GSD routing and CLI argument rendering. `hermes/*` is an execution namespace for Hermes chat/tooling; it does not claim Hermes is a wire-level model provider, and GSD intentionally does not pass `--provider` for Hermes-native routes.

---

## Configuration example

`.planning/config.json`:

```json
{
  "runtime": "hermes",
  "model_profile": "quality",
  "resolve_model_ids": "omit",
  "workflow": {
    "cross_ai_execution": false
  },
  "model_overrides": {
    "gsd-planner": "hermes/claude-opus-4-7",
    "gsd-executor": "hermes/gpt-5.5",
    "gsd-verifier": "hermes/gpt-5.5",
    "gsd-code-reviewer": "hermes/claude-opus-4-7"
  }
}
```

Want the provider-specific CLIs instead? Use `openai/gpt-5.5` for Codex CLI or `anthropic/claude-opus-4-7` for Claude Code CLI. `cross_ai_execution` remains a legacy whole-plan fallback and should not override valid per-agent bindings.

---

## Commands

Most commands match upstream GSD. Common entry points:

| Command | Purpose |
| --- | --- |
| `/gsd-new-project` | Initialize project context, requirements, roadmap, and config. |
| `/gsd-discuss-phase` | Clarify a phase before planning. |
| `/gsd-plan-phase` | Produce a detailed, validated implementation plan. |
| `/gsd-execute-phase` | Execute phase plans with agent orchestration and provider routing. |
| `/gsd-verify-work` | Conversational UAT / verification pass. |
| `/gsd-ship` | Prepare PR/release workflow after verification. |
| `/gsd-config` | Configure workflow toggles, model profile, provider routing, integrations. |

See [docs/COMMANDS.md](docs/COMMANDS.md) for the full command reference.

### Workstreams

| Command | What it does |
|---------|--------------|
| `/gsd-workstreams list` | Show all workstreams and their status |
| `/gsd-workstreams create <name>` | Create a namespaced workstream for parallel milestone work |
| `/gsd-workstreams switch <name>` | Switch active workstream |
| `/gsd-workstreams complete <name>` | Complete and merge a workstream |

### Multi-Project Workspaces

| Command | What it does |
|---------|--------------|
| `/gsd-workspace --new` | Create isolated workspace with repo copies (worktrees or clones) |
| `/gsd-list-workspaces` | Show all GSD workspaces and their status |
| `/gsd-remove-workspace` | Remove workspace and clean up worktrees |

### Spiking & Sketching

| Command | What it does |
|---------|--------------|
| `/gsd-spike [idea] [--quick]` | Throwaway experiments to validate feasibility before planning — no project init required |
| `/gsd-sketch [idea] [--quick]` | Throwaway HTML mockups with multi-variant exploration — no project init required |

### UI Design

| Command | What it does |
|---------|--------------|
| `/gsd-ui-phase [N]` | Generate UI design contract (UI-SPEC.md) for frontend phases |
| `/gsd-ui-review [N]` | Retroactive 6-pillar visual audit of implemented frontend code |

### Navigation

| Command | What it does |
|---------|--------------|
| `/gsd-progress` | Where am I? What's next? |
| `/gsd-help` | Show all commands and usage guide |
| `/gsd-update` | Update GSD with changelog preview |
| `/gsd-manager` | Interactive command center for managing multiple phases |

### Brownfield

| Command | What it does |
|---------|--------------|
| `/gsd-map-codebase [area]` | Analyze existing codebase before new-project |
| `/gsd-ingest-docs [dir]` | Scan a repo of mixed ADRs, PRDs, SPECs, and DOCs and bootstrap or merge the full `.planning/` setup in one pass |

### Phase Management

| Command | What it does |
|---------|--------------|
| `/gsd-add-phase` | Append phase to roadmap |
| `/gsd-insert-phase [N]` | Insert urgent work between phases |
| `/gsd-remove-phase [N]` | Remove future phase and renumber |

### Code Quality

| Command | What it does |
|---------|--------------|
| `/gsd-review` | Cross-AI peer review of current phase or branch |
| `/gsd-secure-phase [N]` | Security enforcement with threat-model-anchored verification |
| `/gsd-pr-branch` | Create clean PR branch filtering `.planning/` commits |
| `/gsd-audit-uat` | Audit verification debt — find phases missing UAT |



---

## Documentation

- [docs/COMMANDS.md](docs/COMMANDS.md) — command reference.
- [docs/CONFIGURATION.md](docs/CONFIGURATION.md) — config keys, model overrides, workflow toggles.
- [docs/hermes-install.md](docs/hermes-install.md) — Hermes install modes and project-linked semantics.
- [docs/hermes-compatibility.md](docs/hermes-compatibility.md) — Hermes compatibility contract and regression gate.
- [docs/releases/v1.8.0-provider-routed-agent-execution.md](docs/releases/v1.8.0-provider-routed-agent-execution.md) — provider-routing release notes.
- [docs/releases/v1.9.0-hermes-first-upstream-sync.md](docs/releases/v1.9.0-hermes-first-upstream-sync.md) — v1.9 sync/repositioning notes.
- [docs/releases/v1.9.1-upstream-f2decefe-sync.md](docs/releases/v1.9.1-upstream-f2decefe-sync.md) — v1.9.1 upstream maintenance sync notes.
- [docs/releases/v1.10.0-hermes-native-provider-routing.md](docs/releases/v1.10.0-hermes-native-provider-routing.md) — Hermes-native execution driver release notes.
- [docs/releases/v1.11.0-hermes-model-prefix-routing.md](docs/releases/v1.11.0-hermes-model-prefix-routing.md) — simplified `hermes/<model>` routing release notes.
- [docs/releases/v1.11.1-canonical-hermes-gpt-provider.md](docs/releases/v1.11.1-canonical-hermes-gpt-provider.md) — canonical `hermes/gpt-5.5` examples and Hermes configured-provider delegation notes.
- [docs/releases/v1.12.0-upstream-42ed7cee-sync.md](docs/releases/v1.12.0-upstream-42ed7cee-sync.md) — routine upstream sync to `upstream/main@42ed7cee`.
- [docs/releases/v1.13.0-upstream-3579a48d-sync.md](docs/releases/v1.13.0-upstream-3579a48d-sync.md) — routine upstream sync to `upstream/main@3579a48d`.
- [CHANGELOG.md](CHANGELOG.md) — downstream release history.

---

## Development and validation

Hermes-specific gate:

```bash
npm run test:hermes
```

Focused provider-routing regressions:

```bash
node --test \
  tests/hermes-install.test.cjs \
  tests/hermes-lifecycle.test.cjs \
  tests/hermes-provider-routing-regression.test.cjs \
  tests/provider-cli-dispatch.test.cjs \
  tests/agent-execution-router.test.cjs \
  tests/multi-runtime-select.test.cjs
```

Full local gates before release:

```bash
npm run test:hermes
npm test
npm run lint:tests
npm pack --dry-run --json
```

---

## Upstream base

`gsd-hermes@1.13.0` syncs to `gsd-build/get-shit-done@3579a48d` while preserving the Hermes-first package identity, simplified `hermes/<model>` routing, and strict provider/model execution boundaries.

Public package identity remains:

```text
gsd-hermes
npx gsd-hermes
```

The upstream package remains `get-shit-done-cc`; this repo intentionally ships a separate downstream package line for Hermes-first users.

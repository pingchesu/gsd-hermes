<div align="center">

# GSD Hermes

**Hermes-first Get Shit Done distribution with strict provider-routed agent execution.**

`gsd-hermes` packages the upstream [Get Shit Done](https://github.com/gsd-build/get-shit-done) workflow for Hermes Agent users who want the normal `/gsd-*` planning/execution loop plus explicit, auditable model/provider routing.

[![npm version](https://img.shields.io/npm/v/gsd-hermes?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/gsd-hermes)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

```bash
npx gsd-hermes@latest --hermes --global
```

</div>

---

## What this distribution is

`gsd-hermes` is not a rewrite of GSD. It is a downstream distribution that stays close to upstream GSD while making Hermes the primary install and runtime target.

Use it when you want:

- the upstream GSD command/workflow model (`/gsd-new-project`, `/gsd-plan-phase`, `/gsd-execute-phase`, `/gsd-ship`, ...);
- Hermes Agent install semantics out of the box;
- project-linked local Hermes installs via `./.gsd-hermes` + `skills.external_dirs`;
- strict per-agent model intent through `model_overrides`;
- deterministic provider-family dispatch for executor/verifier-style subagents;
- fail-fast behavior when a configured model cannot be routed safely.

Upstream GSD now has basic Hermes Agent support. The value of `gsd-hermes` is the Hermes-first packaging, downstream compatibility gates, and strict provider-routed execution layer that prevents a configured GPT/OpenAI agent from silently falling back to `claude -p`.

---

## Quick start

### Global Hermes install

```bash
npx gsd-hermes@latest --hermes --global
```

Installs GSD skills under the Hermes home directory (`~/.hermes` by default, or `HERMES_HOME` / an explicit config dir when provided).

### Project-linked Hermes install

```bash
npx gsd-hermes@latest --hermes --local
```

For Hermes, local install means **project-linked mode**:

```text
./.gsd-hermes/skills/...
~/.hermes/config.yaml  # updated with skills.external_dirs
```

This avoids claiming Hermes has a native per-project local skills root while still giving each repo an inspectable, versioned GSD skill tree.

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

`model_overrides` is the source of per-agent model intent. When `workflow.agent_execution_router` is set to `"provider-cli"`, GSD resolves each configured model into an execution driver before spawning work.

```json
{
  "runtime": "hermes",
  "resolve_model_ids": "omit",
  "workflow": {
    "agent_execution_router": "provider-cli"
  },
  "model_overrides": {
    "gsd-executor": "openai/gpt-5.5",
    "gsd-verifier": "anthropic/claude-opus-4-7"
  }
}
```

| Configured model family | Execution driver | Command shape |
| --- | --- | --- |
| `openai/*`, `gpt-*` | Codex CLI | `codex exec --model {model}` |
| `anthropic/*`, `claude-*` | Claude Code CLI | `claude -p --model {model}` |
| unsupported / unavailable | none | fail fast with diagnostics |

Guarantees:

- `openai/gpt-5.5` must not silently run through `claude -p`.
- `anthropic/claude-opus-4-7` must not silently run through `codex exec`.
- unsupported model families fail before spawn with actionable diagnostics.
- init payloads expose both `model_binding_receipts` and `agent_execution_bindings` so the effective runtime/provider/model/driver is visible.

Boundary: this proves GSD routing and CLI argument rendering. It does not claim wire-level provider API proof inside Codex CLI or Claude Code CLI.

---

## Configuration example

`.planning/config.json`:

```json
{
  "runtime": "hermes",
  "model_profile": "quality",
  "resolve_model_ids": "omit",
  "workflow": {
    "agent_execution_router": "provider-cli",
    "cross_ai_execution": false
  },
  "model_overrides": {
    "gsd-planner": "anthropic/claude-opus-4-7",
    "gsd-executor": "openai/gpt-5.5",
    "gsd-verifier": "openai/gpt-5.5",
    "gsd-code-reviewer": "anthropic/claude-opus-4-7"
  }
}
```

`cross_ai_execution` remains a legacy whole-plan fallback. Valid provider-cli bindings take priority and should not be overridden by `cross_ai_execution`.

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

---

## Documentation

- [docs/COMMANDS.md](docs/COMMANDS.md) — command reference.
- [docs/CONFIGURATION.md](docs/CONFIGURATION.md) — config keys, model overrides, workflow toggles.
- [docs/hermes-install.md](docs/hermes-install.md) — Hermes install modes and project-linked semantics.
- [docs/hermes-compatibility.md](docs/hermes-compatibility.md) — Hermes compatibility contract and regression gate.
- [docs/releases/v1.8.0-provider-routed-agent-execution.md](docs/releases/v1.8.0-provider-routed-agent-execution.md) — provider-routing release notes.
- [docs/releases/v1.9.0-hermes-first-upstream-sync.md](docs/releases/v1.9.0-hermes-first-upstream-sync.md) — v1.9 sync/repositioning notes.
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

`gsd-hermes@1.9.0` syncs to upstream `gsd-build/get-shit-done@de25400b` while preserving downstream package identity and Hermes/provider-routing invariants.

Public package identity remains:

```text
gsd-hermes
npx gsd-hermes
```

The upstream package remains `get-shit-done-cc`; this repo intentionally ships a separate downstream package line for Hermes-first users.

# gsd-hermes Documentation

This directory contains both downstream fork-governance docs for `gsd-hermes`
and the imported upstream Get Shit Done documentation. The governance docs are
the first stop for fork maintainers deciding where Hermes-specific changes
belong; the upstream docs remain the reference for baseline GSD behavior.

## Fork Governance Docs

| Document | Purpose |
| --- | --- |
| [Fork Ownership](fork-ownership.md) | Ownership map for upstream base, Hermes adapter seam, and downstream governance surfaces. |
| [Upstream Sync Workflow](upstream-sync.md) | Merge-based upstream sync runbook with the post-sync validation checklist for the long-lived fork. |
| [Hermes Compatibility and Guardrails](hermes-compatibility.md) | Compatibility guardrails, validation matrix and maintenance contract for truthful Hermes support boundaries. |
| [Hermes Install](hermes-install.md) | Hermes global and project-linked install modes plus command discovery smoke checks. |

## Upstream GSD Docs

Language versions: [English](README.md) | [Portuguese (pt-BR)](pt-BR/README.md) | [Japanese](ja-JP/README.md) | [Simplified Chinese](zh-CN/README.md)

| Document | Audience | Description |
| --- | --- | --- |
| [Architecture](ARCHITECTURE.md) | Contributors, advanced users | System architecture, agent model, data flow, and internal design. |
| [Feature Reference](FEATURES.md) | All users | Complete feature and function documentation with requirements. |
| [Command Reference](COMMANDS.md) | All users | Every command with syntax, flags, options, and examples. |
| [Configuration Reference](CONFIGURATION.md) | All users | Full config schema, workflow toggles, model profiles, and git branching. |
| [CLI Tools Reference](CLI-TOOLS.md) | Contributors, agent authors | `gsd-tools.cjs` programmatic API for workflows and agents. |
| [Agent Reference](AGENTS.md) | Contributors, advanced users | Specialized agents, roles, tools, and spawn patterns. |
| [User Guide](USER-GUIDE.md) | All users | Workflow walkthroughs, troubleshooting, and recovery. |
| [Context Monitor](context-monitor.md) | All users | Context window monitoring hook architecture. |
| [Discuss Mode](workflow-discuss-mode.md) | All users | Assumptions vs interview mode for discuss-phase. |

## Quick Links

- Getting started: [README](../README.md) -> install -> `/gsd-new-project`
- Full workflow walkthrough: [User Guide](USER-GUIDE.md)
- All commands at a glance: [Command Reference](COMMANDS.md)
- Configuring GSD: [Configuration Reference](CONFIGURATION.md)
- How the system works internally: [Architecture](ARCHITECTURE.md)
- Contributing or extending: [CLI Tools Reference](CLI-TOOLS.md) and [Agent Reference](AGENTS.md)

## Phase 1 Boundary

Phase 1 published the fork-governance docs before upstream import. Runtime
implementation begins in later phases and must stay bounded by the ownership
and compatibility rules linked above.

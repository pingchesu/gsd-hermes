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

## Runtime-Model Composition

Tracks how the Hermes v1.2 runtime-model adapter composes with upstream #2517 runtime-aware tier resolution (`resolveTierEntry` in `get-shit-done/bin/lib/core.cjs`) after the v1.3 sync. Composition contract per Phase 7 D-03: the Hermes adapter wraps upstream's resolver rather than replacing it, so runtime-aware token projection (Codex, OpenCode, etc.) stays available while Hermes-specific defaults remain Claude-safe.

| Binding Path | Upstream #2517 Behavior | Hermes Adapter Post-Process | Example |
| --- | --- | --- | --- |
| `model_overrides[agent]` explicit | Skipped — overrides short-circuit before tier lookup. | Passes through as `kind: 'explicit'`; fully-qualified ID preserved. | `model_overrides: { 'gsd-executor': 'openai/gpt-5.4' }` → legacy/init token `'openai/gpt-5.4'`. |
| `profile: 'inherit'` | Returns literal `'inherit'` (upstream #2516 passthrough). | Legacy token `'inherit'`; init token `''` (empty per v1.2 semantics). | `runtime: 'codex', model_profile: 'inherit'` → legacy `'inherit'`, init `''`. |
| `resolve_model_ids: 'omit'` | Not consulted — omit short-circuits in the Hermes adapter. | Returns empty token for both projections (`kind: 'runtime-default'`). | `resolve_model_ids: 'omit'` → legacy `''`, init `''`. |
| Runtime tier resolution | `RUNTIME_PROFILE_MAP[runtime][tier]` field-merge with `model_profile_overrides`. | If runtime is Claude-safe: alias (e.g. `'opus'`); if runtime IS in `KNOWN_RUNTIMES` (codex, opencode, etc.): native ID (e.g. `'gpt-5.4'`). | `runtime: 'codex', model_profile: 'quality'` → `'gpt-5.4'`. |
| `workflow.cross_ai_execution: true` | Not in upstream path. | Preserved as v1.2 HERM-04 fallback configuration; SDK exposes `crossAiExecutionConfigured`, CJS omits. | `cross_ai_execution: true, profile: 'balanced'` → legacy `'sonnet'`, init `'sonnet'`. |

**Hermes is absent from `KNOWN_RUNTIMES`.** Setting `runtime: "hermes"` emits a one-shot stderr warning (`gsd: warning — config key "runtime" has unknown value "hermes"`) and falls through to the Claude-safe profile alias (e.g. `'opus'` for `quality`). This is intentional: Hermes runs Claude-native semantics at the adapter level, so tier-based ID resolution via `resolveTierEntry` returns null and the v1.2 `resolveAgentBinding` path takes over. Non-Hermes runtimes selected by the same installer (Codex, OpenCode, etc.) DO consume `resolveTierEntry` and receive runtime-native IDs.

**SDK/CJS contract asymmetry.** `sdk/src/query/runtime-model-contract.ts::resolveAgentBinding` returns the superset shape with `runtime`, `runtimeCapability`, `crossAiExecutionConfigured`, and `suggestedFix` fields. The CJS adapter (`get-shit-done/bin/lib/model-profiles.cjs::resolveAgentBinding`) returns the v1.1-minimum intersection: `{kind, agent, knownAgent, bindingKind, source, configuredModel, resolvedModel, modelToken, profile, resolveModelIds, rejectionReason?}`. `tests/runtime-model-parity.test.cjs` asserts only the intersection so divergence is controlled and non-breaking.

Validation evidence: `node --test tests/runtime-model-parity.test.cjs` (enrolled in `scripts/validate-hermes-compat.cjs::testFiles[]` during Phase 7 Plan 01; 13 subtests green covering all five binding paths above).

### Runtime Binding Receipt Layers

Phase 10 adds `model_binding_receipts` to the plan-phase and execute-phase init payloads. These receipts are intentionally observational: they make the model-binding handoff visible without claiming that Hermes has already enforced the requested child model at provider request time.

| Layer | Receipt field | Meaning | Proof boundary |
| --- | --- | --- | --- |
| Resolver | `resolved_by_gsd` | GSD recognized the agent and resolved the configured model/profile/omit path into a binding token or an explicit rejection. | Proves GSD resolver behavior only. |
| Workflow handoff | `passed_to_runtime` | GSD has a non-empty explicit token ready for a workflow `Task(..., model=...)` style handoff. | Does not prove Hermes accepted or used that token. |
| Runtime/provider proof | `runtime_enforced` | Whether runtime or provider request evidence proves the spawned child actually used the intended model. | Phase 10 reports `unknown` for Hermes unless later enforcement/proof code records concrete evidence. |

`runtime_enforced=unknown is not runtime proof`. It means the GSD resolver and workflow can show intent, but Hermes child-agent construction and provider request metadata have not yet been observed. Preferred proof in later phases is provider request or wire-level `model=...` metadata, followed by runtime child-agent construction evidence. A subagent self-report is not proof and must not be treated as evidence of enforcement.

Phase 11 selects the canonical direct Hermes binding seam as `delegate_task(model=...)` for single child spawns and `tasks[].model` for batch spawns. `delegation.model` remains a global default/fallback, not a per-agent GSD override channel. ACP `--model` remains transport-specific and is only relevant when ACP subprocess routing is selected. Phase 11 proof stops at child `AIAgent(model=...)` construction; provider request or wire-level `model=...` proof remains a later provider-instrumentation boundary.

Do not log secrets while collecting receipt evidence. Provider requests or diagnostic captures must redact API keys, tokens, cookies, passwords, and connection strings.

## Known Gaps

- Project-linked mode depends on `~/.hermes/config.yaml` `skills.external_dirs`, so duplicate global and project-linked command names can depend on Hermes discovery order.
- `ws@^8.20.0` is a direct root `dependencies` entry in `package.json`, not a transitive dep of `@anthropic-ai/claude-agent-sdk` (D-16 correction per Phase 7 RESEARCH §Pitfall 6). Hermes runtime does not itself require websocket infrastructure — `ws` is currently retained for SDK transport use. Verified via `npm ls ws` on 2026-04-24.

## Adapter Guardrails

- Prefer adapter or shim changes over workflow rewrites.
- Do not claim a native local Hermes install mode.
- Keep Hermes patches concentrated in installer, runtime conversion, compatibility, documentation, and test layers.
- If a change touches get-shit-done/workflows/ broadly, stop and justify it against D-02 before implementation.
- Use merge history from upstream/main to review Hermes drift before broadening a patch.

## Slash Command Inventory

Tracks Hermes-owned slash commands per Phase 7 D-11 dual-track coexistence: Hermes runtime SKILL.md files keep `/gsd-<cmd>` dash form (Hermes discovery is dash-natural); upstream-owned commands and docs use `/gsd:<cmd>` colon form after upstream #2543 migration. The table below maps each Hermes dash-form slash reference in user-facing Hermes docs to the skill path produced by `bin/install.js::copyCommandsAsHermesSkills`.

| Slash Command (dash-form) | Source Doc | Produced Skill Path |
| --- | --- | --- |
| `/gsd-help` | `docs/hermes-install.md` | `~/.hermes/skills/gsd-help/SKILL.md` (global) or `<project>/.gsd-hermes/skills/gsd-help/SKILL.md` (project-linked) |
| `/gsd-progress` | `docs/hermes-install.md` | `~/.hermes/skills/gsd-progress/SKILL.md` (global) or `<project>/.gsd-hermes/skills/gsd-progress/SKILL.md` |
| `/gsd-new-project` | `docs/hermes-install.md` | `~/.hermes/skills/gsd-new-project/SKILL.md` or `<project>/.gsd-hermes/skills/gsd-new-project/SKILL.md` |
| `/gsd-discuss-phase` | `docs/hermes-install.md` | `~/.hermes/skills/gsd-discuss-phase/SKILL.md` or `<project>/.gsd-hermes/skills/gsd-discuss-phase/SKILL.md` |
| `/gsd-plan-phase` | `docs/hermes-install.md` | `~/.hermes/skills/gsd-plan-phase/SKILL.md` or `<project>/.gsd-hermes/skills/gsd-plan-phase/SKILL.md` |
| `/gsd-execute-phase` | `docs/hermes-install.md` | `~/.hermes/skills/gsd-execute-phase/SKILL.md` or `<project>/.gsd-hermes/skills/gsd-execute-phase/SKILL.md` |

**Dual-track rationale (D-11).** Upstream migrated to `/gsd:<cmd>` via #2543 for runtimes whose command-resolver parses colons as namespace separators. Hermes uses flat directory-based skill discovery where filenames cannot contain colons on Windows filesystems, so Hermes SKILL.md skills are generated with dash-form names. The installer at `bin/install.js::copyCommandsAsHermesSkills` generates per-command directories named `gsd-<cmd>/SKILL.md` by iterating source command files in `commands/gsd/*.md`; Hermes skills receive appended runtime-compatibility notes via `appendHermesRuntimeNote`. Other runtimes receive upstream colon-form commands unchanged per D-10.

**Audit completeness.** The Hermes-owned paths that reference slash syntax are: `bin/install.js` skill-generation logic (runtime prefix `gsd-` from `copyCommandsAsClaudeSkills` delegate), `docs/hermes-*.md` user-facing guides, `scripts/validate-hermes-compat.cjs` + test files under `tests/hermes-*.test.cjs`. Upstream-owned paths (`commands/gsd/*.md`, `agents/gsd-*.md`, `hooks/`, `get-shit-done/`) are handled by upstream #2543 and kept as-is after Phase 6 merge per D-10.

Validation evidence: `tests/hermes-docs.test.cjs` asserts that every slash command in this inventory corresponds to an expected source command file the installer converts into a Hermes skill (covered in the SLASH-02 describe block added in Phase 7 Plan 03).

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

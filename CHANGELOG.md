# Changelog

All notable changes to GSD Hermes will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

GSD Hermes uses an independent downstream package version line. Each release should
record both the `gsd-hermes` package version and the upstream GSD base version it
syncs from.

## [Unreleased]

## 1.7.0 — 2026-04-29

GSD Hermes package version: `1.7.0`
Upstream GSD base: `upstream/main@eeaf9c55` / `get-shit-done-cc@1.39.0-rc.5`
Previous upstream base: `upstream/main@9472f343` / `get-shit-done-cc@1.38.5`

### Synced
- **Upstream sync to `upstream/main@eeaf9c55`** — merges the upstream changes from `9472f343..eeaf9c55` while preserving downstream `gsd-hermes` package identity, Hermes install semantics, dash-form command discovery, and strict runtime/model binding receipt contracts.

### Added
- Imported upstream `gsd-tools` bin alias and SDK workstream environment support.
- Imported upstream execute-phase per-plan worktree gate documentation and latest workflow/agent prompt hardening.
- Imported upstream `v1.39.0-rc.4` and `v1.39.0-rc.5` release notes as upstream-base reference docs.

### Fixed
- Imported upstream fixes for fenced-code milestone parsing, archived phase fallback, audit-UAT frontmatter parsing, config-get `--default`, context window config validation, ingest-docs init dispatch, skill hyphen naming, OpenCode model profile overrides, update cache clearing, and roadmap phase argument parsing.
- Preserved downstream `gsd-hermes` npm identity and repository metadata instead of adopting upstream `get-shit-done-cc` package identity.
- Preserved Hermes runtime/model binding SDK contract while accepting upstream config-get missing-key exit semantics.

### Verification
- Local validation passed: `npm run test:hermes`, `npm test` (`5921/5921`), `npm run lint:tests`, and `npm pack --dry-run --json`.

## 1.6.0 — 2026-04-27

GSD Hermes package version: `1.6.0`
Upstream GSD base: `upstream/main@9472f343` / `get-shit-done-cc@1.38.5`
Previous upstream base: `upstream/main@f3685d91`

### Synced
- **Upstream sync to `upstream/main@9472f343`** — merges the upstream changes from `f3685d91..9472f343` while preserving downstream `gsd-hermes` package identity, Hermes install semantics, dash-form command discovery, and strict runtime/model binding receipt contracts.

### Added
- Imported upstream `--minimal` / `--core-only` install profile support, which installs only the main-loop core skills and records install manifest mode as `"minimal"` or `"full"`.
- Imported upstream `/gsd-edit-phase` command support.
- Imported upstream post-merge build/test gate workflow coverage.

### Changed
- Imported upstream runtime profile map expansion for Gemini, Qwen, OpenCode, and Copilot plus settings-advanced UI updates.
- Imported upstream discuss-phase lazy import/performance work and explicit wait-for-subagent orchestration instructions.
- Imported upstream USER-GUIDE walkthrough documentation updates without replacing the concise downstream README.

### Fixed
- Imported upstream workstream query/config threading fixes, including root config inheritance and model resolver workstream handling.
- Imported upstream Codex install format fixes for hooks/agents.
- Imported upstream roadmap/phase lifecycle parsing hardening, graphify CLI invocation fix, review model config coverage, LM Studio model identity validation, nested config preservation, model alias update, and parser fixes for quoted/colon-containing values.

### Verification
- Local validation passed: `npm run test:hermes`, `npm test`, `npm run lint:tests`, and `npm pack --dry-run --json`.
- PR CI pending after branch push.

## [1.5.0] — 2026-04-26

GSD Hermes package version: `1.5.0`
Upstream GSD base: `upstream/main@f3685d91` / `get-shit-done-cc@1.38.5`
Tracker: https://github.com/pingchesu/gsd-hermes/issues/35

### Changed
- **Upstream sync to `get-shit-done-cc@1.38.5`** — merges 24 upstream commits from `cd057255..f3685d91` while preserving downstream `gsd-hermes` package identity, Hermes install semantics, and strict runtime/model binding receipt contracts.
- Imported upstream fixes for SDK executor `phaseDir` summary placement, full installed prompt loading, executor plan-content loading, `/gsd-<cmd>` routing suggestions, parent `.planning/` root resolution for sub-repos, shell hook version substitution/detection, lint protection against source-grep tests, markdown anchor discovery, codebase map refresh output, and installer local SDK-check skip.
- Updated release/package metadata for `gsd-hermes@1.5.0` with clean PR and release notes that keep `.planning/` artifacts out of the shipping branch.

### Fixed
- Preserved SDK/CJS config parity for structured `parallelization` objects so project config retains `{ enabled: false }` instead of flattening to boolean `false`.
- Added `inherit` to CJS and SDK valid model-profile selectors so config mutation, SDK schema, and runtime model binding contracts agree.
- Optimized the base64 security scanner to avoid per-line process spawning on large upstream docs/scripts while preserving decoded prompt-injection detection.

### Verification
- `npm ci --ignore-scripts` on Node `v22.19.0`
- `npm run build:sdk`
- `npm run lint:tests`
- `node --test tests/init.test.cjs tests/runtime-model-parity.test.cjs tests/model-profiles.test.cjs tests/bug-2601-inherit-model-profile.test.cjs tests/core.test.cjs tests/security-scan.test.cjs tests/hermes-docs.test.cjs tests/install.test.cjs`
- `cd sdk && npx vitest run src/query/init.test.ts src/query/config-query.test.ts src/golden/golden.integration.test.ts`
- `npm test` (`5652/5652`)
- `scripts/secret-scan.sh --diff origin/main`
- `scripts/base64-scan.sh --diff origin/main`
- `scripts/prompt-injection-scan.sh --diff origin/main`
- `npm pack --dry-run --json` plus tarball install smoke for `gsd-hermes` and `gsd-sdk` bin entries.

## [1.4.30] — 2026-04-26

GSD Hermes package version: `1.4.30`
Upstream GSD base: `upstream/main@cd057255`
Tracker: https://github.com/pingchesu/gsd-hermes/issues/32

### Added
- **Hermes runtime model binding receipts** — plan-phase and execute-phase init payloads now include structured `model_binding_receipts` that show resolver decision, configured model, resolved token, binding source, runtime binding channel, and proof boundary for each participating GSD agent while preserving legacy flat `*_model` fields.
- **Hermes child binding channel evidence** — direct `delegate_task(model=...)` and batch `tasks[].model` are the canonical Hermes per-agent binding seams; tests verify GSD planner/executor overrides reach child `AIAgent(model=...)` construction.
- **Safe provider diagnostics** — sanitized provider metadata helpers can record model/provider/proof-source fields without retaining raw headers, request bodies, messages, credentials, API keys, tokens, passwords, client secrets, or credential-bearing URLs.

### Fixed
- **No silent fallback for explicit Hermes model overrides** — unsupported explicit bindings now fail before spawn with actionable diagnostics instead of allowing a child agent to inherit the parent/default model.
- **Runtime/model proof boundaries documented** — README, command reference, configuration reference, Hermes compatibility docs, PR checklist, and release notes now distinguish resolver proof, workflow handoff, Hermes child-construction proof, provider diagnostics, and live provider wire-level proof.

### Verification
- `npm run build:sdk`
- `cd sdk && npx vitest run src/query/init.test.ts src/query/config-query.test.ts`
- `node --test tests/init.test.cjs tests/runtime-model-parity.test.cjs tests/workflow-size-budget.test.cjs tests/hermes-docs.test.cjs`
- `npm run test:hermes`
- `npm test`
- Hermes Agent targeted pytest/py_compile gates recorded in the Phase 12/13 planning artifacts.

## [1.4.0] — 2026-04-25

GSD Hermes package version: `1.4.0`
Upstream GSD base: `upstream/main@cd057255` (25 commits after the v1.3.0 base `upstream/main@0a049149`)

### Synced
- **Upstream sync to `upstream/main@cd057255`** — brings in the post-v1.3 upstream fixes and enhancements while preserving the independent `gsd-hermes` package identity, Hermes runtime adapter, and downstream release policy.

### Added
- **Release tarball guardrails from upstream** — release and smoke workflows now build SDK dist artifacts and verify `sdk/dist/cli.js` ships in the published tarball so fresh installs do not depend on build-from-source behavior.
- **SDK query/config regression coverage** — imports upstream coverage for config-schema parity, state mutation, roadmap handling, init progress precedence, sub-repo root resolution, and workflow-agent skill consistency.

### Fixed
- **Installer fail-fast when SDK dist is missing** — preserves the upstream no-nested-install guard while keeping Hermes-specific package guidance.
- **Codex/OpenCode runtime model override propagation** — imports upstream fix for passing per-agent model overrides through non-Claude transports.
- **Workstream and roadmap state synchronization** — imports upstream fixes for `--ws` query dispatch, ROADMAP checkbox precedence, state frontmatter writes, and insert-phase roadmap evolution.
- **Hermes skill frontmatter compatibility during upstream colon-form sync** — keeps Hermes command-discovery frontmatter hyphenated while allowing upstream-owned Claude/Qwen colon-form behavior in the imported tests and paths.

## [1.3.0] — 2026-04-24

GSD Hermes package version: `1.3.0`
Upstream GSD base: `upstream/main@0a049149` (97 commits above `v1.38.2` / `7397f580`)

### Added
- **Upstream sync to `upstream/main@0a049149`** — 97 commits merged from upstream into the Hermes fork, preserving independent `gsd-hermes` package identity, Hermes runtime support, and downstream release policy. Per-hunk classification recorded in `docs/sync-logs/2026-04-sync-0a049149.md`.
- **Runtime-aware model profiles (upstream #2517)** — Upstream runtime-aware resolver composed with the Hermes v1.2 `model-profiles.cjs` adapter via the shared parity matrix (extended from 5 → 13 rows in `tests/runtime-model-parity.test.cjs`).
- **`/gsd:` colon-form slash syntax (upstream #2543)** — Coexists with Hermes-owned legacy `/gsd-<cmd>` command paths under a dual-track policy recorded in `docs/hermes-compatibility.md §Slash Command Inventory`.

### Changed
- **Hermes adapter wraps upstream runtime-aware resolver** — `resolveModelInternal` gains an `options.initContext` projection flag that distinguishes init-context callers from general callers while preserving a single source of truth (Phase 7.1 Plan 02).
- **`sdk/dist/cli.js` chmod 0o755 hardened** — `sdk/package.json::prepublishOnly` uses `chmod +x` (upstream alignment; publish-time umask 022 → 0o755); a new `postbuild` hook adds absolute `chmod 755 dist/cli.js` to defend against developer umask 002. `bin/install.js` retains install-time chmod (three-layer execute-bit defense per Phase 7.1 INST-02 / Phase 7.2 Cat D).
- **SDK install decoupled from build-from-source (upstream #2441)** — `bin/install.js::installSdkIfNeeded` replaced with upstream dist-verify + chmod-in-place body (net −97 lines; Phase 7.2 Plan 04). Root `package.json` now declares a `bin.gsd-sdk` entry and ships `sdk/dist` in the tarball so `npm install gsd-hermes` lands `gsd-sdk` on `PATH` without rebuilding from source.

### Fixed
- **PROFILE-03 init-context inherit projection** — `resolveModelInternal` now returns `''` (not the literal `'inherit'`) when `options.initContext === true`, so `tests/bug-2516-inherit-model-execute-phase.test.cjs` subtest 5 goes green (Phase 7.1 Plan 02).
- **INST-02 chmod 0o755 regression** — `sdk/dist/cli.js` is now 0o755 on fresh builds via the absolute `postbuild` hook (Phase 7.1 Plan 01).
- **Parity test silent-rot in sync branch** — `resolveModelBindingInternal` re-exported from `core.cjs`; parity matrix enrolled in `scripts/validate-hermes-compat.cjs::testFiles[]` so future drift is caught by `npm run test:hermes` (Phase 7 Plan 01).
- **16 `npm test` failures across 5 categories** — Cat A: `docs/ARCHITECTURE.md` numeric count drift (6 failures); Cat B: `resolveModelInternal` unknown-agent tests aligned to `''` contract (3 failures + 2 rollups); Cat C: upstream #2441 SDK-decouple test updates (5 failures); Cat D: #2453 chmod test refresh for post-#2441 contract (1 failure); Cat E: `/gsd:` colon-scan allowlist for upstream-owned paths (1 failure). `npm test` now exits 0 at 5505/5505 (Phase 7.2).

### Docs
- **`docs/hermes-compatibility.md §Runtime-Model Composition` + `§Slash Command Inventory`** — New sections document the 4 binding paths, HERM-04 fallback, SDK/CJS asymmetry contract, and the 6-row Hermes-owned slash command inventory with dual-track rationale (Phase 7 Plan 03).
- **`docs/sync-logs/2026-04-sync-0a049149.md`** — Per-hunk sync log with 56 `bin/install.js` hunk rows, 226 per-file category rows, 6 `package.json` rows, plus Verification Evidence and Operator Notes (Phase 6 Plans 03–04).
- **`docs/upstream-sync.md` cross-reference to `docs/sync-logs/`** — Closes the governance feedback loop for future syncs (Phase 6 Plan 04).
- **`ws@^8.20.0` direct-dep correction** — Recorded as a direct root dependency (not transitive via `@anthropic-ai/claude-agent-sdk` as initially hypothesized; `docs/hermes-compatibility.md §Known Gaps`).

## [1.2.0] — 2026-04-22

GSD Hermes package version: `1.2.0`
Upstream GSD base: `get-shit-done-cc@1.38.2`

### Added
- **Cross-Provider Agent Execution release messaging** — README, CHANGELOG, release draft, and canonical operator docs now present the upcoming `gsd-hermes@1.2.0` release as a downstream capability milestone centered on strict per-agent runtime/model binding, Hermes mixed-provider direct execution, and explicit `cross_ai_execution` fallback semantics.
- **`/gsd-ingest-docs` command** — Scan a repo containing mixed ADRs, PRDs, SPECs, and DOCs and bootstrap or merge the full `.planning/` setup from them in a single pass. Parallel classification (`gsd-doc-classifier`), synthesis with precedence rules and cycle detection (`gsd-doc-synthesizer`), three-bucket conflicts report (`INGEST-CONFLICTS.md`: auto-resolved, competing-variants, unresolved-blockers), and hard-block on LOCKED-vs-LOCKED ADR contradictions in both new and merge modes. Supports directory-convention discovery and `--manifest <file>` YAML override with per-doc precedence. v1 caps at 50 docs per invocation; `--resolve interactive` is reserved. Extracts shared conflict-detection contract into `references/doc-conflict-engine.md` which `/gsd-import` now also consumes (#2387)

### Fixed
- **SDK `checkAgentsInstalled` is now runtime-aware** — `sdk/src/query/init.ts::checkAgentsInstalled` only knew where Claude Code put agents (`~/.claude/agents`). Users running GSD on Codex, OpenCode, Gemini, Kilo, Copilot, Antigravity, Cursor, Windsurf, Augment, Trae, Qwen, CodeBuddy, or Cline got `agents_installed: false` even with a complete install, which hard-blocked any workflow that gates subagent spawning on that flag. `sdk/src/query/helpers.ts` now resolves the right directory via three-tier detection (`GSD_RUNTIME` env → `config.runtime` → `claude` fallback) and mirrors `bin/install.js::getGlobalDir()` for all 14 runtimes. `GSD_AGENTS_DIR` still short-circuits the chain. `init-runner.ts` stays Claude-only by design (#2402)
- **`init` query agents-installed check looks at the correct directory** — `checkAgentsInstalled` in `sdk/src/query/init.ts` defaulted to `~/.claude/get-shit-done/agents/`, but the installer writes GSD agents to `~/.claude/agents/`. Every init query therefore reported `agents_installed: false` on clean installs, which made workflows refuse to spawn `gsd-executor` and other parallel subagents. The default now matches `sdk/src/init-runner.ts` and the installer (#2400)
- **Installer now installs `@gsd-build/sdk` automatically** so `gsd-sdk` lands on PATH. Resolves `command not found: gsd-sdk` errors that affected every `/gsd-*` command after a fresh install or `/gsd-update` to 1.36+. Adds `--no-sdk` to opt out and `--sdk` to force reinstall. Implements the `--sdk` flag that was previously documented in README but never wired up (#2385)

## [1.1.0] - 2026-04-22

GSD Hermes package version: `1.1.0`
Upstream GSD base: `get-shit-done-cc@1.38.2`

### Changed
- **Upstream sync to `get-shit-done-cc@1.38.2`** — Merged the stable upstream `1.38.2` base into the Hermes fork while preserving the independent `gsd-hermes` package identity, Hermes runtime support, and downstream release policy.
- **Release metadata now records the new upstream base** — README and changelog now identify this downstream release as `gsd-hermes@1.1.0` based on upstream `get-shit-done-cc@1.38.2`, instead of mirroring upstream package versions.

### Fixed
- **Hermes compatibility gate expanded after upstream sync** — `npm run test:hermes` now includes deterministic installer, runtime selection, SDK install fallback, and SDK model config coverage so Hermes global/project-linked installs and `resolve_model_ids: "omit"` behavior stay covered.
- **Hermes non-Claude model override docs clarified** — Configuration docs now include Hermes in the non-Claude runtime guidance and use fully-qualified `model_overrides` examples.

## [1.0.1] - 2026-04-20

GSD Hermes package version: `1.0.1`
Upstream GSD base: `get-shit-done-cc@1.37.1`

### Fixed
- **SDK install no longer requires sudo on root-owned npm prefixes** — When `npm install -g .` fails while building the bundled SDK, the installer now retries with a user-writable npm prefix at `~/.local`. This fixes `EACCES: permission denied, mkdir '/usr/lib/node_modules/@gsd-build'` during `npx gsd-hermes --hermes --global` on machines whose npm global prefix points to `/usr`.

## [1.0.0] - 2026-04-19

GSD Hermes package version: `1.0.0`
Upstream GSD base: `get-shit-done-cc@1.37.1`

### Added
- **Initial public GSD Hermes release** — Independent `gsd-hermes` package line for a Hermes-focused downstream fork. Based on upstream `get-shit-done-cc@1.37.1`, with first-class Hermes Agent install support and the upstream GSD workflow preserved.

### Fixed
- **Installer rebuilds stale SDK binaries** — The installer now checks whether an existing `gsd-sdk` on `PATH` supports `gsd-sdk query ...` before skipping SDK installation. This fixes Hermes sessions that found an old global `@gsd-build/sdk@0.1.0` binary and fell back to filesystem-only workflow checks.

## [1.37.1] - 2026-04-17

### Fixed
- UI-phase researcher now loads sketch findings skills, preventing re-asking questions already answered during `/gsd-sketch`

## [1.37.0] - 2026-04-17

### Added
- **`/gsd-spike` and `/gsd-sketch` commands** — First-class GSD commands for rapid feasibility spiking and UI design sketching. Each produces throwaway experiments (spikes) or HTML mockups with multi-variant exploration (sketches), saved to `.planning/spikes/` and `.planning/sketches/` with full GSD integration: banners, checkpoint boxes, `gsd-sdk query` commits, and `--quick` flag to skip intake. Neither requires `/gsd-new-project` — auto-creates `.planning/` subdirs on demand
- **`/gsd-spike-wrap-up` and `/gsd-sketch-wrap-up` commands** — Package spike/sketch findings into project-local skills at `./.claude/skills/` with a planning summary at `.planning/`. Curates each spike/sketch one-at-a-time, groups by feature/design area, and adds auto-load routing to project CLAUDE.md
- **Spike/sketch pipeline integration** — `new-project` detects prior spike/sketch work on init, `discuss-phase` loads findings into prior context, `plan-phase` includes findings in planner `<files_to_read>`, `explore` offers spike/sketch as output routes, `next` surfaces pending spike/sketch work as notices, `pause-work` detects active sketch context for handoff, `do` routes spike/sketch intent to new commands
- **`/gsd-spec-phase` command** — Socratic spec refinement with ambiguity scoring to clarify WHAT a phase delivers before discuss-phase. Produces a SPEC.md with falsifiable requirements locked before implementation decisions begin (#2213)
- **`/gsd-progress --forensic` flag** — Appends a 6-check integrity audit after the standard progress report (#2231)
- **`/gsd-discuss-phase --all` flag** — Skip area selection and discuss all gray areas interactively (#2230)
- **Parallel discuss across independent phases** — Multiple phases without dependencies can be discussed concurrently (#2268)
- **`gsd-read-injection-scanner` hook** — PostToolUse hook that scans for prompt injection attempts in read file contents (#2201)
- **SDK Phase 2 caller migration** — Workflows, agents, and commands now use `gsd-sdk query` instead of raw `gsd-tools.cjs` calls (#2179)
- **Project identity in Next Up blocks** — All Next Up blocks include workspace context for multi-project clarity (#1948)
- **Agent size-budget enforcement** — New `tests/agent-size-budget.test.cjs` enforces tiered line-count limits on every `gsd-*.md` agent (XL=1600, LARGE=1000, DEFAULT=500). Unbounded agent growth is paid in context on every subagent dispatch; the test prevents regressions and requires a deliberate PR rationale to raise a budget (#2361)
- **Shared `references/mandatory-initial-read.md`** — Extracts the `<required_reading>` enforcement block that was duplicated across 5 top agents. Agents now include it via a single `@~/.claude/get-shit-done/references/mandatory-initial-read.md` line, using Claude Code's progressive-disclosure `@file` reference mechanism (#2361)
- **Shared `references/project-skills-discovery.md`** — Extracts the 5-step project skills discovery checklist that was copy-pasted across 5 top agents with slight divergence. Single source of truth with a per-agent "Application" paragraph documenting how planners, executors, researchers, verifiers, and debuggers each apply the rules (#2361)

### Changed
- **`gsd-debugger` philosophy extracted to shared reference** — The 76-line `<philosophy>` block containing evergreen debugging disciplines (user-as-reporter framing, meta-debugging, foundation principles, cognitive-bias table, systematic investigation, when-to-restart protocol) is now in `get-shit-done/references/debugger-philosophy.md` and pulled into the agent via a single `@file` include. Same content, lighter per-dispatch context footprint (#2363)
- **`gsd-planner`, `gsd-executor`, `gsd-debugger`, `gsd-verifier`, `gsd-phase-researcher`** — Migrated to `@file` includes for the mandatory-initial-read and project-skills-discovery boilerplate. Reduces per-dispatch context load without changing behavior (#2361)
- **Consolidated emphasis-marker density in top 4 agent files** — `gsd-planner.md` (23 → 15), `gsd-phase-researcher.md` (14 → 9), `gsd-doc-writer.md` (11 → 6), and `gsd-executor.md` (10 → 7). Removed `CRITICAL:` prefixes from H2/H3 headings and dropped redundant `CRITICAL:` + `MUST` / `ALWAYS:` + `NEVER:` stacking. RFC-2119 `MUST`/`NEVER` verbs inside normative sentences are preserved. Behavior-preserving; no content removed (#2368)

### Fixed
- **Broken `@planner-source-audit.md` relative references in `gsd-planner.md`** — Two locations referenced `@planner-source-audit.md` (resolves relative to working directory, almost always missing) instead of the correct absolute `@~/.claude/get-shit-done/references/planner-source-audit.md`. The planner's source audit discipline was silently unenforced (#2361)
- **Shell hooks falsely flagged as stale** — `.sh` hooks now ship with version headers; installer stamps them; stale-hook detector matches bash comment syntax (#2136)
- **Worktree cleanup** — Orphaned worktrees pruned in code, not prose; pre-merge deletion guard in quick.md (#2367, #2275)
- **`/gsd-quick` crashes** — gsd-sdk pre-flight check with install hint (#2334); rescue uncommitted SUMMARY.md before worktree removal (#2296)
- **Pattern mapper redundant reads** — Early-stop rule prevents re-reading files (#2312)
- **Context meter scaling** — Respects `CLAUDE_CODE_AUTO_COMPACT_WINDOW` for accurate context bar (#2219)
- **Codex install paths** — Replace all `~/.claude/` paths in Codex `.toml` files (#2320)
- **Graphify edge fallback** — Falls back to `graph.links` when `graph.edges` is absent (#2323)
- **New-project saved defaults** — Display saved defaults before prompting to use them (#2333)
- **UAT parser** — Accept bracketed result values and fix decimal phase renumber padding (#2283)
- **Stats duplicate rows** — Normalize phase numbers in Map to prevent duplicates (#2220)
- **Review prompt shell expansion** — Pipe prompts via stdin (#2222)
- **Intel scope resolution** — Detect .kilo runtime layout (#2351)
- **Read-guard CLAUDECODE env** — Check env var in skip condition (#2344)
- **Add-backlog directory ordering** — Write ROADMAP entry before directory creation (#2286)
- **Settings workstream routing** — Route reads/writes through workstream-aware config path (#2285)
- **Quick normalize flags** — `--discuss --research --validate` combo normalizes to FULL_MODE (#2274)
- **Windows path normalization** — Normalize in update scope detection (#2278)
- **Codex/OpenCode model overrides** — Embed model_overrides in agent files (#2279)
- **Installer custom files** — Restore detect-custom-files and backup_custom_files (#1997)
- **Agent re-read loops** — Add no-re-read critical rules to ui-checker and planner (#2346)

## [1.36.0] - 2026-04-14

### Added
- **`/gsd-graphify` integration** — Knowledge graph for planning agents, enabling richer context connections between project artif

... [OUTPUT TRUNCATED - 85011 chars omitted out of 135011 total] ...

1.5.5] - 2025-01-15

### Changed
- README now documents the `research-project` → `define-requirements` flow (optional but recommended before `create-roadmap`)
- Commands section reorganized into 7 grouped tables (Setup, Execution, Verification, Milestones, Phase Management, Session, Utilities) for easier scanning
- Context Engineering table now includes `research/` and `REQUIREMENTS.md`

## [1.5.4] - 2025-01-15

### Changed
- Research phase now loads REQUIREMENTS.md to focus research on concrete requirements (e.g., "email verification") rather than just high-level roadmap descriptions

## [1.5.3] - 2025-01-15

### Changed
- **execute-phase narration**: Orchestrator now describes what each wave builds before spawning agents, and summarizes what was built after completion. No more staring at opaque status updates.
- **new-project flow**: Now offers two paths — research first (recommended) or define requirements directly (fast path for familiar domains)
- **define-requirements**: Works without prior research. Gathers requirements through conversation when FEATURES.md doesn't exist.

### Removed
- Dead `/gsd:status` command (referenced abandoned background agent model)
- Unused `agent-history.md` template
- `_archive/` directory with old execute-phase version

## [1.5.2] - 2026-01-15

### Added
- Requirements traceability: roadmap phases now include `Requirements:` field listing which REQ-IDs they cover
- plan-phase loads REQUIREMENTS.md and shows phase-specific requirements before planning
- Requirements automatically marked Complete when phase finishes

### Changed
- Workflow preferences (mode, depth, parallelization) now asked in single prompt instead of 3 separate questions
- define-requirements shows full requirements list inline before commit (not just counts)
- Research-project and workflow aligned to both point to define-requirements as next step

### Fixed
- Requirements status now updated by orchestrator (commands) instead of subagent workflow, which couldn't determine phase completion

## [1.5.1] - 2026-01-14

### Changed
- Research agents write their own files directly (STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md) instead of returning results to orchestrator
- Slimmed principles.md and load it dynamically in core commands

## [1.5.0] - 2026-01-14

### Added
- New `/gsd:research-project` command for pre-roadmap ecosystem research — spawns parallel agents to investigate stack, features, architecture, and pitfalls before you commit to a roadmap
- New `/gsd:define-requirements` command for scoping v1 requirements from research findings — transforms "what exists in this domain" into "what we're building"
- Requirements traceability: phases now map to specific requirement IDs with 100% coverage validation

### Changed
- **BREAKING:** New project flow is now: `new-project → research-project → define-requirements → create-roadmap`
- Roadmap creation now requires REQUIREMENTS.md and validates all v1 requirements are mapped to phases
- Simplified questioning in new-project to four essentials (vision, core priority, boundaries, constraints)

## [1.4.29] - 2026-01-14

### Removed
- Deleted obsolete `_archive/execute-phase.md` and `status.md` commands

## [1.4.28] - 2026-01-14

### Fixed
- Restored comprehensive checkpoint documentation with full examples for verification, decisions, and auth gates
- Fixed execute-plan command to use fresh continuation agents instead of broken resume pattern
- Rich checkpoint presentation formats now documented for all three checkpoint types

### Changed
- Slimmed execute-phase command to properly delegate checkpoint handling to workflow

## [1.4.27] - 2025-01-14

### Fixed
- Restored "what to do next" commands after plan/phase execution completes — orchestrator pattern conversion had inadvertently removed the copy/paste-ready next-step routing

## [1.4.26] - 2026-01-14

### Added
- Full changelog history backfilled from git (66 historical versions from 1.0.0 to 1.4.23)

## [1.4.25] - 2026-01-14

### Added
- New `/gsd:whats-new` command shows changes since your installed version
- VERSION file written during installation for version tracking
- CHANGELOG.md now included in package installation

## [1.4.24] - 2026-01-14

### Added
- USER-SETUP.md template for external service configuration

### Removed
- **BREAKING:** ISSUES.md system (replaced by phase-scoped UAT issues and TODOs)

## [1.4.23] - 2026-01-14

### Changed
- Removed dead ISSUES.md system code

## [1.4.22] - 2026-01-14

### Added
- Subagent isolation for debug investigations with checkpoint support

### Fixed
- DEBUG_DIR path constant to prevent typos in debug workflow

## [1.4.21] - 2026-01-14

### Fixed
- SlashCommand tool added to plan-fix allowed-tools

## [1.4.20] - 2026-01-14

### Fixed
- Standardized debug file naming convention
- Debug workflow now invokes execute-plan correctly

## [1.4.19] - 2026-01-14

### Fixed
- Auto-diagnose issues instead of offering choice in plan-fix

## [1.4.18] - 2026-01-14

### Added
- Parallel diagnosis before plan-fix execution

## [1.4.17] - 2026-01-14

### Changed
- Redesigned verify-work as conversational UAT with persistent state

## [1.4.16] - 2026-01-13

### Added
- Pre-execution summary for interactive mode in execute-plan
- Pre-computed wave numbers at plan time

## [1.4.15] - 2026-01-13

### Added
- Context rot explanation to README header

## [1.4.14] - 2026-01-13

### Changed
- YOLO mode is now recommended default in new-project

## [1.4.13] - 2026-01-13

### Fixed
- Brownfield flow documentation
- Removed deprecated resume-task references

## [1.4.12] - 2026-01-13

### Changed
- execute-phase is now recommended as primary execution command

## [1.4.11] - 2026-01-13

### Fixed
- Checkpoints now use fresh continuation agents instead of resume

## [1.4.10] - 2026-01-13

### Changed
- execute-plan converted to orchestrator pattern for performance

## [1.4.9] - 2026-01-13

### Changed
- Removed subagent-only context from execute-phase orchestrator

### Fixed
- Removed "what's out of scope" question from discuss-phase

## [1.4.8] - 2026-01-13

### Added
- TDD reasoning explanation restored to plan-phase docs

## [1.4.7] - 2026-01-13

### Added
- Project state loading before execution in execute-phase

### Fixed
- Parallel execution marked as recommended, not experimental

## [1.4.6] - 2026-01-13

### Added
- Checkpoint pause/resume for spawned agents
- Deviation rules, commit rules, and workflow references to execute-phase

## [1.4.5] - 2026-01-13

### Added
- Parallel-first planning with dependency graphs
- Checkpoint-resume capability for long-running phases
- `.claude/rules/` directory for auto-loaded contribution rules

### Changed
- execute-phase uses wave-based blocking execution

## [1.4.4] - 2026-01-13

### Fixed
- Inline listing for multiple active debug sessions

## [1.4.3] - 2026-01-13

### Added
- `/gsd:debug` command for systematic debugging with persistent state

## [1.4.2] - 2026-01-13

### Fixed
- Installation verification step clarification

## [1.4.1] - 2026-01-13

### Added
- Parallel phase execution via `/gsd:execute-phase`
- Parallel-aware planning in `/gsd:plan-phase`
- `/gsd:status` command for parallel agent monitoring
- Parallelization configuration in config.json
- Wave-based parallel execution with dependency graphs

### Changed
- Renamed `execute-phase.md` workflow to `execute-plan.md` for clarity
- Plan frontmatter now includes `wave`, `depends_on`, `files_modified`, `autonomous`

## [1.4.0] - 2026-01-12

### Added
- Full parallel phase execution system
- Parallelization frontmatter in plan templates
- Dependency analysis for parallel task scheduling
- Agent history schema v1.2 with parallel execution support

### Changed
- Plans can now specify wave numbers and dependencies
- execute-phase orchestrates multiple subagents in waves

## [1.3.34] - 2026-01-11

### Added
- `/gsd:add-todo` and `/gsd:check-todos` for mid-session idea capture

## [1.3.33] - 2026-01-11

### Fixed
- Consistent zero-padding for decimal phase numbers (e.g., 01.1)

### Changed
- Removed obsolete .claude-plugin directory

## [1.3.32] - 2026-01-10

### Added
- `/gsd:resume-task` for resuming interrupted subagent executions

## [1.3.31] - 2026-01-08

### Added
- Planning principles for security, performance, and observability
- Pro patterns section in README

## [1.3.30] - 2026-01-08

### Added
- verify-work option surfaces after plan execution

## [1.3.29] - 2026-01-08

### Added
- `/gsd:verify-work` for conversational UAT validation
- `/gsd:plan-fix` for fixing UAT issues
- UAT issues template

## [1.3.28] - 2026-01-07

### Added
- `--config-dir` CLI argument for multi-account setups
- `/gsd:remove-phase` command

### Fixed
- Validation for --config-dir edge cases

## [1.3.27] - 2026-01-07

### Added
- Recommended permissions mode documentation

### Fixed
- Mandatory verification enforced before phase/milestone completion routing

## [1.3.26] - 2026-01-06

### Added
- Claude Code marketplace plugin support

### Fixed
- Phase artifacts now committed when created

## [1.3.25] - 2026-01-06

### Fixed
- Milestone discussion context persists across /clear

## [1.3.24] - 2026-01-06

### Added
- `CLAUDE_CONFIG_DIR` environment variable support

## [1.3.23] - 2026-01-06

### Added
- Non-interactive install flags (`--global`, `--local`) for Docker/CI

## [1.3.22] - 2026-01-05

### Changed
- Removed unused auto.md command

## [1.3.21] - 2026-01-05

### Changed
- TDD features use dedicated plans for full context quality

## [1.3.20] - 2026-01-05

### Added
- Per-task atomic commits for better AI observability

## [1.3.19] - 2026-01-05

### Fixed
- Clarified create-milestone.md file locations with explicit instructions

## [1.3.18] - 2026-01-05

### Added
- YAML frontmatter schema with dependency graph metadata
- Intelligent context assembly via frontmatter dependency graph

## [1.3.17] - 2026-01-04

### Fixed
- Clarified depth controls compression, not inflation in planning

## [1.3.16] - 2026-01-04

### Added
- Depth parameter for planning thoroughness (`--depth=1-5`)

## [1.3.15] - 2026-01-01

### Fixed
- TDD reference loaded directly in commands

## [1.3.14] - 2025-12-31

### Added
- TDD integration with detection, annotation, and execution flow

## [1.3.13] - 2025-12-29

### Fixed
- Restored deterministic bash commands
- Removed redundant decision_gate

## [1.3.12] - 2025-12-29

### Fixed
- Restored plan-format.md as output template

## [1.3.11] - 2025-12-29

### Changed
- 70% context reduction for plan-phase workflow
- Merged CLI automation into checkpoints
- Compressed scope-estimation (74% reduction) and plan-phase.md (66% reduction)

## [1.3.10] - 2025-12-29

### Fixed
- Explicit plan count check in offer_next step

## [1.3.9] - 2025-12-27

### Added
- Evolutionary PROJECT.md system with incremental updates

## [1.3.8] - 2025-12-18

### Added
- Brownfield/existing projects section in README

## [1.3.7] - 2025-12-18

### Fixed
- Improved incremental codebase map updates

## [1.3.6] - 2025-12-18

### Added
- File paths included in codebase mapping output

## [1.3.5] - 2025-12-17

### Fixed
- Removed arbitrary 100-line limit from codebase mapping

## [1.3.4] - 2025-12-17

### Fixed
- Inline code for Next Up commands (avoids nesting ambiguity)

## [1.3.3] - 2025-12-17

### Fixed
- Check PROJECT.md not .planning/ directory for existing project detection

## [1.3.2] - 2025-12-17

### Added
- Git commit step to map-codebase workflow

## [1.3.1] - 2025-12-17

### Added
- `/gsd:map-codebase` documentation in help and README

## [1.3.0] - 2025-12-17

### Added
- `/gsd:map-codebase` command for brownfield project analysis
- Codebase map templates (stack, architecture, structure, conventions, testing, integrations, concerns)
- Parallel Explore agent orchestration for codebase analysis
- Brownfield integration into GSD workflows

### Changed
- Improved continuation UI with context and visual hierarchy

### Fixed
- Permission errors for non-DSP users (removed shell context)
- First question is now freeform, not AskUserQuestion

## [1.2.13] - 2025-12-17

### Added
- Improved continuation UI with context and visual hierarchy

## [1.2.12] - 2025-12-17

### Fixed
- First question should be freeform, not AskUserQuestion

## [1.2.11] - 2025-12-17

### Fixed
- Permission errors for non-DSP users (removed shell context)

## [1.2.10] - 2025-12-16

### Fixed
- Inline command invocation replaced with clear-then-paste pattern

## [1.2.9] - 2025-12-16

### Fixed
- Git init runs in current directory

## [1.2.8] - 2025-12-16

### Changed
- Phase count derived from work scope, not arbitrary limits

## [1.2.7] - 2025-12-16

### Fixed
- AskUserQuestion mandated for all exploration questions

## [1.2.6] - 2025-12-16

### Changed
- Internal refactoring

## [1.2.5] - 2025-12-16

### Changed
- `<if mode>` tags for yolo/interactive branching

## [1.2.4] - 2025-12-16

### Fixed
- Stale CONTEXT.md references updated to new vision structure

## [1.2.3] - 2025-12-16

### Fixed
- Enterprise language removed from help and discuss-milestone

## [1.2.2] - 2025-12-16

### Fixed
- new-project completion presented inline instead of as question

## [1.2.1] - 2025-12-16

### Fixed
- AskUserQuestion restored for decision gate in questioning flow

## [1.2.0] - 2025-12-15

### Changed
- Research workflow implemented as Claude Code context injection

## [1.1.2] - 2025-12-15

### Fixed
- YOLO mode now skips confirmation gates in plan-phase

## [1.1.1] - 2025-12-15

### Added
- README documentation for new research workflow

## [1.1.0] - 2025-12-15

### Added
- Pre-roadmap research workflow
- `/gsd:research-phase` for niche domain ecosystem discovery
- `/gsd:research-project` command with workflow and templates
- `/gsd:create-roadmap` command with research-aware workflow
- Research subagent prompt templates

### Changed
- new-project split to only create PROJECT.md + config.json
- Questioning rewritten as thinking partner, not interviewer

## [1.0.11] - 2025-12-15

### Added
- `/gsd:research-phase` for niche domain ecosystem discovery

## [1.0.10] - 2025-12-15

### Fixed
- Scope creep prevention in discuss-phase command

## [1.0.9] - 2025-12-15

### Added
- Phase CONTEXT.md loaded in plan-phase command

## [1.0.8] - 2025-12-15

### Changed
- PLAN.md included in phase completion commits

## [1.0.7] - 2025-12-15

### Added
- Path replacement for local installs

## [1.0.6] - 2025-12-15

### Changed
- Internal improvements

## [1.0.5] - 2025-12-15

### Added
- Global/local install prompt during setup

### Fixed
- Bin path fixed (removed ./)
- .DS_Store ignored

## [1.0.4] - 2025-12-15

### Fixed
- Bin name and circular dependency removed

## [1.0.3] - 2025-12-15

### Added
- TDD guidance in planning workflow

## [1.0.2] - 2025-12-15

### Added
- Issue triage system to prevent deferred issue pile-up

## [1.0.1] - 2025-12-15

### Added
- Initial npm package release

## [1.0.0] - 2025-12-14

### Added
- Initial release of GSD (Get Shit Done) meta-prompting system
- Core slash commands: `/gsd:new-project`, `/gsd:discuss-phase`, `/gsd:plan-phase`, `/gsd:execute-phase`
- PROJECT.md and STATE.md templates
- Phase-based development workflow
- YOLO mode for autonomous execution
- Interactive mode with checkpoints

[Unreleased]: https://github.com/gsd-build/get-shit-done/compare/v1.37.1...HEAD
[1.37.1]: https://github.com/gsd-build/get-shit-done/compare/v1.37.0...v1.37.1
[1.37.0]: https://github.com/gsd-build/get-shit-done/compare/v1.36.0...v1.37.0
[1.36.0]: https://github.com/gsd-build/get-shit-done/releases/tag/v1.36.0
[1.35.0]: https://github.com/gsd-build/get-shit-done/releases/tag/v1.35.0
[1.34.2]: https://github.com/gsd-build/get-shit-done/releases/tag/v1.34.2
[1.34.1]: https://github.com/gsd-build/get-shit-done/releases/tag/v1.34.1
[1.34.0]: https://github.com/gsd-build/get-shit-done/releases/tag/v1.34.0
[1.33.0]: https://github.com/gsd-build/get-shit-done/releases/tag/v1.33.0
[1.30.0]: https://github.com/gsd-build/get-shit-done/releases/tag/v1.30.0
[1.29.0]: https://github.com/gsd-build/get-shit-done/releases/tag/v1.29.0
[1.28.0]: https://github.com/gsd-build/get-shit-done/releases/tag/v1.28.0
[1.27.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.27.0
[1.26.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.26.0
[1.25.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.25.0
[1.24.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.24.0
[1.23.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.23.0
[1.22.4]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.22.4
[1.22.3]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.22.3
[1.22.2]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.22.2
[1.22.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.22.1
[1.22.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.22.0
[1.21.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.21.1
[1.21.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.21.0
[1.20.6]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.20.6
[1.20.5]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.20.5
[1.20.4]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.20.4
[1.20.3]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.20.3
[1.20.2]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.20.2
[1.20.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.20.1
[1.20.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.20.0
[1.19.2]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.19.2
[1.19.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.19.1
[1.19.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.19.0
[1.18.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.18.0
[1.17.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.17.0
[1.16.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.16.0
[1.15.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.15.0
[1.14.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.14.0
[1.13.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.13.0
[1.12.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.12.1
[1.12.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.12.0
[1.11.2]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.11.2
[1.11.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.11.0
[1.10.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.10.1
[1.10.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.10.0
[1.9.12]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.9.12
[1.9.11]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.9.11
[1.9.10]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.9.10
[1.9.9]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.9.9
[1.9.8]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.9.8
[1.9.7]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.9.7
[1.9.6]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.9.6
[1.9.5]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.9.5
[1.9.4]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.9.4
[1.9.2]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.9.2
[1.9.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.9.0
[1.8.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.8.0
[1.7.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.7.1
[1.7.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.7.0
[1.6.4]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.6.4
[1.6.3]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.6.3
[1.6.2]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.6.2
[1.6.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.6.1
[1.5.30]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.30
[1.5.29]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.29
[1.5.28]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.28
[1.5.27]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.27
[1.5.26]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.26
[1.5.25]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.25
[1.5.24]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.24
[1.5.23]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.23
[1.5.22]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.22
[1.5.21]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.21
[1.5.20]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.20
[1.5.19]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.19
[1.5.18]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.18
[1.5.17]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.17
[1.5.16]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.16
[1.5.15]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.15
[1.5.14]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.14
[1.5.13]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.13
[1.5.12]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.12
[1.5.11]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.11
[1.5.10]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.10
[1.5.9]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.9
[1.5.8]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.8
[1.5.7]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.7
[1.5.6]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.6
[1.5.5]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.5
[1.5.4]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.4
[1.5.3]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.3
[1.5.2]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.2
[1.5.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.1
[1.5.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.5.0
[1.4.30]: https://github.com/pingchesu/gsd-hermes/releases/tag/v1.4.30
[1.4.29]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.29
[1.4.28]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.28
[1.4.27]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.27
[1.4.26]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.26
[1.4.25]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.25
[1.4.24]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.24
[1.4.23]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.23
[1.4.22]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.22
[1.4.21]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.21
[1.4.20]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.20
[1.4.19]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.19
[1.4.18]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.18
[1.4.17]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.17
[1.4.16]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.16
[1.4.15]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.15
[1.4.14]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.14
[1.4.13]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.13
[1.4.12]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.12
[1.4.11]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.11
[1.4.10]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.10
[1.4.9]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.9
[1.4.8]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.8
[1.4.7]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.7
[1.4.6]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.6
[1.4.5]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.5
[1.4.4]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.4
[1.4.3]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.3
[1.4.2]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.2
[1.4.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.1
[1.4.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.4.0
[1.3.34]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.34
[1.3.33]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.33
[1.3.32]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.32
[1.3.31]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.31
[1.3.30]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.30
[1.3.29]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.29
[1.3.28]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.28
[1.3.27]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.27
[1.3.26]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.26
[1.3.25]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.25
[1.3.24]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.24
[1.3.23]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.23
[1.3.22]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.22
[1.3.21]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.21
[1.3.20]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.20
[1.3.19]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.19
[1.3.18]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.18
[1.3.17]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.17
[1.3.16]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.16
[1.3.15]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.15
[1.3.14]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.14
[1.3.13]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.13
[1.3.12]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.12
[1.3.11]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.11
[1.3.10]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.10
[1.3.9]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.9
[1.3.8]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.8
[1.3.7]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.7
[1.3.6]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.6
[1.3.5]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.5
[1.3.4]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.4
[1.3.3]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.3
[1.3.2]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.2
[1.3.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.1
[1.3.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.3.0
[1.2.13]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.13
[1.2.12]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.12
[1.2.11]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.11
[1.2.10]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.10
[1.2.9]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.9
[1.2.8]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.8
[1.2.7]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.7
[1.2.6]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.6
[1.2.5]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.5
[1.2.4]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.4
[1.2.3]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.3
[1.2.2]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.2
[1.2.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.1
[1.2.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.2.0
[1.1.2]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.1.2
[1.1.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.1.1
[1.1.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.1.0
[1.0.11]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.0.11
[1.0.10]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.0.10
[1.0.9]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.0.9
[1.0.8]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.0.8
[1.0.7]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.0.7
[1.0.6]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.0.6
[1.0.5]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.0.5
[1.0.4]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.0.4
[1.0.3]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.0.3
[1.0.2]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.0.2
[1.0.1]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.0.1
[1.0.0]: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.0.0
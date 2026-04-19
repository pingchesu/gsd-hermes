# Phase 2: Hermes Runtime Install - Research

**Researched:** 2026-04-19  
**Domain:** Installer/runtime registration, path semantics, and bounded regression coverage for adding Hermes as a supported `gsd-hermes` runtime  
**Confidence:** Medium

## Executive Summary

Phase 2 should add Hermes as an installer-visible runtime by extending the same narrow seams upstream already uses for every supported runtime: CLI flag parsing, `selectedRuntimes`, interactive `runtimeMap`, help/examples text, helper-based path resolution, one runtime branch inside `install()`, and matching post-install/manifest behavior in `finishInstall()`. Because the current `gsd-hermes` repo is still a planning-only tree, Phase 2 must begin with the documented first-import flow before any installer edits; the current upstream installer is already structured for additive runtime support in [`/tmp/gsd-hermes-upstream/bin/install.js`](/tmp/gsd-hermes-upstream/bin/install.js:58), so Phase 2 does not need a new distribution layer or a separate Hermes-only installer.

Hermes path semantics are not a direct match for existing local-install runtimes. Official Hermes docs say the primary writable skill directory is `~/.hermes/skills/`, while `skills.external_dirs` are read-only discovery sources configured via `~/.hermes/config.yaml`. That means the truthful Phase 2 install model is:

- `global install`: first-class, writes managed GSD assets under `~/.hermes`
- `project-linked install`: deferred as a later bridge mode built on `external_dirs`, not a native local install

The safest implementation strategy is GSD-first and installer-first:

1. Run the documented first import so `bin/install.js` and `tests/*` exist in the fork before Phase 2 edits
2. Register `--hermes` and add Hermes to the interactive runtime selector
3. Reject Hermes local install attempts directly (`--hermes --local`) and interactively (`runtime === 'hermes' && !isGlobal`) instead of implying unsupported native local behavior
4. Add Hermes helper cases for directory naming and global path resolution
5. Add one bounded Hermes install branch that writes into the Hermes-owned install root
6. Add focused regression coverage in `tests/multi-runtime-select.test.cjs` plus a dedicated `tests/hermes-install.test.cjs`

Command discovery and `external_dirs` bridging should remain out of scope for this phase. Hermes may auto-surface skills as slash commands, but Phase 2 should only guarantee correct runtime selection and install-path semantics, not `/gsd-*` usability yet.

## Verified Facts

### Upstream installer structure

- Upstream `get-shit-done` currently ships a monolithic runtime installer in [`/tmp/gsd-hermes-upstream/bin/install.js`](/tmp/gsd-hermes-upstream/bin/install.js:1) and publishes it as the package entrypoint in [`/tmp/gsd-hermes-upstream/package.json`](/tmp/gsd-hermes-upstream/package.json:1).
- Runtime registration is additive and explicit:
  - CLI flags and `selectedRuntimes` are defined near the top of `install.js` at [`58-109`](/tmp/gsd-hermes-upstream/bin/install.js:58)
  - `getDirName()` handles runtime-local names at [`145-160`](/tmp/gsd-hermes-upstream/bin/install.js:145)
  - `getConfigDirFromHome()` handles template/hook path substitution at [`169-195`](/tmp/gsd-hermes-upstream/bin/install.js:169)
  - `getGlobalDir()` handles global install roots and env-var precedence at [`253-390`](/tmp/gsd-hermes-upstream/bin/install.js:253)
  - `promptRuntime()` defines the interactive menu and `runtimeMap` at [`6513-6588`](/tmp/gsd-hermes-upstream/bin/install.js:6513)
- Upstream install behavior is runtime-specific but intentionally repetitive. Each runtime gets a bounded `else if (isRuntime)` branch in `install()` around [`5470-5645`](/tmp/gsd-hermes-upstream/bin/install.js:5470).
- Manifest generation is centralized in `writeManifest()` at [`5255-5318`](/tmp/gsd-hermes-upstream/bin/install.js:5255), with runtime-dependent file categories.

### Existing runtime test patterns

- Interactive runtime selection is covered by one shared source-mirroring test in [`/tmp/gsd-hermes-upstream/tests/multi-runtime-select.test.cjs`](/tmp/gsd-hermes-upstream/tests/multi-runtime-select.test.cjs:1).
- New runtimes usually get a dedicated install-focused regression file:
  - Kilo: [`tests/kilo-install.test.cjs`](/tmp/gsd-hermes-upstream/tests/kilo-install.test.cjs:1)
  - Copilot: [`tests/copilot-install.test.cjs`](/tmp/gsd-hermes-upstream/tests/copilot-install.test.cjs:1)
  - Antigravity: [`tests/antigravity-install.test.cjs`](/tmp/gsd-hermes-upstream/tests/antigravity-install.test.cjs:1)
- These tests primarily verify helper behavior (`getDirName`, `getGlobalDir`, `getConfigDirFromHome`), source integration (`--runtime`, `--all`, menu option order), and only then runtime-specific config/install behavior.

### Hermes runtime facts

- Hermes treats `~/.hermes/skills/` as the primary writable skill directory and source of truth. See [`website/docs/user-guide/features/skills.md`](/tmp/gsd-hermes-hermes/website/docs/user-guide/features/skills.md:1).
- Hermes supports `skills.external_dirs` in `~/.hermes/config.yaml`, but those directories are read-only discovery sources and are silently skipped if absent. See [`skills.md`](/tmp/gsd-hermes-hermes/website/docs/user-guide/features/skills.md:174).
- Hermes makes installed skills available as slash commands. See [`skills.md`](/tmp/gsd-hermes-hermes/website/docs/user-guide/features/skills.md:17).
- Hermes loads one project context file per session with priority `.hermes.md` → `AGENTS.md` → `CLAUDE.md` → `.cursorrules`, and progressively discovers subdirectory `AGENTS.md`/`CLAUDE.md`. See [`website/docs/user-guide/features/context-files.md`](/tmp/gsd-hermes-hermes/website/docs/user-guide/features/context-files.md:1).
- Hermes developer guidance prefers skills over tools when the capability is instructions + shell commands + existing tools. See [`website/docs/developer-guide/creating-skills.md`](/tmp/gsd-hermes-hermes/website/docs/developer-guide/creating-skills.md:1).

### Downstream precedent from gsd-opencode

- `gsd-opencode` proves a downstream distribution can wrap install/update/check/repair/uninstall flows around a GSD fork. See [`/tmp/gsd-hermes-opencode/DISTRIBUTION-MANAGER.md`](/tmp/gsd-hermes-opencode/DISTRIBUTION-MANAGER.md:1).
- But `gsd-opencode` also shows the maintenance cost of translation-heavy runtime support: its README explicitly describes direct-port adaptation and ongoing divergence pressure. See [`/tmp/gsd-hermes-opencode/README.md`](/tmp/gsd-hermes-opencode/README.md:1).
- For Phase 2, the useful lesson is not “build a new manager first”; it is “keep runtime registration and install semantics explicit and testable.”

## Recommended Install Model

### Supported in Phase 2

#### Global install

Primary target:

- Hermes home root: `~/.hermes`
- Managed skill surface under: `~/.hermes/skills/`
- No Phase-2 commitment to a deeper child install root beneath `skills/`; child layout is deferred until command-discovery work proves the exact Hermes-facing contract

Phase-2 truth:

- Hermes is selectable during install
- Installer resolves the Hermes global root consistently
- Direct and interactive local install attempts are rejected clearly
- Install output tells the user which Hermes mode was configured
- The inherited GSD-owned `~/.gsd/defaults.json` write for non-Claude runtimes remains in place and should be documented as accepted Phase-2 behavior

This is the natural first-class install path because Hermes itself documents `~/.hermes/skills/` as the primary writable skill directory.

### Explicitly deferred

#### Project-linked install via `external_dirs`

This should not be presented as native local install in Phase 2.

Reasons:

- Hermes docs describe `external_dirs` as read-only discovery directories, not an equal local install scope
- The project requirements already say not to claim Hermes has a native local skill install mode
- Config mutation of `~/.hermes/config.yaml` is more naturally grouped with later lifecycle/discovery work than with initial runtime registration

Phase-2 wording should therefore say:

- Hermes runtime support is installable
- Global path semantics are defined now
- Project-linked mode is planned for Phase 3 as an `external_dirs` bridge

## Installer Touchpoints

The highest-signal implementation seams for Phase 2 are:

### 1. Runtime registration

File:

- [`bin/install.js`](/tmp/gsd-hermes-upstream/bin/install.js:58)

Expected changes:

- add `hasHermes`
- include Hermes in `selectedRuntimes`
- include Hermes in the real upstream `hasAll`/`selectedRuntimes = [...]` flow
- add `--hermes` help text and examples
- reject `--hermes --local` explicitly instead of falling through to unsupported local semantics

### 2. Path helper cases

Files/functions:

- `getDirName(runtime)` at [`145-160`](/tmp/gsd-hermes-upstream/bin/install.js:145)
- `getConfigDirFromHome(runtime, isGlobal)` at [`169-195`](/tmp/gsd-hermes-upstream/bin/install.js:169)
- `getGlobalDir(runtime, explicitDir)` at [`253-390`](/tmp/gsd-hermes-upstream/bin/install.js:253)

Recommended semantics:

- `getDirName('hermes')` should represent the repo-owned/project-linked directory name only if Phase 2 needs a placeholder for future bridging; otherwise it can still be defined now for consistency.
- `getConfigDirFromHome('hermes', true)` should map to `'.hermes'`
- `getGlobalDir('hermes')` should default to `path.join(os.homedir(), '.hermes')`
- If a Hermes-specific env var is introduced later, it should follow the same precedence pattern as Kilo/Copilot/Antigravity

### 3. Interactive runtime menu

File:

- [`promptRuntime()`](/tmp/gsd-hermes-upstream/bin/install.js:6513)

Recommended behavior:

- add Hermes as one numbered option
- update `runtimeMap`
- update `allRuntimes`
- show the truthful global path in the menu label
- keep the interactive flow truthful that Hermes local/project mode is rejected in Phase 2 and `external_dirs` remains later work

### 4. Runtime-specific install branch

File:

- `install()` runtime ladder around [`5470-5645`](/tmp/gsd-hermes-upstream/bin/install.js:5470)

Phase-2 recommendation:

- add a single `isHermes` boolean
- add one bounded install branch
- keep it focused on the proven `~/.hermes/skills/` root, copied artifact shape, and success reporting

This branch should not yet own external-dir wiring or discovery docs beyond install result messaging, and it should reject interactive local/non-global Hermes selection instead of inventing a native local path.

### 5. Post-install behavior and manifest coverage

Files/functions:

- `writeManifest()` at [`5255-5318`](/tmp/gsd-hermes-upstream/bin/install.js:5255)
- post-install runtime guards around [`6003-6051`](/tmp/gsd-hermes-upstream/bin/install.js:6003)
- `finishInstall()` runtime exclusions around [`6364-6452`](/tmp/gsd-hermes-upstream/bin/install.js:6364)

Decision needed during implementation:

- whether Hermes writes a managed runtime config file in Phase 2 or behaves like a no-`settings.json` runtime

Resolved Phase-2 decision:

- Hermes should behave like the runtimes that skip runtime-owned `settings.json` writes, unless the imported upstream code proves a Hermes-owned config fragment is required.
- Hermes does **not** suppress the existing upstream `finishInstall()` behavior that writes `~/.gsd/defaults.json` with `resolve_model_ids: "omit"` for non-Claude runtimes. That side effect is GSD-owned rather than Hermes-runtime-owned, so Phase 2 should keep it and verify it explicitly.

## Test Strategy

### Must-have coverage in Phase 2

#### Shared selection regression

Update:

- [`tests/multi-runtime-select.test.cjs`](/tmp/gsd-hermes-upstream/tests/multi-runtime-select.test.cjs:1)

Add:

- Hermes in mirrored `runtimeMap`
- Hermes in `allRuntimes`
- source assertions for new menu option and ordering
- source assertions for the real upstream `hasAll`/`selectedRuntimes = [...]` structure so tests do not drift to a non-existent `args.all` API

#### Dedicated Hermes install regression

Create:

- `tests/hermes-install.test.cjs`

Recommended structure, matching other runtime tests:

- `getDirName('hermes')`
- `getConfigDirFromHome('hermes', false/true)`
- `getGlobalDir('hermes')`
- env-var precedence tests only if Phase 2 adds Hermes-specific env vars
- source assertions for `--hermes`, the real `hasAll` branch, runtime boolean, direct and interactive local rejection, install branch under `~/.hermes/skills/`, explicit `global mode` output, and accepted `resolve_model_ids` side effect

#### Optional converter coverage

Only add Hermes to `tests/runtime-converters.test.cjs` if Phase 2 introduces a real Hermes-specific converter/helper. Otherwise keep converter work out of scope until command discovery work starts.

### Test analogs to copy

- `tests/antigravity-install.test.cjs` for split path semantics and skill-runtime shape
- `tests/kilo-install.test.cjs` for env-var precedence helper tests
- `tests/qwen-install.test.cjs` / `tests/trae-install.test.cjs` for minimal install smoke structure
- `tests/multi-runtime-select.test.cjs` for shared menu/selection coverage

## Risks and Unknowns

### 1. Hermes config ownership is broader than simple path resolution

`external_dirs` and other Hermes behavior live in `~/.hermes/config.yaml`, but Phase 2 should avoid pretending that runtime registration alone solves config ownership. If Hermes later needs managed config edits, that should be introduced intentionally with merge/cleanup tests, not casually inside Phase 2.

### 2. Upstream runtime support is centralized in one large installer file

This keeps Hermes changes bounded, but it also means Phase 2 will touch a high-churn file. The mitigation is to follow existing additive patterns instead of refactoring the installer while adding Hermes.

### 3. Local project-linked semantics are easy to overclaim

Because Hermes makes external skills appear like normal slash commands, there is a documentation risk of implying full native local install. Phase 2 docs and plan outputs need to hold the boundary line clearly.

### 4. Node engine mismatch remains a local implementation constraint

Upstream requires `Node >= 22` in [`package.json`](/tmp/gsd-hermes-upstream/package.json:24), while prior local project docs recorded a lower local Node version. That does not block planning, but it is a practical implementation/test risk once upstream code is imported.

## Deferred to Later Phases

These are intentionally not Phase-2 responsibilities:

- slash-command `/gsd-*` discovery validation in Hermes
- project-linked install implementation via `skills.external_dirs`
- runtime-specific command/skill conversion details beyond what the installer branch needs
- update, uninstall, doctor, and lifecycle tooling
- full workflow parity inside Hermes

Those concerns already map to later roadmap phases:

- Phase 3: command discovery + project-linked bridge mode
- Phase 4: workflow parity
- Phase 5: lifecycle tooling

## Bottom Line

Phase 2 should behave like a clean upstream-style runtime addition:

- register Hermes in the installer
- define Hermes helper-based global path semantics
- add one bounded runtime install branch
- prove the behavior with dedicated install tests

Anything involving `external_dirs`, `/gsd-*` discovery, or broader Hermes runtime parity should be treated as downstream work for later phases, not folded into initial runtime registration.

# Phase 2: Hermes Runtime Install - Pattern Map

**Mapped:** 2026-04-19  
**Scope:** `bin/install.js`, `package.json`, runtime-install tests, and Phase 1 governance docs  
**Boundary:** Phase 2 only: runtime selection, install-path semantics, and runtime-focused regression coverage

## Phase 2 Guardrails

- Keep Hermes changes inside the installer seam and test seam, not broad workflow files.
  Source: [`docs/fork-ownership.md:11-15`](../../../../docs/fork-ownership.md), [`docs/fork-ownership.md:27-29`](../../../../docs/fork-ownership.md)
- Treat runtime path/config/conversion logic as Hermes adapter work; avoid upstream-wide rewrites.
  Source: [`docs/upstream-sync.md:47-60`](../../../../docs/upstream-sync.md)
- Phase 2 is only about installer support and correct path handling for `DIST-01`.
  Source: [`.planning/ROADMAP.md:43-56`](../../ROADMAP.md), [`.planning/REQUIREMENTS.md:13-23`](../../REQUIREMENTS.md)
- Do not claim a native local Hermes install mode. Hermes project-linked support is an `external_dirs` bridge and belongs to later work.
  Source: [`docs/hermes-compatibility.md:12-19`](../../../../docs/hermes-compatibility.md), [`docs/hermes-compatibility.md:31-37`](../../../../docs/hermes-compatibility.md), [`.planning/REQUIREMENTS.md:52-60`](../../REQUIREMENTS.md)

## Candidate Analog Runtimes

| Rank | Runtime | Why it is the closest analog for Phase 2 | Strongest source files |
| --- | --- | --- | --- |
| 1 | `antigravity` | Best match for split install semantics: special global home under another runtime tree (`~/.gemini/antigravity`), different local path (`.agent`), dedicated content conversion, and skill-based install with no `settings.json`. This is the strongest precedent if Hermes needs “global path != project-linked path” logic. | `bin/install.js:152,184-187,303-312,5532-5546,6055-6056`, `tests/antigravity-install.test.cjs:30-103,108-168,173-228,287-379` |
| 2 | `kilo` | Best path-resolution analog when a runtime needs explicit env-var precedence and helper-specific config handling. Use this shape if Hermes needs `HERMES_CONFIG_DIR` or similar resolution priority. | `bin/install.js:150,182,223-267,5492-5506,6400-6403`, `tests/kilo-install.test.cjs:25-106,119-205,207-265` |
| 3 | `codex` | Best post-install behavior analog for “runtime has its own config surface and no `settings.json` path.” Also a good model for help/banner/command differences that are runtime-specific but bounded. | `bin/install.js:151,183,281-289,5507-5517,5931-6003,6440-6444`, `tests/codex-config.test.cjs:30-45,118-188,192-268,272-351,383-619` |
| 4 | `copilot` | Best analog when local and global path names intentionally differ (`.github` vs `~/.copilot`) and when runtime-specific output files are merged instead of blindly overwritten. Useful if Hermes needs a managed project-owned config fragment later. | `bin/install.js:147,175,292-300,5517-5531,6006-6016`, `tests/copilot-install.test.cjs:38-173,251-337,601-700,811-950` |
| 5 | `qwen` / `trae` | Best minimal skill-runtime analogs for “new runtime branch + local install smoke + no-settings return.” Useful only if Hermes truly gets a native skill directory, which current docs say it should not. | `bin/install.js:155-159,190-194,346-387,5577-5618,6019-6031`, `tests/qwen-install.test.cjs:19-112`, `tests/trae-install.test.cjs:23-195` |

## Installer Pattern Inventory

### 1. Runtime registration is additive in a small fixed set of seams

Copy this change pattern from [`bin/install.js:58-109`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js):

- Add one `has<Runtime>` flag near the other CLI flags.
- Add the runtime into the `--all` list.
- Add one `selectedRuntimes.push('<runtime>')` branch.

This is the narrowest and most upstream-friendly way to make Hermes installer-visible.

### 2. Path semantics live in three helpers, not inline in `install()`

Strongest reusable shape:

- `getDirName(runtime)` for project-local naming.
  Source: [`bin/install.js:145-160`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js)
- `getConfigDirFromHome(runtime, isGlobal)` for hook/template path substitution.
  Source: [`bin/install.js:163-195`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js)
- `getGlobalDir(runtime, explicitDir)` for env-var precedence and default global path.
  Source: [`bin/install.js:248-390`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js)

Best analog choices by need:

- If Hermes needs nested global path or a bridge-specific global root, copy the `antigravity` helper shape from [`bin/install.js:184-187`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js) and [`bin/install.js:303-312`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js).
- If Hermes needs env-var precedence, copy the `kilo` helper shape from [`bin/install.js:223-267`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js).
- If Hermes needs a simple single-dir runtime home, copy the `codex`/`qwen`/`trae` helper shape from [`bin/install.js:281-289`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js), [`bin/install.js:357-365`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js), or [`bin/install.js:346-355`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js).

### 3. Help and interactive menu are part of runtime support, not optional polish

Reuse from:

- Help output: [`bin/install.js:447-448`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js)
- Interactive runtime menu: [`bin/install.js:6529-6588`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js)
- Install-location prompt examples: [`bin/install.js:6616-6633`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js)

Pattern to copy:

- Add Hermes to `runtimeMap`.
- Add Hermes to `allRuntimes`.
- Add one menu line showing the truthful global path.
- Let `promptLocation()` derive path examples from `getGlobalDir()` and `getDirName()` instead of hardcoding Hermes in multiple places.

### 4. Runtime-specific install behavior is one `else if (isRuntime)` branch

The install branch pattern is explicit and repetitive by design. Copy that structure rather than abstracting it.

Strongest references:

- Kilo/OpenCode flat-command branch: [`bin/install.js:5492-5506`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js)
- Codex skills branch: [`bin/install.js:5507-5517`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js)
- Copilot skills branch: [`bin/install.js:5517-5531`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js)
- Antigravity skills branch: [`bin/install.js:5532-5546`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js)
- Cline no-skills special case: [`bin/install.js:5620-5624`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js)

For Hermes Phase 2, the safest pattern is:

- Add `const isHermes = runtime === 'hermes'` beside the existing runtime booleans.
- Add a single Hermes branch in the same `install()` ladder.
- Keep the branch narrow: target dir, copied artifact shape, success counting, and return behavior only.

### 5. Post-install return behavior is runtime-specific and easy to regress

This is where new runtimes often break.

Key references:

- No-`settings.json` runtime returns for Codex/Copilot/Cursor/Windsurf/Trae/Cline:
  [`bin/install.js:6003-6051`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js)
- `finishInstall()` guard for runtimes that skip `settings.json`:
  [`bin/install.js:6364-6452`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js)

Reuse rule:

- Decide explicitly whether Hermes writes `settings.json`, writes another managed config file, or returns `{ settingsPath: null, settings: null, statuslineCommand: null, ... }`.
- Then add Hermes consistently to both the install-time return branch and the `finishInstall()` exclusion guards.

### 6. Package metadata is not the runtime truth source

`package.json` is stable around `bin`, `files`, and Node engine, but its human-readable runtime list lags the real installer surface.

Reference: [`package.json:4-31`](../../../../../../tmp/gsd-hermes-upstream/package.json)

Bounded guidance:

- Treat `bin/install.js` as the source of truth for runtime support.
- Only touch `package.json` in Phase 2 if you need installer-facing metadata parity.
- Do not invent Hermes-specific packaging structure or new publish scripts in this phase.

## Test Pattern Inventory

### 1. Shared selection coverage lives in one source-mirroring test

Copy the structure from [`tests/multi-runtime-select.test.cjs:19-196`](../../../../../../tmp/gsd-hermes-upstream/tests/multi-runtime-select.test.cjs):

- Mirror `runtimeMap` and `allRuntimes` as test constants.
- Test single-select, multi-select, dedupe, invalid-input fallback, and option ordering.
- Add source assertions that the prompt text, menu option number, and split regex all still exist.

This is the correct place to prove Hermes is selectable from interactive install.

### 2. Per-runtime install tests are small, helper-first, and direct

Best minimal pattern: [`tests/kilo-install.test.cjs:25-106`](../../../../../../tmp/gsd-hermes-upstream/tests/kilo-install.test.cjs), [`tests/antigravity-install.test.cjs:30-103`](../../../../../../tmp/gsd-hermes-upstream/tests/antigravity-install.test.cjs), [`tests/qwen-install.test.cjs:19-76`](../../../../../../tmp/gsd-hermes-upstream/tests/qwen-install.test.cjs)

Copy this test shape for `tests/hermes-install.test.cjs`:

- `getDirName('hermes')`
- `getConfigDirFromHome('hermes', false/true)`
- `getGlobalDir('hermes')`
- env-var precedence tests if Hermes has `HERMES_CONFIG_DIR`
- one source-integration block asserting `--hermes`, prompt/menu entry, `--all`, and runtime boolean/branch existence

### 3. Use conversion tests only if Hermes needs conversion helpers in Phase 2

Relevant analogs:

- Shared converter suite for small frontmatter/path helpers:
  [`tests/runtime-converters.test.cjs:56-228`](../../../../../../tmp/gsd-hermes-upstream/tests/runtime-converters.test.cjs)
- Antigravity conversion coverage:
  [`tests/antigravity-install.test.cjs:108-283`](../../../../../../tmp/gsd-hermes-upstream/tests/antigravity-install.test.cjs)
- Codex conversion coverage:
  [`tests/codex-config.test.cjs:118-268`](../../../../../../tmp/gsd-hermes-upstream/tests/codex-config.test.cjs)
- Copilot conversion coverage:
  [`tests/copilot-install.test.cjs:175-337`](../../../../../../tmp/gsd-hermes-upstream/tests/copilot-install.test.cjs), [`tests/copilot-install.test.cjs:520-798`](../../../../../../tmp/gsd-hermes-upstream/tests/copilot-install.test.cjs)

Recommendation:

- If Hermes Phase 2 only adds runtime selection and path ownership, do **not** force Hermes into `tests/runtime-converters.test.cjs`.
- Only add Hermes converter tests if you introduce a real `convertClaudeToHermes*` helper in this phase.

### 4. Install smoke tests should stay phase-bounded

Useful install smoke references:

- Antigravity skill-copy structure: [`tests/antigravity-install.test.cjs:287-379`](../../../../../../tmp/gsd-hermes-upstream/tests/antigravity-install.test.cjs)
- Qwen local install smoke: [`tests/qwen-install.test.cjs:78-112`](../../../../../../tmp/gsd-hermes-upstream/tests/qwen-install.test.cjs)
- Trae local install smoke: [`tests/trae-install.test.cjs:157-195`](../../../../../../tmp/gsd-hermes-upstream/tests/trae-install.test.cjs)
- Cline regression on null `settingsPath`: [`tests/cline-install.test.cjs:158-173`](../../../../../../tmp/gsd-hermes-upstream/tests/cline-install.test.cjs)

For Phase 2, keep Hermes smoke coverage to:

- install returns the correct runtime name
- resolved config dir is the expected global or project-linked target
- expected Hermes-owned artifact root exists
- if Hermes skips `settings.json`, `finishInstall()` does not try to write one

### 5. Managed-config merge tests are a separate pattern, not default coverage

Only copy these if Hermes writes a shared user-owned config file in Phase 2:

- Codex marker-based merge tests:
  [`tests/codex-config.test.cjs:383-619`](../../../../../../tmp/gsd-hermes-upstream/tests/codex-config.test.cjs)
- Copilot marker-based merge/strip tests:
  [`tests/copilot-install.test.cjs:800-950`](../../../../../../tmp/gsd-hermes-upstream/tests/copilot-install.test.cjs)

If Hermes only resolves paths and selects an install target, this is overkill for Phase 2.

## Reuse Recommendations

### `bin/install.js`

Reuse these exact patterns:

1. Runtime registration via additive booleans and `selectedRuntimes` pushes from [`bin/install.js:62-109`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js).
2. Runtime path ownership via `getDirName()`, `getConfigDirFromHome()`, and `getGlobalDir()` from [`bin/install.js:145-195`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js) and [`bin/install.js:248-390`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js).
3. Runtime menu/help updates from [`bin/install.js:447-448`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js) and [`bin/install.js:6529-6588`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js).
4. One narrow `install()` branch from [`bin/install.js:5492-5546`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js) or [`bin/install.js:5620-5624`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js), depending on whether Hermes installs skills or only writes a runtime-owned config surface.
5. Matching post-install exclusion/return logic from [`bin/install.js:6003-6051`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js) and [`bin/install.js:6364-6452`](../../../../../../tmp/gsd-hermes-upstream/bin/install.js).

### `tests/multi-runtime-select.test.cjs`

Reuse the whole structure from [`tests/multi-runtime-select.test.cjs:19-196`](../../../../../../tmp/gsd-hermes-upstream/tests/multi-runtime-select.test.cjs):

- add Hermes to the mirrored `runtimeMap`
- add Hermes to `allRuntimes`
- add one assertion for the new option number and menu text

### `tests/hermes-install.test.cjs` (new)

Model it primarily on:

- `tests/antigravity-install.test.cjs:30-103` for split global/local path semantics
- `tests/kilo-install.test.cjs:41-106` if Hermes needs env-var precedence
- `tests/qwen-install.test.cjs:78-112` or `tests/trae-install.test.cjs:157-195` for minimal install smoke
- `tests/cline-install.test.cjs:158-173` if Hermes returns `null` settings/config outputs

### `tests/runtime-converters.test.cjs`

Touch only if Hermes adds conversion helpers in Phase 2. If not, leave it alone and keep Hermes coverage in the dedicated install test plus `multi-runtime-select`.

### `package.json`

If touched, keep it minimal:

- do not change `bin`, `files`, `engines`, or test scripts for Hermes-specific reasons in Phase 2
- only update installer-facing human-readable metadata if you decide upstream parity requires it

## Avoid Patterns

1. Do **not** copy `qwen`/`trae` local skill-dir semantics blindly.
   Reason: Hermes docs explicitly forbid claiming a native local install mode; project-linked mode is an `external_dirs` bridge, not a generic `./.runtime/skills` install.
   Source: [`docs/hermes-compatibility.md:12-19`](../../../../docs/hermes-compatibility.md), [`.planning/REQUIREMENTS.md:52-60`](../../REQUIREMENTS.md)

2. Do **not** pull Phase 3 command-discovery work into Phase 2.
   That means no broad `/gsd-*` discovery claims, no workflow-surface rewrites, and no runtime-specific workflow docs beyond install output truth.
   Source: [`.planning/ROADMAP.md:58-71`](../../ROADMAP.md)

3. Do **not** start with Codex/Copilot merge complexity unless Hermes actually needs a managed shared config file now.
   Marker-based merge tests are valuable, but only when Phase 2 introduces a merged user-owned file.

4. Do **not** add lifecycle coverage yet.
   Uninstall/update/doctor patterns belong to Phase 5, not this phase.
   Source: [`.planning/ROADMAP.md:89-103`](../../ROADMAP.md), [`.planning/REQUIREMENTS.md:15-17`](../../REQUIREMENTS.md)

5. Do **not** use `package.json` prose as the runtime support source of truth.
   The installer code and runtime tests are the real contract.

## Phase-2 File Focus

| File | Expected role in Phase 2 | Pattern to copy |
| --- | --- | --- |
| `bin/install.js` | Primary implementation surface | Additive runtime seams from `antigravity` + `kilo` + `codex` |
| `tests/multi-runtime-select.test.cjs` | Shared interactive-selection regression | Mirror `runtimeMap`/`allRuntimes` pattern |
| `tests/hermes-install.test.cjs` | New Hermes-specific regression file | Per-runtime helper + smoke structure from `antigravity`/`kilo`/`qwen` |
| `tests/runtime-converters.test.cjs` | Optional only | Use only if a Hermes converter/helper is added now |
| `package.json` | Optional metadata touch | Minimal parity update only; do not treat as installer registry |

## Bottom Line

The strongest Phase 2 implementation pattern is:

1. Add Hermes to the same six installer touchpoints every new runtime uses.
2. Model Hermes path semantics first from `antigravity`, then borrow `kilo` only if Hermes needs env-var precedence.
3. Add one dedicated `tests/hermes-install.test.cjs` plus `multi-runtime-select` coverage, and stop there unless Phase 2 truly introduces conversion logic.

# Phase 01: Fork Foundation - Pattern Map

**Mapped:** 2026-04-18
**Files analyzed:** 3
**Analogs found:** 3 / 3

No true product-code analogs exist in `gsd-hermes` yet. Phase 01 is still governance-only, so the mappings below use the strongest planning/artifact-level analogs in `gsd-hermes`, with a nearby local `get-shit-done` checkout used only to name real upstream surfaces that future docs should reference precisely.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `docs/fork-ownership.md` | config | transform | `.planning/research/ARCHITECTURE.md` | role-match |
| `docs/upstream-sync.md` | config | batch | `.planning/phases/01-fork-foundation/01-RESEARCH.md` | role-match |
| `docs/hermes-compatibility.md` | config | transform | `.planning/REQUIREMENTS.md` | role-match |

## Pattern Assignments

### `docs/fork-ownership.md` (config, transform)

**Primary analog:** `.planning/research/ARCHITECTURE.md`

**Supporting analogs:**
- `.planning/phases/01-fork-foundation/01-RESEARCH.md`
- `/home/whiskey/workspace/project/central/v2/get-shit-done/docs/ARCHITECTURE.md`

**Document skeleton pattern** (`.planning/research/ARCHITECTURE.md`, lines 6-45):
```markdown
## Recommended Architecture

### 1. Upstream base layer

Keep the upstream get-shit-done structure as intact as possible.

Responsibilities:

- upstream commands
- workflows
- templates
- core planning model
- existing tests and docs

### 2. Hermes adapter layer

Add a clearly bounded Hermes runtime support surface.

Responsibilities:

- installer flag and menu entry
- Hermes path detection
- skill/command conversion
- Hermes-specific shims for non-equivalent runtime behavior
- Hermes documentation
- Hermes-specific test coverage
```
Use the same layered structure: define the owning layer first, then list concrete responsibilities beneath it.

**Concrete repo-surface naming pattern** (`.planning/phases/01-fork-foundation/01-RESEARCH.md`, lines 172-185):
```text
repo-root/
├── .planning/              # Downstream planning, state, and governance artifacts
├── AGENTS.md               # Downstream runtime-facing contract
├── agents/                 # Imported upstream agent definitions
├── commands/               # Imported upstream command entrypoints
├── get-shit-done/          # Imported upstream workflows, references, templates, CLI libs
├── hooks/                  # Imported upstream hooks
├── sdk/                    # Imported upstream typed query layer
├── tests/                  # Imported upstream tests + Hermes regression coverage later
├── docs/                   # Imported upstream docs + Hermes compatibility docs later
└── bin/install.js          # Primary runtime-selection and install seam
```
Copy this style directly: the ownership doc should name real paths, not abstract “core/runtime/misc” buckets.

**Upstream surface inventory pattern** (`/home/whiskey/workspace/project/central/v2/get-shit-done/docs/ARCHITECTURE.md`, lines 107-151 and 191-201):
```markdown
### Commands (`commands/gsd/*.md`)
User-facing entry points.

### Workflows (`get-shit-done/workflows/*.md`)
Orchestration logic that commands reference.

### Agents (`agents/*.md`)
Specialized agent definitions.

### References (`get-shit-done/references/*.md`)
Shared knowledge documents that workflows and agents `@-reference`.

### Templates (`get-shit-done/templates/`)
Markdown templates for all planning artifacts.
```
Use this inventory style when assigning ownership. It makes later planner/executor decisions mechanical instead of interpretive.

**Boundary heuristic to copy** (`.planning/phases/01-fork-foundation/01-RESEARCH.md`, lines 303-309):
```text
If a change touches workflow behavior broadly, default to "upstream-owned".
If a change adds runtime path/config/conversion logic, default to "adapter seam".
If a change records project policy, compatibility truth, or sync rules, default to "downstream governance".
```
This should appear almost verbatim in the ownership doc.

---

### `docs/upstream-sync.md` (config, batch)

**Primary analog:** `.planning/phases/01-fork-foundation/01-RESEARCH.md`

**Supporting analogs:**
- `.planning/phases/01-fork-foundation/01-VALIDATION.md`
- `.planning/ROADMAP.md`

**Core runbook pattern** (`.planning/phases/01-fork-foundation/01-RESEARCH.md`, lines 188-205):
```bash
# Source: GitHub Docs + git-merge manual
git remote add upstream https://github.com/gsd-build/get-shit-done.git
git fetch upstream

# First import into a planning-only repo will need unrelated histories.
git checkout main
git merge --allow-unrelated-histories upstream/main

# Later syncs should use ordinary merges from upstream/main.
git fetch upstream
git checkout main
git merge upstream/main
```
Preserve this exact split between first import and steady-state sync. Do not collapse them into one generic “sync” section.

**Runbook framing pattern** (`.planning/ROADMAP.md`, lines 28-41):
```markdown
### Phase 1: Fork Foundation
**Goal**: Establish a maintainable `gsd-hermes` fork structure that clearly separates upstream base, Hermes adapter logic, and local enhancements.
**Requirements**: [ARCH-01, ARCH-02]
**Success Criteria**:
  1. Maintainers can identify where Hermes-specific code belongs without inspecting the whole repository.
  2. The fork has a documented upstream remote and sync strategy.
  3. The project docs define GSD-first rules for when adapter changes are preferred over workflow rewrites.
```
Use the same concise format at the top of the runbook: goal, scope, then exact commands.

**Verification/checklist pattern** (`.planning/phases/01-fork-foundation/01-VALIDATION.md`, lines 18-24 and 59-65):
```markdown
| **Quick run command** | `git remote -v && rg -n "upstream|Hermes|ownership|merge upstream/main|external_dirs" docs .planning AGENTS.md 2>/dev/null` |
| **Full suite command** | `git remote -v && rg -n "upstream|Hermes|ownership|merge upstream/main|external_dirs" docs .planning AGENTS.md AGENTS.md .planning/phases/01-fork-foundation/*.md` |

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sync runbook matches actual repo history state | ARCH-02 | First-import feasibility depends on current remotes and branch ancestry | Run `git remote -v`, inspect whether `upstream` exists, and confirm the runbook covers both first import and steady-state merge |
```
The sync doc should end with an audit section that mirrors these checks.

**Decision note pattern** (`.planning/phases/01-fork-foundation/01-RESEARCH.md`, lines 332-340):
```markdown
Recommendation: At minimum, the Phase 1 deliverable should document the exact command and expected `git remote -v` output; whether the plan includes the actual `git remote add upstream …` command can be decided based on how strictly the team wants “establish” to include repo config mutation.
```
Keep this nuance. The doc should distinguish “document the flow” from “mutate repo config now.”

---

### `docs/hermes-compatibility.md` (config, transform)

**Primary analog:** `.planning/REQUIREMENTS.md`

**Supporting analogs:**
- `.planning/PROJECT.md`
- `AGENTS.md`
- `.planning/phases/01-fork-foundation/01-RESEARCH.md`

**Matrix-and-status pattern** (`.planning/REQUIREMENTS.md`, lines 13-39 and 61-79):
```markdown
### Distribution
- [ ] **DIST-01**: Developer can install `gsd-hermes` via npm/npx and choose Hermes as a runtime during setup.

### Hermes Runtime
- [ ] **HERM-01**: Developer can complete a global install that makes `/gsd-*` commands available in Hermes.
- [ ] **HERM-02**: Developer can complete a project-linked install using Hermes `skills.external_dirs` and use `/gsd-*` in that project context.

### Workflow Compatibility
- [ ] **FLOW-01**: Developer can run `/gsd-new-project` in Hermes and generate the standard `.planning/` project artifacts.
- [ ] **FLOW-02**: Developer can use the core GSD lifecycle in Hermes: discuss, plan, execute, verify, progress, settings, and update.
- [ ] **FLOW-03**: When exact Hermes parity is not yet possible, developer receives an intentional shim or documented degraded path instead of silent failure.

## Traceability
| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 1 | Pending |
| ARCH-02 | Phase 1 | Pending |
| DIST-01 | Phase 2 | Pending |
```
Copy the matrix-heavy style directly. The compatibility doc should be a table or checklist, not prose-only narrative.

**Constraint/out-of-scope pattern** (`.planning/PROJECT.md`, lines 54-66):
```markdown
## Constraints

- **Architecture**: Keep a GSD-first structure — Hermes support should live in adapter layers, not broad workflow rewrites.
- **Compatibility**: Preserve as much upstream behavior as possible — users should feel they are using GSD, not a different system.
- **Maintainability**: Upstream sync must stay cheap enough for frequent updates — isolate Hermes patches and prefer shims over deep divergence.
- **Distribution**: The install path must feel native to Hermes — global install is primary, project-linked install is secondary.
- **Runtime Truthfulness**: Do not claim Hermes has a true native local install mode for skills — project-linked mode must be described accurately.
```
Use this wording style for the “rules of interpretation” section in the compatibility doc.

**Runtime-facing mode description pattern** (`AGENTS.md`, lines 42-56):
```markdown
## Recommended Base
- **Upstream base:** `gsd-build/get-shit-done` main branch
- **Fork model:** Long-lived downstream fork with explicit `upstream` sync flow
- **Primary runtime target:** Hermes Agent

## Recommended Technical Stack
### Runtime integration
- **Hermes skills**
- **Hermes `skills.external_dirs`**
- **Hermes context files**
```
Use the same exact mode names in the compatibility matrix so the wording stays aligned with the runtime-facing contract.

**Known-gap / anti-overclaim pattern** (`.planning/phases/01-fork-foundation/01-RESEARCH.md`, lines 235-239):
```markdown
- **Pretend-local Hermes install wording:** Do not describe project-linked mode as a native local install; the project explicitly says that would be untruthful.
- **Assuming steady-state sync before first import:** Do not write a sync runbook that starts at `git merge upstream/main` without acknowledging the planning-only repo state and unrelated-history first import.
```
The compatibility doc should explicitly mark unsupported or not-yet-implemented surfaces with this level of bluntness.

## Shared Patterns

### GSD-First Boundary Rules
**Sources:** `.planning/research/ARCHITECTURE.md` lines 6-45; `.planning/phases/01-fork-foundation/01-RESEARCH.md` lines 303-309  
**Apply to:** All three new docs

```markdown
### 1. Upstream base layer
### 2. Hermes adapter layer
### 3. Distribution lifecycle layer

If a change touches workflow behavior broadly, default to "upstream-owned".
If a change adds runtime path/config/conversion logic, default to "adapter seam".
If a change records project policy, compatibility truth, or sync rules, default to "downstream governance".
```

### Real Path Names, Not Abstract Labels
**Sources:** `.planning/phases/01-fork-foundation/01-RESEARCH.md` lines 172-185; `/home/whiskey/workspace/project/central/v2/get-shit-done/docs/ARCHITECTURE.md` lines 107-151 and 191-201; `/home/whiskey/workspace/project/central/v2/get-shit-done/bin/install.js` lines 137-186  
**Apply to:** `docs/fork-ownership.md`, `docs/hermes-compatibility.md`

```text
agents/
commands/
get-shit-done/
hooks/
sdk/
tests/
docs/
bin/install.js
```

```javascript
function getDirName(runtime) {
  if (runtime === 'codex') return '.codex';
  if (runtime === 'antigravity') return '.agent';
  ...
  return '.claude';
}
```

When the docs name future Hermes patch zones, use these real upstream path names and installer seams.

### Audit-Friendly Exact Strings
**Source:** `.planning/phases/01-fork-foundation/01-VALIDATION.md` lines 22-23 and 41-43  
**Apply to:** All three new docs

```markdown
upstream
merge upstream/main
allow-unrelated-histories
external_dirs
not implemented
known gap
adapter
```

Use these literal strings in headings, tables, or checklist items so the existing `rg`-based validation remains simple and stable.

### AGENTS Alignment Is Generated, Not Freehand
**Source:** `AGENTS.md` lines 1-30, 32-59, and 78-89  
**Apply to:** Any follow-up change to `AGENTS.md`

```markdown
<!-- GSD:project-start source:PROJECT.md -->
...
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
...
<!-- GSD:stack-end -->
```

If Phase 01 changes `AGENTS.md` at all, preserve the generated block markers and update the planning-source docs first.

## No True Code Analogs

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `docs/fork-ownership.md` | config | transform | The repo has no imported upstream source yet; ownership must be documented from planning/research artifacts rather than copied from existing runtime code. |
| `docs/upstream-sync.md` | config | batch | No in-repo sync runbook exists yet; the closest pattern is the phase research plus validation checklist. |
| `docs/hermes-compatibility.md` | config | transform | No shipped Hermes compatibility surface exists yet; the closest pattern is the requirements/constraints matrix and runtime-facing contract. |

## Metadata

**Analog search scope:** `gsd-hermes/.planning/`, `gsd-hermes/AGENTS.md`, nearby local `get-shit-done/docs/`, nearby local `get-shit-done/bin/install.js`  
**Files scanned:** 13  
**Pattern extraction date:** 2026-04-18

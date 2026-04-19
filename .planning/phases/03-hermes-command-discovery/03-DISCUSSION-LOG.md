# Phase 3: Hermes Command Discovery - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-19T05:01:34Z
**Phase:** 03-hermes-command-discovery
**Mode:** `--auto`
**Areas discussed:** Discovery success contract, global skill conversion, project-linked external_dirs mode, config mutation and safety, scope boundary, tests and documentation

---

## Discovery Success Contract

| Option | Description | Selected |
|--------|-------------|----------|
| Filesystem and skill-shape contract | Verify stable `gsd-*` skill directories, valid `SKILL.md` files, and documented manual smoke checks when Hermes lacks stable noninteractive command listing. | ✓ |
| Hermes CLI scraping | Attempt to scrape runtime command listings from Hermes CLI output. | |
| Full workflow execution proof | Treat command discovery as complete only after core workflows run end-to-end. | |

**User's choice:** Auto-selected filesystem and skill-shape contract.
**Notes:** This satisfies HERM-01/HERM-02 without expanding into Phase 4 workflow parity or depending on fragile CLI output.

---

## Global Skill Conversion

| Option | Description | Selected |
|--------|-------------|----------|
| Bounded Hermes skill converter | Reuse existing skill-copy seams but add Hermes-specific ownership and path replacement where needed. | ✓ |
| Keep using Claude helper unchanged | Continue calling `copyCommandsAsClaudeSkills()` directly for Hermes with no runtime-specific guardrails. | |
| Rewrite command generation broadly | Create a new workflow conversion pipeline across command and workflow trees. | |

**User's choice:** Auto-selected bounded Hermes skill converter.
**Notes:** The implementation may wrap or specialize the existing helper, but broad workflow rewrites remain out of scope.

---

## Project-Linked external_dirs Mode

| Option | Description | Selected |
|--------|-------------|----------|
| Project-linked bridge via `.gsd-hermes/skills` | Generate project-owned skills and register their absolute path in Hermes `skills.external_dirs`. | ✓ |
| Native local `.hermes` install claim | Treat project install as equivalent to a native Hermes local runtime. | |
| Global-only forever | Skip project-linked support and require all Hermes use to be global. | |

**User's choice:** Auto-selected project-linked bridge via `.gsd-hermes/skills`.
**Notes:** This preserves the project requirement while staying truthful about Hermes install semantics.

---

## Config Mutation and Safety

| Option | Description | Selected |
|--------|-------------|----------|
| Conservative idempotent external_dirs mutation | Preserve unrelated config and only add/de-dupe the project skills path. | ✓ |
| Rewrite config.yaml from a template | Generate a clean config file owned by GSD. | |
| Manual user configuration only | Print instructions and require users to edit `config.yaml` themselves. | |

**User's choice:** Auto-selected conservative idempotent external_dirs mutation.
**Notes:** The planner should choose the safest YAML implementation and cover repeated installs with tests.

---

## Scope Boundary

| Option | Description | Selected |
|--------|-------------|----------|
| Command discovery only | Support `/gsd-*` discovery in install modes and leave workflow parity/lifecycle for later phases. | ✓ |
| Include core workflow parity | Also prove discuss/plan/execute/update behavior inside Hermes. | |
| Include lifecycle tooling | Also add update, uninstall, doctor, and cleanup behavior. | |

**User's choice:** Auto-selected command discovery only.
**Notes:** Phase 4 owns core workflow parity. Phase 5 owns lifecycle tooling.

---

## Tests and Documentation

| Option | Description | Selected |
|--------|-------------|----------|
| Regression tests plus mode docs | Test global/project-linked discovery artifacts, config mutation, de-duplication, path replacement, and document manual smoke checks. | ✓ |
| Docs-only validation | Rely on user-facing instructions without new automated coverage. | |
| E2E Hermes runtime validation as hard gate | Require a live Hermes runtime command invocation in CI. | |

**User's choice:** Auto-selected regression tests plus mode docs.
**Notes:** Live Hermes validation can be documented as manual smoke unless a stable noninteractive runtime probe is available.

---

## the agent's Discretion

- Exact helper names and file-level decomposition.
- Exact YAML implementation strategy.
- Exact documentation placement.

## Deferred Ideas

- Full core workflow parity is Phase 4.
- Update, uninstall, doctor, and lifecycle cleanup are Phase 5.
- Remaining broad workflow content conversion is Phase 4 or Phase 6 depending on whether it blocks executable parity.

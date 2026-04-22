# Phase 8: Workflow Integration and Migration Safety - Patterns

## Target Files and Closest Analogs

| Target file / area | Role | Closest existing analog | Why it matters |
|---|---|---|---|
| `sdk/src/query/init.ts` | Primary init/runtime-model propagation seam | Itself + Phase 6 init gating work | Existing workflows already consume init payloads; Phase 8 should extend this seam rather than inventing new runtime/model reporting paths |
| `sdk/src/query/init-complex.ts` | Progress/new-project style init propagation | Itself | `init.progress` already surfaces planner/executor model info and is the right place to expand operator visibility |
| `sdk/src/query/runtime-model-contract.ts` | Canonical runtime/model truth | Itself | Phase 8 must propagate these semantics, not recreate them |
| `sdk/src/query/runtime-model-validation.ts` | Canonical validation/routing/result policy | Itself | Best place to keep policy and diagnostics centralized while workflows consume emitted metadata |
| `get-shit-done/workflows/progress.md` | Operator situational awareness surface | Itself | Already exposes profile/progress state and is the natural place for higher runtime-model visibility |
| `get-shit-done/workflows/settings.md` | Runtime-awareness UX surface | Itself | Already contains non-Claude profile/runtime guidance and is the best analog for operator-facing migration messaging |
| `get-shit-done/workflows/plan-phase.md` | Planner-side semantic propagation | `execute-phase.md` | Needs to consume the same semantics as execute-phase instead of staying token-oriented |
| `get-shit-done/workflows/quick.md` | Combined planner/executor flow | Itself | High-value path where model/runtime semantics should match main workflows |
| `get-shit-done/workflows/verify-work.md` | Verification/gap closure surface | Itself | Must not drift from the same direct-binding vs cross-AI semantics |
| `docs/CONFIGURATION.md` | Canonical operator truth | Itself | Best source to centralize the final operator-facing contract and reduce future drift |
| `docs/USER-GUIDE.md` | Narrative/how-to guidance | Itself | Should reference canonical semantics without duplicating full config reference tables |
| `docs/FEATURES.md` / `docs/COMMANDS.md` | Product/command-facing summaries | Itself | Need alignment so public surface statements do not drift from actual semantics |
| `docs/fork-ownership.md` | Fork seam governance | Itself | Phase 8 must remain broad in scope but still upstream-friendly in architecture |

## Established Code Patterns

### Shared-helper-first pattern
- Phase 6 and Phase 7 both introduced or extended a shared helper/policy layer first, then threaded existing seams through it.
- Phase 8 should follow the same model: extend canonical init/query serialization once, then propagate through workflows/docs/tests.

### Init-boundary surfacing pattern
- The repo already uses init/query payloads as the main boundary between canonical SDK semantics and workflow markdown.
- Existing workflows expect init-provided fields such as `planner_model`, `executor_model`, `checker_model`, etc.
- Phase 8 should add metadata alongside those fields instead of replacing them.

### Progress-as-operator-awareness pattern
- `progress.md` is already the main situational-awareness surface.
- `init.progress` already returns planner/executor model information.
- If runtime/model state becomes more visible, progress is the right place to surface it.

### Settings-as-runtime-awareness pattern
- `settings.md` already explains non-Claude/runtime-aware profile behavior.
- This is the strongest existing analog for operator-facing explanations of when to use explicit binding, `inherit`, runtime-default omission, or explicit cross-AI fallback.

### Canonical-docs pattern
- `docs/CONFIGURATION.md` is the best existing candidate for canonical runtime-model semantics.
- `docs/USER-GUIDE.md` already intentionally avoids duplicating some config/reference content to reduce drift.
- Phase 8 should reinforce this pattern rather than reintroducing duplicate truth sources.

### Adapter-seam pattern
- `docs/fork-ownership.md` explicitly says Hermes-specific behavior should live in the Hermes adapter seam.
- Phase 8 should be broad in propagation, but still keep core semantics centralized in adapter/query/contract layers rather than spreading runtime-specific logic across workflows.

## Integration Points

### Query/init propagation
- `sdk/src/query/init.ts`
- `sdk/src/query/init-complex.ts`
- `sdk/src/query/config-query.ts`
- Any workflow entry point that currently receives only token-oriented model fields

### Workflow visibility and consistency
- `get-shit-done/workflows/progress.md`
- `get-shit-done/workflows/settings.md`
- `get-shit-done/workflows/plan-phase.md`
- `get-shit-done/workflows/quick.md`
- `get-shit-done/workflows/verify-work.md`
- `get-shit-done/workflows/execute-phase.md`

### Documentation alignment
- Canonical: `docs/CONFIGURATION.md`
- Narrative: `docs/USER-GUIDE.md`
- Public summaries: `docs/FEATURES.md`, `docs/COMMANDS.md`
- Governance: `docs/fork-ownership.md`
- Translation drift checks where material

### Regression and migration safety
- `sdk/src/query/init.test.ts`
- `sdk/src/query/config-query.test.ts`
- `tests/runtime-model-parity.test.cjs`
- `tests/cross-ai-execution.test.cjs`
- `tests/bug-1829-inherit-model-profile.test.cjs`
- `tests/bug-2506-settings-profile-nonclaude-warning.test.cjs`
- `tests/config-schema-docs-parity.test.cjs`
- `tests/verify-health.test.cjs`

## Pattern Guidance for Planning

- Prefer additive payload expansion over breaking init payload changes.
- Keep runtime/provider decision logic in canonical query/helper code, not in workflow shell logic.
- Use `progress` for concise operator visibility and `settings` for explanatory runtime-aware UX.
- Use `docs/CONFIGURATION.md` as the canonical operator contract; update `USER-GUIDE` only for narrative guidance and upgrade workflows.
- Broad docs sync is allowed in this phase, but avoid reintroducing duplicate canonical tables in many files.
- Migration help should be warning/guidance based, not automatic config mutation.
- Preserve Hermes direct mixed-provider binding as a first-class direct path; do not let broad rollout accidentally flatten everything into cross-AI fallback.

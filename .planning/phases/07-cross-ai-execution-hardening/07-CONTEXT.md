# Phase 7: Cross-AI Execution Hardening - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Turn `cross_ai_execution` into the validated explicit path for cross-provider execution when direct runtime binding cannot be honored. This phase should harden external command input/output expectations, failure recovery behavior, activation/routing rules, and ownership boundaries for commits and shared state updates, without absorbing the broader workflow-wide propagation work reserved for later phases.

</domain>

<decisions>
## Implementation Decisions

### External Command Contract
- **D-01:** `cross_ai_command` should produce a minimum acceptable SUMMARY contract rather than requiring the full internal summary shape.
- **D-02:** A successful external result must include at least: a clear completion summary, what changed, verification results, and any failures/deviations if present.
- **D-03:** Non-empty output alone is not sufficient for success.

### Failure and Recovery Behavior
- **D-04:** Cross-AI execution should use an auto-recovery strategy where some failures can trigger automatic retry or automatic fallback.
- **D-05:** User intervention should happen only after retries still fail or risk meaningfully increases.
- **D-06:** Timeout, non-zero exit, malformed output, and partial-edit scenarios all need explicit recovery rules.

### Activation and Routing Rules
- **D-07:** CLI flags have highest priority.
- **D-08:** Config has the next priority and may proactively influence routing decisions.
- **D-09:** Plan frontmatter has lower priority than CLI and config in this phase.
- **D-10:** Routing behavior should be explicit and deterministic, not inferred from vague heuristics.

### State and Commit Ownership
- **D-11:** Orchestrator owns shared project state and planning artifacts such as `STATE.md`, `ROADMAP.md`, and phase progress updates.
- **D-12:** External AI may generate execution output and code changes, but orchestrator remains the source of truth for shared state transitions.
- **D-13:** Commit ownership should favor orchestrator-controlled finalization over external-first autonomy.

### Claude's Discretion
- Exact minimum SUMMARY schema, provided it contains the locked required sections.
- Exact retry budget and fallback thresholds, provided they remain conservative and observable.
- Exact command/result validation helper placement, provided routing and ownership rules stay consistent.

</decisions>

<specifics>
## Specific Ideas

- The user chose a minimum viable but still structured external summary contract.
- The user prefers automatic recovery over constant human prompting.
- The user wants config to play an active routing role, not just a passive capability gate.
- The user wants orchestrator-owned state consistency even when external AI performs execution work.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase and milestone requirements
- `.planning/ROADMAP.md` — Phase 7 goal, success criteria, dependency on Phase 6, and current milestone routing expectations.
- `.planning/REQUIREMENTS.md` — Phase 7 requirements `XAI-01`, `XAI-02`, `XAI-03`, `XAI-04`.
- `.planning/PROJECT.md` — milestone-level product intent for cross-provider execution.

### Prior phase outputs
- `.planning/phases/06-strict-binding-enforcement/06-CONTEXT.md` — locked validation and runtime-boundary decisions that Phase 7 must respect.
- `.planning/phases/06-strict-binding-enforcement/06-01-SUMMARY.md` — init-layer fail-fast validation now exists.
- `.planning/phases/06-strict-binding-enforcement/06-02-SUMMARY.md` — `phase-runner` defense-in-depth and validated binding threading are already in place.

### Cross-AI implementation surface
- `get-shit-done/workflows/execute-phase.md` — existing cross-AI delegation step and current behavior assumptions.
- `sdk/src/query/config-mutation.ts` — config surface for `workflow.cross_ai_execution`, `workflow.cross_ai_command`, and `workflow.cross_ai_timeout`.
- `sdk/src/phase-runner.ts` — orchestration/runtime execution seam if SDK-side execution ownership changes are needed.
- `docs/CONFIGURATION.md` — documented semantics for cross-AI settings.
- `tests/cross-ai-execution.test.cjs` — current coverage baseline and scope guard.

[If no external specs: "No external specs — requirements fully captured in decisions above"]
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `execute-phase.md` already has a cross-AI delegation step, prompt piping model, and rough success/failure branching.
- `sdk/src/query/config-mutation.ts` already exposes the needed config keys.
- `tests/cross-ai-execution.test.cjs` already provides a focused regression surface for this capability.

### Established Patterns
- The system now has explicit runtime validation before execution; Phase 7 should build on that rather than bypass it.
- Shared planning/state files are already sensitive and should stay orchestrator-owned.
- `cross_ai_execution` is already modeled as an explicit path, not implicit fallback.

### Integration Points
- The external command contract and recovery logic likely center on `execute-phase.md` and any SDK/runtime helpers it depends on.
- Ownership rules must be consistent with existing orchestrator updates for `STATE.md`, `ROADMAP.md`, and summary-driven progress tracking.
- Routing logic must remain deterministic across CLI flags, config, and plan frontmatter.

</code_context>

<deferred>
## Deferred Ideas

- Broad workflow-wide propagation and docs cleanup beyond the cross-AI surface — later phase.
- Full migration/documentation harmonization across all runtime modes — later phase.
- Larger execution backend redesign not required for cross-AI hardening itself.

</deferred>

---

*Phase: 07-cross-ai-execution-hardening*
*Context gathered: 2026-04-22*

/**
 * Shared strict runtime/model binding validation for workflow entry points.
 *
 * Phase 6 enforces the Phase 5 runtime-model contract only when planning or
 * execution is about to start. Config editing remains permissive.
 */

import type { GSDConfig } from '../config.js';
import { GSDError, ErrorClassification } from '../errors.js';
import {
  evaluateRuntimeModelCompatibility,
  resolveAgentBinding,
  type BindingKind,
  type BindingSource,
  type RejectionReason,
  type RuntimeModelResolution,
} from './runtime-model-contract.js';

export interface BindingValidationIssue {
  agent: string;
  runtime: RuntimeModelResolution['runtime'];
  bindingKind: BindingKind;
  source: BindingSource;
  configuredModel: string | null;
  resolvedModel: string | null;
  rejectionReason: RejectionReason;
  reason: string;
  suggestedFix: string;
  crossAiExecutionSupported: boolean;
  crossAiExecutionConfigured: boolean;
  crossAiExecutionRecommended: boolean;
  crossAiExecutionSuggestion: string | null;
  availableAlternative: 'cross_ai_execution' | null;
}

export interface BindingValidationResult {
  ok: boolean;
  agent: string;
  runtime: RuntimeModelResolution['runtime'];
  bindingKind: BindingKind;
  source: BindingSource;
  configuredModel: string | null;
  resolvedModel: string | null;
  issue: BindingValidationIssue | null;
  binding: RuntimeModelResolution;
}

export interface BindingValidationSummary {
  ok: boolean;
  runtime: RuntimeModelResolution['runtime'];
  agents: string[];
  results: BindingValidationResult[];
  issues: BindingValidationIssue[];
}

function buildSuggestedFix(binding: RuntimeModelResolution): string {
  if (binding.kind === 'unsupported') {
    return binding.suggestedFix;
  }

  if (binding.bindingKind === 'profile') {
    return 'Set resolve_model_ids to "omit" to use the runtime default, switch model_profile to "inherit", or configure a runtime-compatible model_overrides entry for this agent.';
  }

  return 'Replace this explicit model_overrides entry with a runtime-compatible model, or remove it to fall back to model_profile "inherit" or resolve_model_ids "omit".';
}

function buildCrossAiSuggestion(binding: RuntimeModelResolution, recommended: boolean): string | null {
  const supported = binding.runtimeCapability.supportsCrossAiExecution;
  if (!supported) return null;

  const configuredText = binding.crossAiExecutionConfigured
    ? 'workflow.cross_ai_execution is already enabled, but Phase 6 will not auto-route into it.'
    : 'workflow.cross_ai_execution is currently disabled.';

  if (!recommended) {
    return `cross_ai_execution is available for this runtime; ${configuredText}`;
  }

  return `Use workflow.cross_ai_execution as an explicit cross-provider path if you want this binding executed outside the active runtime; ${configuredText}`;
}

function buildIssue(binding: RuntimeModelResolution, rejectionReason: RejectionReason, reason: string): BindingValidationIssue {
  const crossAiExecutionSupported = binding.runtimeCapability.supportsCrossAiExecution;
  const crossAiExecutionRecommended = rejectionReason === 'runtime-model-unsupported' && crossAiExecutionSupported;

  return {
    agent: binding.agent,
    runtime: binding.runtime,
    bindingKind: binding.bindingKind,
    source: binding.source,
    configuredModel: binding.configuredModel,
    resolvedModel: binding.resolvedModel,
    rejectionReason,
    reason,
    suggestedFix: buildSuggestedFix(binding),
    crossAiExecutionSupported,
    crossAiExecutionConfigured: binding.crossAiExecutionConfigured,
    crossAiExecutionRecommended,
    crossAiExecutionSuggestion: buildCrossAiSuggestion(binding, crossAiExecutionRecommended),
    availableAlternative: crossAiExecutionRecommended ? 'cross_ai_execution' : null,
  };
}

export function validateResolvedAgentBinding(binding: RuntimeModelResolution): BindingValidationResult {
  if (binding.kind === 'unsupported') {
    return {
      ok: false,
      agent: binding.agent,
      runtime: binding.runtime,
      bindingKind: binding.bindingKind,
      source: binding.source,
      configuredModel: binding.configuredModel,
      resolvedModel: binding.resolvedModel,
      issue: buildIssue(binding, binding.rejectionReason, binding.message),
      binding,
    };
  }

  if (binding.bindingKind === 'inherit' || binding.bindingKind === 'runtime-default') {
    return {
      ok: true,
      agent: binding.agent,
      runtime: binding.runtime,
      bindingKind: binding.bindingKind,
      source: binding.source,
      configuredModel: binding.configuredModel,
      resolvedModel: binding.resolvedModel,
      issue: null,
      binding,
    };
  }

  const compatibility = evaluateRuntimeModelCompatibility(binding.runtime, binding.resolvedModel);
  if (compatibility.supported) {
    return {
      ok: true,
      agent: binding.agent,
      runtime: binding.runtime,
      bindingKind: binding.bindingKind,
      source: binding.source,
      configuredModel: binding.configuredModel,
      resolvedModel: binding.resolvedModel,
      issue: null,
      binding,
    };
  }

  return {
    ok: false,
    agent: binding.agent,
    runtime: binding.runtime,
    bindingKind: binding.bindingKind,
    source: binding.source,
    configuredModel: binding.configuredModel,
    resolvedModel: binding.resolvedModel,
    issue: buildIssue(binding, 'runtime-model-unsupported', compatibility.reason ?? 'active runtime does not support this explicit model binding'),
    binding,
  };
}

export function validateAgentBinding(config: GSDConfig | Record<string, unknown>, agent: string): BindingValidationResult {
  return validateResolvedAgentBinding(resolveAgentBinding(config, agent));
}

export function validateAgentBindings(config: GSDConfig | Record<string, unknown>, agents: string[]): BindingValidationSummary {
  const results = agents.map((agent) => validateAgentBinding(config, agent));
  const issues = results.flatMap((result) => result.issue ? [result.issue] : []);
  const runtime = results[0]?.runtime ?? resolveAgentBinding(config, agents[0] ?? 'gsd-planner').runtime;

  return {
    ok: issues.length === 0,
    runtime,
    agents,
    results,
    issues,
  };
}

export function formatBindingValidationError(summary: BindingValidationSummary, phaseLabel = 'workflow execution'): string {
  const lines = [`Unsupported runtime/model binding before ${phaseLabel}.`, ''];

  for (const [index, issue] of summary.issues.entries()) {
    if (index > 0) lines.push('');
    lines.push(`Agent: ${issue.agent}`);
    lines.push(`Runtime: ${issue.runtime}`);
    lines.push(`Binding: ${issue.bindingKind} (${issue.source})`);
    lines.push(`Configured model: ${issue.configuredModel ?? '(none)'}`);
    lines.push(`Resolved model: ${issue.resolvedModel ?? '(runtime default / omitted)'}`);
    lines.push(`Reason: ${issue.reason}`);
    lines.push(`Suggested fix: ${issue.suggestedFix}`);
    lines.push(`cross_ai_execution supported: ${issue.crossAiExecutionSupported ? 'yes' : 'no'}`);
    lines.push(`cross_ai_execution configured: ${issue.crossAiExecutionConfigured ? 'yes' : 'no'}`);
    lines.push(`cross_ai_execution recommendation: ${issue.crossAiExecutionRecommended ? 'explicit alternative available' : 'not recommended'}`);
    if (issue.crossAiExecutionSuggestion) {
      lines.push(`Cross-AI suggestion: ${issue.crossAiExecutionSuggestion}`);
    }
  }

  return lines.join('\n');
}

export function assertAgentBindingsSupported(
  config: GSDConfig | Record<string, unknown>,
  agents: string[],
  phaseLabel = 'workflow execution',
): void {
  const summary = validateAgentBindings(config, agents);
  if (summary.ok) return;
  throw new GSDError(formatBindingValidationError(summary, phaseLabel), ErrorClassification.Validation);
}

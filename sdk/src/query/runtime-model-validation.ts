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
  runtimeBindingChannelForRuntime,
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

export interface RuntimeBindingChannelValidationOptions {
  hermesDelegateModelChannelAvailable?: boolean;
}

export interface BindingValidationSummary {
  ok: boolean;
  runtime: RuntimeModelResolution['runtime'];
  agents: string[];
  results: BindingValidationResult[];
  issues: BindingValidationIssue[];
}

export type CrossAiRoutingDecision = 'disabled' | 'forced' | 'required' | 'direct';

export interface CrossAiRoutingResolution {
  decision: CrossAiRoutingDecision;
  source: 'cli' | 'config' | 'frontmatter' | 'direct-binding';
  shouldUseCrossAi: boolean;
  crossAiRequired: boolean;
  directRuntimeBindingValid: boolean;
  reason: string;
}

export interface CrossAiSummaryValidationResult {
  valid: boolean;
  partial: boolean;
  missingSections: string[];
}

export type CrossAiExecutionFailureKind = 'missing-command' | 'timeout' | 'non-zero-exit' | 'malformed-summary' | 'partial-execution';

export interface CrossAiExecutionResult {
  ok: boolean;
  failureKind: CrossAiExecutionFailureKind | null;
  reason: string;
  routing: CrossAiRoutingResolution;
  summaryValidation: CrossAiSummaryValidationResult | null;
}

function hasSection(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

function normalizeCrossAiCommand(command: string | null | undefined): string {
  return typeof command === 'string' ? command.trim() : '';
}

export function resolveCrossAiRouting(options: {
  cliForce?: boolean;
  cliDisabled?: boolean;
  configCrossAiExecution?: boolean | null;
  planFrontmatterCrossAi?: boolean | null;
  directRuntimeBindingValid?: boolean;
}): CrossAiRoutingResolution {
  const {
    cliForce = false,
    cliDisabled = false,
    configCrossAiExecution,
    planFrontmatterCrossAi,
    directRuntimeBindingValid = false,
  } = options;

  if (cliDisabled) {
    return {
      decision: 'disabled',
      source: 'cli',
      shouldUseCrossAi: false,
      crossAiRequired: false,
      directRuntimeBindingValid,
      reason: 'Cross-AI execution disabled by CLI flag --no-cross-ai.',
    };
  }

  if (cliForce) {
    return {
      decision: 'forced',
      source: 'cli',
      shouldUseCrossAi: true,
      crossAiRequired: true,
      directRuntimeBindingValid,
      reason: 'Cross-AI execution forced by CLI flag --cross-ai.',
    };
  }

  if (directRuntimeBindingValid) {
    return {
      decision: 'direct',
      source: 'direct-binding',
      shouldUseCrossAi: false,
      crossAiRequired: false,
      directRuntimeBindingValid,
      reason: 'Direct runtime binding is valid, so cross-AI execution is not required.',
    };
  }

  if (typeof configCrossAiExecution === 'boolean') {
    return configCrossAiExecution
      ? {
          decision: 'required',
          source: 'config',
          shouldUseCrossAi: true,
          crossAiRequired: true,
          directRuntimeBindingValid,
          reason: 'Cross-AI execution required by workflow.cross_ai_execution config.',
        }
      : {
          decision: 'disabled',
          source: 'config',
          shouldUseCrossAi: false,
          crossAiRequired: false,
          directRuntimeBindingValid,
          reason: 'Cross-AI execution disabled by workflow.cross_ai_execution config.',
        };
  }

  if (planFrontmatterCrossAi) {
    return {
      decision: 'required',
      source: 'frontmatter',
      shouldUseCrossAi: true,
      crossAiRequired: true,
      directRuntimeBindingValid,
      reason: 'Cross-AI execution required by plan frontmatter.',
    };
  }

  return {
    decision: 'disabled',
    source: 'frontmatter',
    shouldUseCrossAi: false,
    crossAiRequired: false,
    directRuntimeBindingValid,
    reason: 'Cross-AI execution not requested by config or plan frontmatter.',
  };
}

export function validateExternalSummaryContract(summaryText: string | null | undefined): CrossAiSummaryValidationResult {
  const text = typeof summaryText === 'string' ? summaryText.trim() : '';
  const missingSections: string[] = [];

  if (!text) {
    return {
      valid: false,
      partial: false,
      missingSections: ['completion summary', 'what changed', 'verification results'],
    };
  }

  const hasCompletionSummary = hasSection(text, /^##?\s*(?:summary|outcome|completion|result)\b/im);
  const hasWhatChanged = hasSection(text, /^##?\s*(?:what changed|changes|files changed|modified files)\b/im);
  const hasVerification = hasSection(text, /^##?\s*(?:verification|validation|tests?|checks?)\b/im);
  const hasDeviationSection = hasSection(text, /^##?\s*(?:issues encountered|deviations|failures|problems|risks|scope\s*\/\s*deviations)\b/im);
  const indicatesPartialExecution = /(partial(?:ly)?\s+execut|incomplete|not\s+completed|left\s+unfinished|remaining work|deviation|failed|failure|skipped verification|verification not run)/i.test(text);

  if (!hasCompletionSummary) missingSections.push('completion summary');
  if (!hasWhatChanged) missingSections.push('what changed');
  if (!hasVerification) missingSections.push('verification results');
  if (indicatesPartialExecution && !hasDeviationSection) missingSections.push('failure/deviation section');

  return {
    valid: missingSections.length === 0,
    partial: indicatesPartialExecution,
    missingSections,
  };
}

export function evaluateCrossAiExecutionResult(options: {
  routing: CrossAiRoutingResolution;
  crossAiCommand?: string | null;
  exitCode: number;
  timedOut?: boolean;
  summaryText?: string | null;
}): CrossAiExecutionResult {
  const { routing, crossAiCommand, exitCode, timedOut = false, summaryText } = options;

  if (routing.shouldUseCrossAi && normalizeCrossAiCommand(crossAiCommand) === '') {
    return {
      ok: false,
      failureKind: 'missing-command',
      reason: 'Cross-AI routing requires workflow.cross_ai_command, but no command is configured.',
      routing,
      summaryValidation: null,
    };
  }

  if (!routing.shouldUseCrossAi) {
    return {
      ok: true,
      failureKind: null,
      reason: routing.reason,
      routing,
      summaryValidation: null,
    };
  }

  if (timedOut) {
    return {
      ok: false,
      failureKind: 'timeout',
      reason: 'Cross-AI command timed out before producing an acceptable result.',
      routing,
      summaryValidation: null,
    };
  }

  if (exitCode !== 0) {
    return {
      ok: false,
      failureKind: 'non-zero-exit',
      reason: `Cross-AI command exited with status ${exitCode}.`,
      routing,
      summaryValidation: null,
    };
  }

  const summaryValidation = validateExternalSummaryContract(summaryText);
  if (!summaryValidation.valid) {
    return {
      ok: false,
      failureKind: 'malformed-summary',
      reason: `Cross-AI output did not satisfy the minimum SUMMARY contract. Missing: ${summaryValidation.missingSections.join(', ')}.`,
      routing,
      summaryValidation,
    };
  }

  if (summaryValidation.partial) {
    return {
      ok: false,
      failureKind: 'partial-execution',
      reason: 'Cross-AI output reported a partial or incomplete execution result.',
      routing,
      summaryValidation,
    };
  }

  return {
    ok: true,
    failureKind: null,
    reason: 'Cross-AI execution produced an acceptable SUMMARY contract.',
    routing,
    summaryValidation,
  };
}

function buildSuggestedFix(binding: RuntimeModelResolution, rejectionReason?: RejectionReason): string {
  if (rejectionReason === 'missing-runtime-binding-channel' && binding.runtime === 'hermes') {
    return 'Upgrade or restart Hermes Agent with delegate_task.model / tasks[].model support, set the override to inherit, remove the explicit model_overrides entry, or use explicit cross-AI execution.';
  }

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
    suggestedFix: buildSuggestedFix(binding, rejectionReason),
    crossAiExecutionSupported,
    crossAiExecutionConfigured: binding.crossAiExecutionConfigured,
    crossAiExecutionRecommended,
    crossAiExecutionSuggestion: buildCrossAiSuggestion(binding, crossAiExecutionRecommended),
    availableAlternative: crossAiExecutionRecommended ? 'cross_ai_execution' : null,
  };
}

export function validateResolvedAgentBinding(
  binding: RuntimeModelResolution,
  options: RuntimeBindingChannelValidationOptions = {},
): BindingValidationResult {
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

  if (binding.runtime === 'hermes' && binding.bindingKind === 'explicit') {
    const channel = runtimeBindingChannelForRuntime(binding.runtime, options);
    if (!channel.available) {
      return {
        ok: false,
        agent: binding.agent,
        runtime: binding.runtime,
        bindingKind: binding.bindingKind,
        source: binding.source,
        configuredModel: binding.configuredModel,
        resolvedModel: binding.resolvedModel,
        issue: buildIssue(
          binding,
          'missing-runtime-binding-channel',
          channel.reason ?? 'Hermes delegate_task.model / tasks[].model binding channel is unavailable',
        ),
        binding,
      };
    }
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

export function validateAgentBinding(
  config: GSDConfig | Record<string, unknown>,
  agent: string,
  options: RuntimeBindingChannelValidationOptions = {},
): BindingValidationResult {
  return validateResolvedAgentBinding(resolveAgentBinding(config, agent), options);
}

export function validateAgentBindings(
  config: GSDConfig | Record<string, unknown>,
  agents: string[],
  options: RuntimeBindingChannelValidationOptions = {},
): BindingValidationSummary {
  const results = agents.map((agent) => validateAgentBinding(config, agent, options));
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
  options: RuntimeBindingChannelValidationOptions = {},
): void {
  const summary = validateAgentBindings(config, agents, options);
  if (summary.ok) return;
  throw new GSDError(formatBindingValidationError(summary, phaseLabel), ErrorClassification.Validation);
}

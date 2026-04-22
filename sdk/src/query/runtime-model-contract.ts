/**
 * Canonical runtime/model contract for SDK query and init surfaces.
 *
 * Phase 5 keeps SDK as the source of truth for runtime-model semantics.
 * The contract preserves explicit model binding, inherit binding, and
 * runtime-default binding as distinct outcomes instead of flattening
 * everything into ad hoc strings.
 */

import type { GSDConfig, ModelOverridesConfig, ResolveModelIdsSetting } from '../config.js';
import { detectRuntime, SUPPORTED_RUNTIMES, type Runtime } from './helpers.js';

export const MODEL_PROFILES: Record<string, Record<'quality' | 'balanced' | 'budget' | 'adaptive', string>> = {
  'gsd-planner': { quality: 'opus', balanced: 'opus', budget: 'sonnet', adaptive: 'opus' },
  'gsd-roadmapper': { quality: 'opus', balanced: 'sonnet', budget: 'sonnet', adaptive: 'sonnet' },
  'gsd-executor': { quality: 'opus', balanced: 'sonnet', budget: 'sonnet', adaptive: 'sonnet' },
  'gsd-phase-researcher': { quality: 'opus', balanced: 'sonnet', budget: 'haiku', adaptive: 'sonnet' },
  'gsd-project-researcher': { quality: 'opus', balanced: 'sonnet', budget: 'haiku', adaptive: 'sonnet' },
  'gsd-research-synthesizer': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku', adaptive: 'haiku' },
  'gsd-debugger': { quality: 'opus', balanced: 'sonnet', budget: 'sonnet', adaptive: 'opus' },
  'gsd-codebase-mapper': { quality: 'sonnet', balanced: 'haiku', budget: 'haiku', adaptive: 'haiku' },
  'gsd-verifier': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku', adaptive: 'sonnet' },
  'gsd-plan-checker': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku', adaptive: 'haiku' },
  'gsd-integration-checker': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku', adaptive: 'haiku' },
  'gsd-nyquist-auditor': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku', adaptive: 'haiku' },
  'gsd-pattern-mapper': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku', adaptive: 'haiku' },
  'gsd-ui-researcher': { quality: 'opus', balanced: 'sonnet', budget: 'haiku', adaptive: 'sonnet' },
  'gsd-ui-checker': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku', adaptive: 'haiku' },
  'gsd-ui-auditor': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku', adaptive: 'haiku' },
  'gsd-doc-writer': { quality: 'opus', balanced: 'sonnet', budget: 'haiku', adaptive: 'sonnet' },
  'gsd-doc-verifier': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku', adaptive: 'haiku' },
};

export const PROFILE_MODEL_KEYS = ['quality', 'balanced', 'budget', 'adaptive'] as const;
export type ProfileModelKey = (typeof PROFILE_MODEL_KEYS)[number];
export const VALID_PROFILES: ProfileModelKey[] = [...PROFILE_MODEL_KEYS];

// Phase 5 migration policy: keep adaptive as a valid tiered profile input and
// also accept inherit as a first-class compatibility profile input.
export const ACCEPTED_MODEL_PROFILES = [...VALID_PROFILES, 'inherit'] as const;
export type AcceptedModelProfile = (typeof ACCEPTED_MODEL_PROFILES)[number];

export type BindingKind = 'explicit' | 'profile' | 'inherit' | 'runtime-default';
export type BindingSource = 'override' | 'profile' | 'inherit-profile' | 'resolve-model-omit';
export type RejectionReason = 'unknown-agent' | 'missing-contract-coverage' | 'runtime-model-unsupported';
export type ModelFamily = 'anthropic' | 'openai' | 'google' | 'unknown';

export interface RuntimeCapability {
  runtime: Runtime;
  supportsExplicitModel: boolean;
  supportsInheritBinding: boolean;
  supportsRuntimeDefaultBinding: boolean;
  supportsCrossAiExecution: boolean;
  explicitModelFamilies: readonly ModelFamily[];
}

const OPENAI_COMPATIBLE_RUNTIMES: Runtime[] = ['codex', 'copilot', 'cursor', 'windsurf', 'cline'];
const GOOGLE_COMPATIBLE_RUNTIMES: Runtime[] = ['gemini'];

function explicitModelFamiliesForRuntime(runtime: Runtime): readonly ModelFamily[] {
  if (runtime === 'claude') return ['anthropic'];
  if (OPENAI_COMPATIBLE_RUNTIMES.includes(runtime)) return ['openai'];
  if (GOOGLE_COMPATIBLE_RUNTIMES.includes(runtime)) return ['google'];
  return ['openai', 'google', 'unknown'];
}

export const RUNTIME_CAPABILITIES: Record<Runtime, RuntimeCapability> = Object.fromEntries(
  SUPPORTED_RUNTIMES.map((runtime) => [runtime, {
    runtime,
    supportsExplicitModel: true,
    supportsInheritBinding: true,
    supportsRuntimeDefaultBinding: true,
    supportsCrossAiExecution: true,
    explicitModelFamilies: explicitModelFamiliesForRuntime(runtime),
  }]),
) as Record<Runtime, RuntimeCapability>;

export interface RuntimeModelDiagnostic {
  agent: string;
  runtime: Runtime;
  profile: AcceptedModelProfile;
  bindingKind: BindingKind;
  source: BindingSource;
  configuredModel: string | null;
  resolvedModel: string | null;
  suggestedFix: string;
}

export interface ResolvedAgentBinding extends RuntimeModelDiagnostic {
  kind: 'resolved';
  knownAgent: true;
  modelToken: string | null;
  resolveModelIds: ResolveModelIdsSetting | undefined;
  runtimeCapability: RuntimeCapability;
  crossAiExecutionConfigured: boolean;
}

export interface UnsupportedAgentBinding extends RuntimeModelDiagnostic {
  kind: 'unsupported';
  knownAgent: false;
  rejectionReason: RejectionReason;
  message: string;
  modelToken: null;
  resolveModelIds: ResolveModelIdsSetting | undefined;
  runtimeCapability: RuntimeCapability;
  crossAiExecutionConfigured: boolean;
}

export type RuntimeModelResolution = ResolvedAgentBinding | UnsupportedAgentBinding;

export const MODEL_ALIAS_MAP: Record<string, string> = {
  opus: 'claude-opus-4-6',
  sonnet: 'claude-sonnet-4-6',
  haiku: 'claude-haiku-4-5',
};

function isAnthropicModel(model: string): boolean {
  return /^(?:claude(?:-|$)|anthropic\/claude-|opus$|sonnet$|haiku$)/i.test(model);
}

function isOpenAiModel(model: string): boolean {
  return /^(?:openai\/|gpt-|o[134](?:$|[-.])|o3(?:$|[-.])|o4(?:$|[-.]))/i.test(model);
}

function isGoogleModel(model: string): boolean {
  return /^(?:gemini(?:$|[-.])|google\/)/i.test(model);
}

export function detectModelFamily(model: string | null | undefined): ModelFamily {
  if (!model) return 'unknown';
  const normalized = model.trim();
  if (normalized === '') return 'unknown';
  if (isAnthropicModel(normalized)) return 'anthropic';
  if (isOpenAiModel(normalized)) return 'openai';
  if (isGoogleModel(normalized)) return 'google';
  return 'unknown';
}

export interface RuntimeCompatibilityResult {
  supported: boolean;
  runtime: Runtime;
  model: string | null;
  family: ModelFamily;
  reason: string | null;
}

export function evaluateRuntimeModelCompatibility(runtime: Runtime, model: string | null): RuntimeCompatibilityResult {
  const family = detectModelFamily(model);
  const runtimeCapability = RUNTIME_CAPABILITIES[runtime];

  if (!model) {
    return { supported: true, runtime, model, family, reason: null };
  }

  if (runtimeCapability.explicitModelFamilies.includes(family)) {
    return { supported: true, runtime, model, family, reason: null };
  }

  if (runtime !== 'claude' && family === 'anthropic') {
    return {
      supported: false,
      runtime,
      model,
      family,
      reason: `runtime '${runtime}' does not support Anthropic model bindings`,
    };
  }

  if (runtime === 'claude') {
    return {
      supported: false,
      runtime,
      model,
      family,
      reason: `runtime '${runtime}' only supports Anthropic model bindings`,
    };
  }

  return { supported: true, runtime, model, family, reason: null };
}

function normalizeString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function normalizeOverrides(value: unknown): ModelOverridesConfig | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const normalized: ModelOverridesConfig = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const model = normalizeString(raw);
    if (model) normalized[key] = model;
  }
  return normalized;
}

export function normalizeModelProfile(profile: unknown): AcceptedModelProfile {
  const normalized = typeof profile === 'string' ? profile.toLowerCase().trim() : '';
  return (ACCEPTED_MODEL_PROFILES as readonly string[]).includes(normalized)
    ? normalized as AcceptedModelProfile
    : 'balanced';
}

export function isAcceptedModelProfile(profile: string): profile is AcceptedModelProfile {
  return (ACCEPTED_MODEL_PROFILES as readonly string[]).includes(profile);
}

export function getAgentToModelMapForProfile(profileInput: string): Record<string, string> {
  const profile = normalizeModelProfile(profileInput);
  const agentToModelMap: Record<string, string> = {};
  for (const [agent, profileToModelMap] of Object.entries(MODEL_PROFILES)) {
    if (profile === 'inherit') {
      agentToModelMap[agent] = 'inherit';
      continue;
    }
    const mapped = profileToModelMap[profile] ?? profileToModelMap.balanced;
    agentToModelMap[agent] = mapped ?? 'sonnet';
  }
  return agentToModelMap;
}

function resolveModelIdsSetting(config: Pick<GSDConfig, 'resolve_model_ids'> | Record<string, unknown>): ResolveModelIdsSetting | undefined {
  const value = config.resolve_model_ids;
  return value === true || value === false || value === 'omit' ? value : undefined;
}

function resolveConfiguredOverride(config: Pick<GSDConfig, 'model_overrides'> | Record<string, unknown>, agent: string): string | null {
  const overrides = normalizeOverrides(config.model_overrides);
  return overrides?.[agent] ?? null;
}

function resolveConfiguredCrossAiExecution(config: Pick<GSDConfig, 'workflow'> | Record<string, unknown>): boolean {
  const workflow = config.workflow;
  if (!workflow || typeof workflow !== 'object' || Array.isArray(workflow)) return false;
  return (workflow as { cross_ai_execution?: unknown }).cross_ai_execution === true;
}

function toResolvedModelValue(model: string, resolveModelIds: ResolveModelIdsSetting | undefined): string {
  if (resolveModelIds === true) {
    return MODEL_ALIAS_MAP[model] ?? model;
  }
  return model;
}

function buildUnsupportedResult(input: Omit<UnsupportedAgentBinding, 'kind' | 'modelToken'>): UnsupportedAgentBinding {
  return {
    kind: 'unsupported',
    modelToken: null,
    ...input,
  };
}

export function resolveAgentBinding(config: GSDConfig | Record<string, unknown>, agent: string): RuntimeModelResolution {
  const runtime = detectRuntime(config);
  const runtimeCapability = RUNTIME_CAPABILITIES[runtime];
  const profile = normalizeModelProfile(config.model_profile);
  const resolveModelIds = resolveModelIdsSetting(config);
  const configuredModel = resolveConfiguredOverride(config, agent);
  const knownAgent = Object.prototype.hasOwnProperty.call(MODEL_PROFILES, agent);
  const crossAiExecutionConfigured = resolveConfiguredCrossAiExecution(config);

  if (configuredModel) {
    if (!knownAgent) {
      return buildUnsupportedResult({
        agent,
        runtime,
        profile,
        bindingKind: configuredModel === 'inherit' ? 'inherit' : 'explicit',
        source: 'override',
        configuredModel,
        resolvedModel: configuredModel === 'inherit' ? 'inherit' : toResolvedModelValue(configuredModel, resolveModelIds),
        suggestedFix: 'Use a supported agent with contract coverage or add explicit Phase 5 contract coverage before execution.',
        rejectionReason: 'unknown-agent',
        message: `No runtime-model contract coverage exists for agent '${agent}'.`,
        knownAgent: false,
        resolveModelIds,
        runtimeCapability,
        crossAiExecutionConfigured,
      });
    }

    if (configuredModel === 'inherit') {
      return {
        kind: 'resolved',
        agent,
        runtime,
        profile,
        bindingKind: 'inherit',
        source: 'override',
        configuredModel,
        resolvedModel: 'inherit',
        modelToken: null,
        suggestedFix: 'Remove the inherit override to fall back to profile-based resolution.',
        knownAgent: true,
        resolveModelIds,
        runtimeCapability,
        crossAiExecutionConfigured,
      };
    }

    const resolvedModel = toResolvedModelValue(configuredModel, resolveModelIds);
    return {
      kind: 'resolved',
      agent,
      runtime,
      profile,
      bindingKind: 'explicit',
      source: 'override',
      configuredModel,
      resolvedModel,
      modelToken: resolvedModel,
      suggestedFix: 'Adjust model_overrides for this agent or remove the override to use profile/runtime defaults.',
      knownAgent: true,
      resolveModelIds,
      runtimeCapability,
      crossAiExecutionConfigured,
    };
  }

  if (resolveModelIds === 'omit') {
    if (!knownAgent) {
      return buildUnsupportedResult({
        agent,
        runtime,
        profile,
        bindingKind: 'runtime-default',
        source: 'resolve-model-omit',
        configuredModel: null,
        resolvedModel: null,
        suggestedFix: 'Use a supported agent with contract coverage before depending on runtime-default binding.',
        rejectionReason: 'unknown-agent',
        message: `Runtime-default binding was requested for unknown agent '${agent}'.`,
        knownAgent: false,
        resolveModelIds,
        runtimeCapability,
        crossAiExecutionConfigured,
      });
    }

    return {
      kind: 'resolved',
      agent,
      runtime,
      profile,
      bindingKind: 'runtime-default',
      source: 'resolve-model-omit',
      configuredModel: null,
      resolvedModel: null,
      modelToken: null,
      suggestedFix: 'Set model_overrides for this agent if you need an explicit model token.',
      knownAgent: true,
      resolveModelIds,
      runtimeCapability,
      crossAiExecutionConfigured,
    };
  }

  if (!knownAgent) {
    return buildUnsupportedResult({
      agent,
      runtime,
      profile,
      bindingKind: profile === 'inherit' ? 'inherit' : 'profile',
      source: profile === 'inherit' ? 'inherit-profile' : 'profile',
      configuredModel: null,
      resolvedModel: null,
      suggestedFix: 'Use a supported agent with contract coverage or configure an explicit supported agent override.',
      rejectionReason: 'unknown-agent',
      message: `No runtime-model contract coverage exists for agent '${agent}'.`,
      knownAgent: false,
      resolveModelIds,
      runtimeCapability,
      crossAiExecutionConfigured,
    });
  }

  if (profile === 'inherit') {
    return {
      kind: 'resolved',
      agent,
      runtime,
      profile,
      bindingKind: 'inherit',
      source: 'inherit-profile',
      configuredModel: null,
      resolvedModel: 'inherit',
      modelToken: null,
      suggestedFix: 'Set model_profile to a tiered profile or add model_overrides if a literal model token is required.',
      knownAgent: true,
      resolveModelIds,
      runtimeCapability,
      crossAiExecutionConfigured,
    };
  }

  const alias = MODEL_PROFILES[agent][profile] ?? MODEL_PROFILES[agent].balanced;
  const resolvedModel = toResolvedModelValue(alias, resolveModelIds);
  return {
    kind: 'resolved',
    agent,
    runtime,
    profile,
    bindingKind: 'profile',
    source: 'profile',
    configuredModel: null,
    resolvedModel,
    modelToken: resolvedModel,
    suggestedFix: 'Choose a different model_profile or add model_overrides for this agent.',
    knownAgent: true,
    resolveModelIds,
    runtimeCapability,
    crossAiExecutionConfigured,
  };
}

export function toLegacyResolveModelResult(resolution: RuntimeModelResolution): Record<string, unknown> {
  if (resolution.kind === 'resolved') {
    return {
      model: resolution.modelToken ?? '',
      profile: resolution.profile,
      binding_kind: resolution.bindingKind,
      source: resolution.source,
      runtime: resolution.runtime,
      configured_model: resolution.configuredModel,
      resolved_model: resolution.resolvedModel,
      cross_ai_execution_supported: resolution.runtimeCapability.supportsCrossAiExecution,
      cross_ai_execution_configured: resolution.crossAiExecutionConfigured,
    };
  }

  return {
    model: '',
    profile: resolution.profile,
    binding_kind: resolution.bindingKind,
    source: resolution.source,
    runtime: resolution.runtime,
    configured_model: resolution.configuredModel,
    resolved_model: resolution.resolvedModel,
    unsupported: true,
    agent: resolution.agent,
    rejection_reason: resolution.rejectionReason,
    suggested_fix: resolution.suggestedFix,
    message: resolution.message,
    cross_ai_execution_supported: resolution.runtimeCapability.supportsCrossAiExecution,
    cross_ai_execution_configured: resolution.crossAiExecutionConfigured,
  };
}

export function toLegacyModelToken(resolution: RuntimeModelResolution, fallback = ''): string {
  if (resolution.kind !== 'resolved') return fallback;
  return resolution.modelToken ?? fallback;
}

export function toInitModelToken(resolution: RuntimeModelResolution): string {
  if (resolution.kind !== 'resolved') return '';
  return resolution.modelToken ?? '';
}

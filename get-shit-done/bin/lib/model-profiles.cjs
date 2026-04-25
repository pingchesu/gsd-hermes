/**
 * Mapping of GSD agent to model for each profile.
 *
 * This file is the legacy CJS adapter for the Phase 5 runtime-model contract.
 * It intentionally mirrors the SDK contract semantics so CJS callers can reuse
 * the same binding outcomes without maintaining a separate branch matrix.
 */
const MODEL_PROFILES = {
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

const VALID_PROFILES = Object.keys(MODEL_PROFILES['gsd-planner']);
const ACCEPTED_MODEL_PROFILES = [...VALID_PROFILES, 'inherit'];

const MODEL_ALIAS_MAP = {
  opus: 'claude-opus-4-6',
  sonnet: 'claude-sonnet-4-6',
  haiku: 'claude-haiku-4-5',
};

const SUPPORTED_RUNTIMES = [
  'claude', 'opencode', 'kilo', 'gemini', 'codex', 'copilot', 'antigravity',
  'cursor', 'windsurf', 'augment', 'trae', 'qwen', 'codebuddy', 'cline', 'hermes',
];

const OPENAI_COMPATIBLE_RUNTIMES = ['codex', 'copilot', 'cursor', 'windsurf', 'cline'];
const GOOGLE_COMPATIBLE_RUNTIMES = ['gemini'];
const HERMES_MULTI_PROVIDER_RUNTIMES = ['hermes'];

function explicitModelFamiliesForRuntime(runtime) {
  if (runtime === 'claude') return ['anthropic'];
  if (OPENAI_COMPATIBLE_RUNTIMES.includes(runtime)) return ['openai'];
  if (GOOGLE_COMPATIBLE_RUNTIMES.includes(runtime)) return ['google'];
  if (HERMES_MULTI_PROVIDER_RUNTIMES.includes(runtime)) return ['anthropic', 'openai', 'google', 'unknown'];
  return ['openai', 'google', 'unknown'];
}

function runtimeCapability(runtime) {
  return {
    runtime,
    supportsExplicitModel: true,
    supportsInheritBinding: true,
    supportsRuntimeDefaultBinding: true,
    supportsCrossAiExecution: true,
    explicitModelFamilies: explicitModelFamiliesForRuntime(runtime),
  };
}

function isAnthropicModel(model) {
  return /^(?:claude(?:-|$)|anthropic\/claude-|opus$|sonnet$|haiku$)/i.test(model);
}

function isOpenAiModel(model) {
  return /^(?:openai\/|gpt-|o[134](?:$|[-.])|o3(?:$|[-.])|o4(?:$|[-.]))/i.test(model);
}

function isGoogleModel(model) {
  return /^(?:gemini(?:$|[-.])|google\/)/i.test(model);
}

function detectModelFamily(model) {
  if (!model) return 'unknown';
  const normalized = String(model).trim();
  if (!normalized) return 'unknown';
  if (isAnthropicModel(normalized)) return 'anthropic';
  if (isOpenAiModel(normalized)) return 'openai';
  if (isGoogleModel(normalized)) return 'google';
  return 'unknown';
}

function detectRuntime(config = {}) {
  const envValue = process.env.GSD_RUNTIME;
  if (envValue && SUPPORTED_RUNTIMES.includes(envValue)) return envValue;
  const configValue = config.runtime;
  if (typeof configValue === 'string' && SUPPORTED_RUNTIMES.includes(configValue)) return configValue;
  return 'claude';
}

function normalizeModelProfile(profile) {
  const normalized = typeof profile === 'string' ? profile.toLowerCase().trim() : '';
  return ACCEPTED_MODEL_PROFILES.includes(normalized) ? normalized : 'balanced';
}

function normalizeOverrides(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const normalized = {};
  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (trimmed) normalized[key] = trimmed;
  }
  return normalized;
}

function resolveModelIdsSetting(config) {
  const value = config && config.resolve_model_ids;
  return value === true || value === false || value === 'omit' ? value : undefined;
}

function toResolvedModelValue(model, resolveModelIds) {
  if (resolveModelIds === true) {
    return MODEL_ALIAS_MAP[model] || model;
  }
  return model;
}

function resolveAgentBindingBase(config = {}, agent) {
  const profile = normalizeModelProfile(config.model_profile);
  const resolveModelIds = resolveModelIdsSetting(config);
  const overrides = normalizeOverrides(config.model_overrides);
  const configuredModel = overrides && overrides[agent] ? overrides[agent] : null;
  const knownAgent = Object.prototype.hasOwnProperty.call(MODEL_PROFILES, agent);

  if (configuredModel) {
    if (!knownAgent) {
      return {
        kind: 'unsupported',
        agent,
        knownAgent: false,
        rejectionReason: 'unknown-agent',
        bindingKind: configuredModel === 'inherit' ? 'inherit' : 'explicit',
        source: 'override',
        configuredModel,
        resolvedModel: configuredModel === 'inherit'
          ? 'inherit'
          : toResolvedModelValue(configuredModel, resolveModelIds),
        modelToken: null,
        profile,
        resolveModelIds,
      };
    }

    if (configuredModel === 'inherit') {
      return {
        kind: 'resolved',
        agent,
        knownAgent: true,
        bindingKind: 'inherit',
        source: 'override',
        configuredModel,
        resolvedModel: 'inherit',
        modelToken: null,
        profile,
        resolveModelIds,
      };
    }

    const resolvedModel = toResolvedModelValue(configuredModel, resolveModelIds);
    return {
      kind: 'resolved',
      agent,
      knownAgent: true,
      bindingKind: 'explicit',
      source: 'override',
      configuredModel,
      resolvedModel,
      modelToken: resolvedModel,
      profile,
      resolveModelIds,
    };
  }

  if (resolveModelIds === 'omit') {
    if (!knownAgent) {
      return {
        kind: 'unsupported',
        agent,
        knownAgent: false,
        rejectionReason: 'unknown-agent',
        bindingKind: 'runtime-default',
        source: 'resolve-model-omit',
        configuredModel: null,
        resolvedModel: null,
        modelToken: null,
        profile,
        resolveModelIds,
      };
    }

    return {
      kind: 'resolved',
      agent,
      knownAgent: true,
      bindingKind: 'runtime-default',
      source: 'resolve-model-omit',
      configuredModel: null,
      resolvedModel: null,
      modelToken: null,
      profile,
      resolveModelIds,
    };
  }

  if (!knownAgent) {
    return {
      kind: 'unsupported',
      agent,
      knownAgent: false,
      rejectionReason: 'unknown-agent',
      bindingKind: profile === 'inherit' ? 'inherit' : 'profile',
      source: profile === 'inherit' ? 'inherit-profile' : 'profile',
      configuredModel: null,
      resolvedModel: null,
      modelToken: null,
      profile,
      resolveModelIds,
    };
  }

  if (profile === 'inherit') {
    return {
      kind: 'resolved',
      agent,
      knownAgent: true,
      bindingKind: 'inherit',
      source: 'inherit-profile',
      configuredModel: null,
      resolvedModel: 'inherit',
      modelToken: null,
      profile,
      resolveModelIds,
    };
  }

  const alias = MODEL_PROFILES[agent][profile] || MODEL_PROFILES[agent].balanced;
  const resolvedModel = toResolvedModelValue(alias, resolveModelIds);
  return {
    kind: 'resolved',
    agent,
    knownAgent: true,
    bindingKind: 'profile',
    source: 'profile',
    configuredModel: null,
    resolvedModel,
    modelToken: resolvedModel,
    profile,
    resolveModelIds,
  };
}

function suggestedFixFor(resolution) {
  if (!resolution || resolution.kind === 'unsupported') {
    if (resolution && resolution.bindingKind === 'runtime-default') {
      return 'Use a supported agent with contract coverage before depending on runtime-default binding.';
    }
    return 'Use a supported agent with contract coverage or add explicit Phase 5 contract coverage before execution.';
  }
  if (resolution.bindingKind === 'explicit') {
    return 'Adjust model_overrides for this agent or remove the override to use profile/runtime defaults.';
  }
  if (resolution.bindingKind === 'inherit') {
    return resolution.source === 'override'
      ? 'Remove the inherit override to fall back to profile-based resolution.'
      : 'Set model_profile to a tiered profile or add model_overrides if a literal model token is required.';
  }
  if (resolution.bindingKind === 'runtime-default') {
    return 'Set model_overrides for this agent if you need an explicit model token.';
  }
  return 'Choose a different model_profile or add model_overrides for this agent.';
}

function messageFor(resolution) {
  if (!resolution || resolution.kind !== 'unsupported') return undefined;
  if (resolution.bindingKind === 'runtime-default') {
    return `Runtime-default binding was requested for unknown agent '${resolution.agent}'.`;
  }
  return `No runtime-model contract coverage exists for agent '${resolution.agent}'.`;
}

function resolveConfiguredCrossAiExecution(config = {}) {
  const workflow = config.workflow;
  return !!workflow && typeof workflow === 'object' && !Array.isArray(workflow)
    && workflow.cross_ai_execution === true;
}

function resolveAgentBinding(config = {}, agent) {
  const resolution = resolveAgentBindingBase(config, agent);
  const runtime = detectRuntime(config);
  return {
    ...resolution,
    runtime,
    runtimeCapability: runtimeCapability(runtime),
    crossAiExecutionConfigured: resolveConfiguredCrossAiExecution(config),
    suggestedFix: suggestedFixFor(resolution),
    ...(resolution.kind === 'unsupported' ? { message: messageFor(resolution) } : {}),
  };
}

function serializeRuntimeModelResolution(resolution) {
  const base = {
    agent: resolution.agent,
    status: resolution.kind,
    known_agent: resolution.knownAgent,
    runtime: resolution.runtime || 'claude',
    profile: resolution.profile,
    binding_kind: resolution.bindingKind,
    source: resolution.source,
    configured_model: resolution.configuredModel,
    resolved_model: resolution.resolvedModel,
    model_token: resolution.modelToken,
    resolve_model_ids: resolution.resolveModelIds,
    suggested_fix: resolution.suggestedFix || suggestedFixFor(resolution),
    cross_ai: {
      execution_supported: !!(resolution.runtimeCapability && resolution.runtimeCapability.supportsCrossAiExecution),
      execution_configured: !!resolution.crossAiExecutionConfigured,
    },
    runtime_capability: {
      supports_explicit_model: !!(resolution.runtimeCapability && resolution.runtimeCapability.supportsExplicitModel),
      supports_inherit_binding: !!(resolution.runtimeCapability && resolution.runtimeCapability.supportsInheritBinding),
      supports_runtime_default_binding: !!(resolution.runtimeCapability && resolution.runtimeCapability.supportsRuntimeDefaultBinding),
    },
  };

  if (resolution.kind === 'unsupported') {
    return {
      ...base,
      rejection_reason: resolution.rejectionReason,
      message: resolution.message || messageFor(resolution),
    };
  }

  return base;
}

function receiptEnforceability(resolution) {
  if (resolution.kind === 'unsupported') return 'unsupported';
  if (resolution.bindingKind === 'explicit' && !!resolution.modelToken) {
    return 'explicit-token-needs-runtime-proof';
  }
  return 'inherits-or-runtime-default';
}

function toBindingReceipt(resolution, role) {
  const serialized = serializeRuntimeModelResolution(resolution);
  const providerModel = resolution.modelToken || resolution.resolvedModel || resolution.configuredModel;
  return {
    ...serialized,
    role,
    provider_family: detectModelFamily(providerModel),
    resolved_by_gsd: resolution.kind === 'resolved',
    passed_to_runtime: resolution.kind === 'resolved' && !!resolution.modelToken,
    runtime_enforced: 'unknown',
    enforceability: receiptEnforceability(resolution),
  };
}

function toLegacyModelToken(resolution, fallback = '') {
  if (!resolution || resolution.kind !== 'resolved') return fallback;
  if (resolution.bindingKind === 'inherit' || resolution.resolvedModel === 'inherit') return 'inherit';
  return resolution.modelToken || fallback;
}

function toInitModelToken(resolution) {
  if (!resolution || resolution.kind !== 'resolved') return '';
  return resolution.modelToken || '';
}

/**
 * Formats the agent-to-model mapping as a human-readable table (in string format).
 *
 * @param {Object<string, string>} agentToModelMap - A mapping from agent to model
 * @returns {string} A formatted table string
 */
function formatAgentToModelMapAsTable(agentToModelMap) {
  const agentWidth = Math.max('Agent'.length, ...Object.keys(agentToModelMap).map((a) => a.length));
  const modelWidth = Math.max(
    'Model'.length,
    ...Object.values(agentToModelMap).map((m) => m.length)
  );
  const sep = '─'.repeat(agentWidth + 2) + '┼' + '─'.repeat(modelWidth + 2);
  const header = ' ' + 'Agent'.padEnd(agentWidth) + ' │ ' + 'Model'.padEnd(modelWidth);
  let agentToModelTable = header + '\n' + sep + '\n';
  for (const [agent, model] of Object.entries(agentToModelMap)) {
    agentToModelTable += ' ' + agent.padEnd(agentWidth) + ' │ ' + model.padEnd(modelWidth) + '\n';
  }
  return agentToModelTable;
}

/**
 * Returns a mapping from agent to model for the given model profile.
 *
 * @param {string} profileInput - The profile name
 * @returns {Object<string, string>} A mapping from agent to model for the given profile
 */
function getAgentToModelMapForProfile(profileInput) {
  const profile = normalizeModelProfile(profileInput);
  const agentToModelMap = {};
  for (const [agent, profileToModelMap] of Object.entries(MODEL_PROFILES)) {
    if (profile === 'inherit') {
      agentToModelMap[agent] = 'inherit';
      continue;
    }
    agentToModelMap[agent] = profileToModelMap[profile] || profileToModelMap.balanced;
  }
  return agentToModelMap;
}

module.exports = {
  ACCEPTED_MODEL_PROFILES,
  MODEL_ALIAS_MAP,
  MODEL_PROFILES,
  VALID_PROFILES,
  formatAgentToModelMapAsTable,
  getAgentToModelMapForProfile,
  normalizeModelProfile,
  resolveAgentBinding,
  serializeRuntimeModelResolution,
  toBindingReceipt,
  toLegacyModelToken,
  toInitModelToken,
};

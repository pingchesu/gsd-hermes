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

function resolveAgentBinding(config = {}, agent) {
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
  toLegacyModelToken,
  toInitModelToken,
};

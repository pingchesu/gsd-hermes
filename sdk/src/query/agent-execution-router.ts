/**
 * Provider-routed agent execution bindings.
 *
 * This module is deliberately SDK-owned so workflow markdown consumes an
 * explicit binding receipt instead of guessing CLI commands from model strings.
 */

import type { GSDConfig } from '../config.js';
import { detectModelFamily, MODEL_ALIAS_MAP, type ModelFamily, type RuntimeModelReceipt } from './runtime-model-contract.js';

export type AgentExecutionRouterMode = 'provider-cli';
export type AgentExecutionDriverPreference = 'provider-cli' | 'hermes-chat' | 'hermes-terminal-tool';
export type AgentExecutionDriver = 'claude-cli' | 'codex-cli' | 'hermes-chat' | 'hermes-terminal-tool' | 'unsupported';
export type AgentExecutionBindingStatus = 'resolved' | 'unsupported';

export interface AgentExecutionBinding {
  agent: string;
  role: string;
  status: AgentExecutionBindingStatus;
  configured_model: string | null;
  provider_family: ModelFamily;
  execution_driver: AgentExecutionDriver;
  cli_model: string | null;
  source: RuntimeModelReceipt['source'];
  strict: boolean;
  diagnostic: string;
  suggested_fix: string | null;
}

export interface AgentExecutionBindings {
  router: AgentExecutionRouterMode;
  strict: true;
  driver_preference: AgentExecutionDriverPreference;
  agents: Record<string, AgentExecutionBinding>;
}

export function resolveAgentExecutionRouterMode(config: Pick<GSDConfig, 'workflow'> | Record<string, unknown>): AgentExecutionRouterMode | null {
  const workflow = config.workflow;
  if (!workflow || typeof workflow !== 'object' || Array.isArray(workflow)) return null;
  return (workflow as { agent_execution_router?: unknown }).agent_execution_router === 'provider-cli'
    ? 'provider-cli'
    : null;
}

export function resolveAgentExecutionDriverPreference(config: Pick<GSDConfig, 'workflow'> | Record<string, unknown>): AgentExecutionDriverPreference {
  const workflow = config.workflow;
  if (!workflow || typeof workflow !== 'object' || Array.isArray(workflow)) return 'provider-cli';
  const raw = (workflow as { agent_execution_driver?: unknown }).agent_execution_driver;
  return raw === 'hermes-chat' || raw === 'hermes-terminal-tool' ? raw : 'provider-cli';
}

function stripProviderPrefix(model: string, provider: 'anthropic' | 'openai'): string {
  const prefix = `${provider}/`;
  return model.toLowerCase().startsWith(prefix) ? model.slice(prefix.length) : model;
}

export function normalizeCliModel(model: string | null | undefined, providerFamily: ModelFamily): string | null {
  if (!model) return null;
  const trimmed = model.trim();
  if (trimmed === '') return null;

  if (providerFamily === 'anthropic') {
    const unprefixed = stripProviderPrefix(trimmed, 'anthropic');
    return MODEL_ALIAS_MAP[unprefixed] ?? unprefixed;
  }

  if (providerFamily === 'openai') {
    return stripProviderPrefix(trimmed, 'openai');
  }

  return trimmed;
}

function normalizeHermesModel(model: string | null | undefined): string | null {
  if (!model) return null;
  const trimmed = model.trim();
  return trimmed === '' ? null : trimmed;
}

function isHermesPrefixedModel(model: string | null | undefined): boolean {
  return typeof model === 'string' && model.trim().toLowerCase().startsWith('hermes/');
}

function stripHermesPrefix(model: string): string {
  return isHermesPrefixedModel(model) ? model.trim().slice('hermes/'.length) : model.trim();
}

function normalizeOpenAiHermesModel(model: string): string {
  const unprefixed = model.toLowerCase().startsWith('openai/') ? model.slice('openai/'.length) : model;
  const dotAlias = unprefixed.replace(/^gpt-(\d+)-(\d+)(.*)$/i, 'gpt-$1.$2$3');
  return `openai/${dotAlias}`;
}

function normalizeHermesRoutedModel(model: string | null | undefined, providerFamily: ModelFamily): string | null {
  if (!model) return null;
  const inner = stripHermesPrefix(model);
  if (inner === '') return null;

  if (providerFamily === 'anthropic') {
    const unprefixed = stripProviderPrefix(inner, 'anthropic');
    return `anthropic/${MODEL_ALIAS_MAP[unprefixed] ?? unprefixed}`;
  }

  if (providerFamily === 'openai') {
    return normalizeOpenAiHermesModel(inner);
  }

  if (providerFamily === 'google') {
    const unprefixed = inner.toLowerCase().startsWith('google/') ? inner.slice('google/'.length) : inner;
    return `google/${unprefixed}`;
  }

  return inner;
}

function providerFamilySupportedByHermes(providerFamily: ModelFamily): boolean {
  return providerFamily === 'anthropic' || providerFamily === 'openai' || providerFamily === 'google';
}

export function resolveAgentExecutionBinding(
  receipt: RuntimeModelReceipt,
  options: { driverPreference?: AgentExecutionDriverPreference } = {},
): AgentExecutionBinding {
  const providerModel = receipt.model_token ?? receipt.resolved_model ?? receipt.configured_model;
  const hermesPrefixed = isHermesPrefixedModel(providerModel);
  const providerFamily = receipt.provider_family === 'unknown' || hermesPrefixed
    ? detectModelFamily(providerModel)
    : receipt.provider_family;
  const requestedPreference = options.driverPreference ?? 'provider-cli';
  const driverPreference = hermesPrefixed && requestedPreference === 'provider-cli'
    ? 'hermes-terminal-tool'
    : requestedPreference;
  const cliModel = hermesPrefixed
    ? normalizeHermesRoutedModel(providerModel, providerFamily)
    : driverPreference === 'provider-cli'
      ? normalizeCliModel(providerModel, providerFamily)
      : normalizeHermesModel(providerModel);

  if (receipt.status !== 'resolved' || receipt.binding_kind !== 'explicit' || !providerModel) {
    return {
      agent: receipt.agent,
      role: receipt.role,
      status: 'unsupported',
      configured_model: receipt.configured_model,
      provider_family: providerFamily,
      execution_driver: 'unsupported',
      cli_model: null,
      source: receipt.source,
      strict: true,
      diagnostic: `Provider-routed execution requires an explicit model_overrides binding for ${receipt.agent}.`,
      suggested_fix: `Set model_overrides.${receipt.agent} to hermes/gpt-5-5, hermes/claude-opus-4-7, an OpenAI/GPT model, or an Anthropic/Claude model.`,
    };
  }

  if (driverPreference === 'hermes-chat' || driverPreference === 'hermes-terminal-tool') {
    if (providerFamilySupportedByHermes(providerFamily) && cliModel) {
      const label = driverPreference === 'hermes-chat' ? 'Hermes chat' : 'Hermes terminal tool';
      return {
        agent: receipt.agent,
        role: receipt.role,
        status: 'resolved',
        configured_model: receipt.configured_model,
        provider_family: providerFamily,
        execution_driver: driverPreference,
        cli_model: cliModel,
        source: receipt.source,
        strict: true,
        diagnostic: `${receipt.agent} routes through ${label} with explicit model '${providerModel}'. Hermes is the execution surface; provider selection remains model-driven and must not use provider-specific CLIs.`,
        suggested_fix: null,
      };
    }

    return {
      agent: receipt.agent,
      role: receipt.role,
      status: 'unsupported',
      configured_model: receipt.configured_model,
      provider_family: providerFamily,
      execution_driver: 'unsupported',
      cli_model: null,
      source: receipt.source,
      strict: true,
      diagnostic: `Hermes-native provider-routed execution does not support provider family '${providerFamily}' for ${receipt.agent}.`,
      suggested_fix: `Use hermes/gpt-5-5, hermes/claude-opus-4-7, or a supported plain OpenAI/GPT or Anthropic/Claude override for ${receipt.agent}.`,
    };
  }

  if (providerFamily === 'anthropic' && cliModel) {
    return {
      agent: receipt.agent,
      role: receipt.role,
      status: 'resolved',
      configured_model: receipt.configured_model,
      provider_family: providerFamily,
      execution_driver: 'claude-cli',
      cli_model: cliModel,
      source: receipt.source,
      strict: true,
      diagnostic: `${receipt.agent} routes to Claude Code CLI because model '${providerModel}' is Anthropic/Claude-family.`,
      suggested_fix: null,
    };
  }

  if (providerFamily === 'openai' && cliModel) {
    return {
      agent: receipt.agent,
      role: receipt.role,
      status: 'resolved',
      configured_model: receipt.configured_model,
      provider_family: providerFamily,
      execution_driver: 'codex-cli',
      cli_model: cliModel,
      source: receipt.source,
      strict: true,
      diagnostic: `${receipt.agent} routes to Codex CLI because model '${providerModel}' is OpenAI/GPT-family.`,
      suggested_fix: null,
    };
  }

  return {
    agent: receipt.agent,
    role: receipt.role,
    status: 'unsupported',
    configured_model: receipt.configured_model,
    provider_family: providerFamily,
    execution_driver: 'unsupported',
    cli_model: null,
    source: receipt.source,
    strict: true,
    diagnostic: `Provider-routed execution does not support provider family '${providerFamily}' for ${receipt.agent}.`,
    suggested_fix: `Use an Anthropic/Claude, OpenAI/GPT, hermes/gpt-5-5, or hermes/claude-opus-4-7 model override for ${receipt.agent}.`,
  };
}

function hasHermesPrefixedReceipt(modelBindingReceipts: { agents: Record<string, RuntimeModelReceipt> }): boolean {
  return Object.values(modelBindingReceipts.agents).some((receipt) => {
    const providerModel = receipt.model_token ?? receipt.resolved_model ?? receipt.configured_model;
    return isHermesPrefixedModel(providerModel);
  });
}

export function buildAgentExecutionBindings(
  config: GSDConfig | Record<string, unknown>,
  modelBindingReceipts: { agents: Record<string, RuntimeModelReceipt> },
): AgentExecutionBindings | null {
  const router = resolveAgentExecutionRouterMode(config);
  const hermesPrefixed = hasHermesPrefixedReceipt(modelBindingReceipts);
  if (router !== 'provider-cli' && !hermesPrefixed) return null;

  const configDriverPreference = resolveAgentExecutionDriverPreference(config);
  const driverPreference = hermesPrefixed && configDriverPreference === 'provider-cli'
    ? 'hermes-terminal-tool'
    : configDriverPreference;
  const agents: Record<string, AgentExecutionBinding> = {};
  for (const [role, receipt] of Object.entries(modelBindingReceipts.agents)) {
    agents[role] = resolveAgentExecutionBinding(receipt, { driverPreference: configDriverPreference });
  }

  return {
    router: 'provider-cli',
    strict: true,
    driver_preference: driverPreference,
    agents,
  };
}

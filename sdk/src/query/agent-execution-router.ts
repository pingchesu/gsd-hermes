/**
 * Provider-routed agent execution bindings.
 *
 * This module is deliberately SDK-owned so workflow markdown consumes an
 * explicit binding receipt instead of guessing CLI commands from model strings.
 */

import type { GSDConfig } from '../config.js';
import { detectModelFamily, MODEL_ALIAS_MAP, type ModelFamily, type RuntimeModelReceipt } from './runtime-model-contract.js';

export type AgentExecutionRouterMode = 'provider-cli';
export type AgentExecutionDriver = 'claude-cli' | 'codex-cli' | 'unsupported';
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
  agents: Record<string, AgentExecutionBinding>;
}

export function resolveAgentExecutionRouterMode(config: Pick<GSDConfig, 'workflow'> | Record<string, unknown>): AgentExecutionRouterMode | null {
  const workflow = config.workflow;
  if (!workflow || typeof workflow !== 'object' || Array.isArray(workflow)) return null;
  return (workflow as { agent_execution_router?: unknown }).agent_execution_router === 'provider-cli'
    ? 'provider-cli'
    : null;
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

export function resolveAgentExecutionBinding(receipt: RuntimeModelReceipt): AgentExecutionBinding {
  const providerModel = receipt.model_token ?? receipt.resolved_model ?? receipt.configured_model;
  const providerFamily = receipt.provider_family === 'unknown'
    ? detectModelFamily(providerModel)
    : receipt.provider_family;
  const cliModel = normalizeCliModel(providerModel, providerFamily);

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
      suggested_fix: `Set model_overrides.${receipt.agent} to an Anthropic/Claude or OpenAI/GPT model, or disable workflow.agent_execution_router.`,
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
    suggested_fix: `Use an Anthropic/Claude or OpenAI/GPT model override for ${receipt.agent}, or disable workflow.agent_execution_router.`,
  };
}

export function buildAgentExecutionBindings(
  config: GSDConfig | Record<string, unknown>,
  modelBindingReceipts: { agents: Record<string, RuntimeModelReceipt> },
): AgentExecutionBindings | null {
  const router = resolveAgentExecutionRouterMode(config);
  if (router !== 'provider-cli') return null;

  const agents: Record<string, AgentExecutionBinding> = {};
  for (const [role, receipt] of Object.entries(modelBindingReceipts.agents)) {
    agents[role] = resolveAgentExecutionBinding(receipt);
  }

  return {
    router,
    strict: true,
    agents,
  };
}

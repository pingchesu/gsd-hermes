/**
 * Config-get and resolve-model query handlers.
 *
 * Ported from get-shit-done/bin/lib/config.cjs and commands.cjs.
 * Provides raw config.json traversal and model profile resolution.
 *
 * @example
 * ```typescript
 * import { configGet, resolveModel } from './config-query.js';
 *
 * const result = await configGet(['workflow.auto_advance'], '/project');
 * // { data: true }
 *
 * const model = await resolveModel(['gsd-planner'], '/project');
 * // { data: { model: 'opus', profile: 'balanced', binding_kind: 'profile' } }
 * ```
 */

import { readFile } from 'node:fs/promises';
import { GSDError, ErrorClassification } from '../errors.js';
import { loadConfig } from '../config.js';
import { planningPaths } from './helpers.js';
import {
  ACCEPTED_MODEL_PROFILES,
  MODEL_PROFILES,
  VALID_PROFILES,
  getAgentToModelMapForProfile,
  resolveAgentBinding,
  serializeRuntimeModelResolution,
  toLegacyResolveModelResult,
} from './runtime-model-contract.js';
import type { QueryHandler } from './utils.js';

export {
  ACCEPTED_MODEL_PROFILES,
  MODEL_PROFILES,
  VALID_PROFILES,
  getAgentToModelMapForProfile,
} from './runtime-model-contract.js';
export {
  assertAgentBindingsSupported,
  formatBindingValidationError,
  validateAgentBinding,
  validateAgentBindings,
  validateResolvedAgentBinding,
} from './runtime-model-validation.js';

// ─── configGet ──────────────────────────────────────────────────────────────

/**
 * Query handler for config-get command.
 *
 * Reads raw .planning/config.json and traverses dot-notation key paths.
 * Does NOT merge with defaults (matches gsd-tools.cjs behavior).
 *
 * @param args - args[0] is the dot-notation key path (e.g., 'workflow.auto_advance')
 * @param projectDir - Project root directory
 * @returns QueryResult with the config value at the given path
 * @throws GSDError with Validation classification if key missing or not found
 */
export const configGet: QueryHandler = async (args, projectDir, _workstream) => {
  const keyPath = args[0];
  if (!keyPath) {
    throw new GSDError('Usage: config-get <key.path>', ErrorClassification.Validation);
  }

  const paths = planningPaths(projectDir);
  let raw: string;
  try {
    raw = await readFile(paths.config, 'utf-8');
  } catch {
    throw new GSDError(`No config.json found at ${paths.config}`, ErrorClassification.Validation);
  }

  let config: Record<string, unknown>;
  try {
    config = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new GSDError(`Malformed config.json at ${paths.config}`, ErrorClassification.Validation);
  }

  const keys = keyPath.split('.');
  let current: unknown = config;
  for (const key of keys) {
    if (current === undefined || current === null || typeof current !== 'object') {
      throw new GSDError(`Key not found: ${keyPath}`, ErrorClassification.Validation);
    }
    current = (current as Record<string, unknown>)[key];
  }
  if (current === undefined) {
    throw new GSDError(`Key not found: ${keyPath}`, ErrorClassification.Validation);
  }

  return { data: current };
};

// ─── configPath ─────────────────────────────────────────────────────────────

/**
 * Query handler for config-path — resolved `.planning/config.json` path (workstream-aware via cwd).
 *
 * Port of `cmdConfigPath` from `config.cjs`. The JSON query API returns `{ path }`; the CJS CLI
 * emits the path as plain text for shell substitution.
 *
 * @param _args - Unused
 * @param projectDir - Project root directory
 * @returns QueryResult with `{ path: string }` absolute or project-relative resolution via planningPaths
 */
export const configPath: QueryHandler = async (_args, projectDir, _workstream) => {
  const paths = planningPaths(projectDir);
  return { data: { path: paths.config } };
};

// ─── resolveModel ───────────────────────────────────────────────────────────

/**
 * Query handler for resolve-model command.
 *
 * Resolves a structured runtime-model binding for the requested agent, then
 * adapts it to the legacy query payload shape while preserving explicit,
 * inherit, runtime-default, and unsupported outcomes in metadata.
 *
 * @param args - args[0] is the agent type (e.g., 'gsd-planner')
 * @param projectDir - Project root directory
 * @returns QueryResult with a legacy-compatible model payload plus structured metadata
 * @throws GSDError with Validation classification if agent type not provided
 */
export const resolveModel: QueryHandler = async (args, projectDir) => {
  const agentType = args[0];
  if (!agentType) {
    throw new GSDError('agent-type required', ErrorClassification.Validation);
  }

  const config = await loadConfig(projectDir);
  const resolution = resolveAgentBinding(config, agentType);
  const legacy = toLegacyResolveModelResult(resolution);
  const workflow = (config.workflow ?? {}) as unknown as Record<string, unknown>;

  return {
    data: {
      ...legacy,
      runtime_model: {
        runtime: resolution.runtime,
        model_profile: resolution.profile,
        resolve_model_ids: resolution.resolveModelIds ?? null,
        cross_ai: {
          execution_configured: workflow.cross_ai_execution === true,
          command_configured: typeof workflow.cross_ai_command === 'string' && workflow.cross_ai_command.trim() !== '',
          timeout_seconds: typeof workflow.cross_ai_timeout === 'number' ? workflow.cross_ai_timeout : null,
        },
        binding: serializeRuntimeModelResolution(resolution),
      },
    },
  };
};

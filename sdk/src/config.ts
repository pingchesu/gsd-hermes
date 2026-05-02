/**
 * Config reader — loads `.planning/config.json` and merges with defaults.
 *
 * Mirrors the default structure from `get-shit-done/bin/lib/config.cjs`
 * `buildNewProjectConfig()`.
 */

import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { relPlanningPath } from './workstream-utils.js';
import type { AcceptedModelProfile } from './query/runtime-model-contract.js';

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * Hermes v1.2 compatibility: optional "omit" sentinel allows config to opt out
 * of alias→model-id resolution (keeping logical aliases in emitted artifacts).
 */
export type ResolveModelIdsSetting = boolean | 'omit';

/**
 * Hermes v1.2 compatibility: per-agent model override map
 * (e.g., `{ "gsd-planner": "inherit" }`). Keys are agent slugs, values are
 * model aliases or the literal `"inherit"` sentinel.
 */
export type ModelOverridesConfig = Record<string, string>;

export interface GitConfig {
  branching_strategy: string;
  phase_branch_template: string;
  milestone_branch_template: string;
  quick_branch_template: string | null;
}

export interface WorkflowConfig {
  research: boolean;
  plan_check: boolean;
  verifier: boolean;
  nyquist_validation: boolean;
  /** Mirrors gsd-tools flat `config.tdd_mode` (from `workflow.tdd_mode`). */
  tdd_mode: boolean;
  auto_advance: boolean;
  node_repair: boolean;
  node_repair_budget: number;
  ui_phase: boolean;
  ui_safety_gate: boolean;
  text_mode: boolean;
  research_before_questions: boolean;
  discuss_mode: string;
  skip_discuss: boolean;
  /** Maximum self-discuss passes in auto/headless mode before forcing proceed. Default: 3. */
  max_discuss_passes: number;
  /** Advanced per-agent execution router. Normal Hermes-native usage should prefer `model_overrides` values like `hermes/gpt-5-5`. */
  agent_execution_router?: 'provider-cli' | string;
  /** Advanced driver preference for explicit provider routing; most projects should leave unset. */
  agent_execution_driver?: 'provider-cli' | 'hermes-chat' | 'hermes-terminal-tool' | string;
  /** Subagent timeout in ms (matches `get-shit-done/bin/lib/core.cjs` default 300000). */
  subagent_timeout: number;
  /**
   * Issue #2492. When true (default), enforces that every trackable decision in
   * CONTEXT.md `<decisions>` is referenced by at least one plan (translation
   * gate, blocking) and reports decisions not honored by shipped artifacts at
   * verify-phase (validation gate, non-blocking). Set false to disable both.
   */
  context_coverage_gate: boolean;
}

export interface HooksConfig {
  context_warnings: boolean;
}

export interface GSDConfig {
  model_profile: AcceptedModelProfile;
  /** Hermes v1.2: per-agent model overrides (optional). */
  model_overrides?: ModelOverridesConfig;
  /** Hermes v1.2: whether to resolve logical aliases to concrete model IDs. */
  resolve_model_ids?: ResolveModelIdsSetting;
  /** Hermes v1.2: runtime hint (claude-code/openai/gemini/...). */
  runtime?: string;
  commit_docs: boolean;
  parallelization: boolean;
  search_gitignored: boolean;
  brave_search: boolean;
  firecrawl: boolean;
  exa_search: boolean;
  git: GitConfig;
  workflow: WorkflowConfig;
  hooks: HooksConfig;
  agent_skills: Record<string, unknown>;
  /** Project slug for branch templates; mirrors gsd-tools `config.project_code`. */
  project_code?: string | null;
  /** Interactive vs headless; mirrors gsd-tools flat `config.mode`. */
  mode?: string;
  /** Internal auto-chain flag; mirrors gsd-tools `config._auto_chain_active`. */
  _auto_chain_active?: boolean;
  [key: string]: unknown;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const CONFIG_DEFAULTS: GSDConfig = {
  model_profile: 'balanced',
  model_overrides: {},
  resolve_model_ids: false,
  commit_docs: true,
  parallelization: true,
  search_gitignored: false,
  brave_search: false,
  firecrawl: false,
  exa_search: false,
  git: {
    branching_strategy: 'none',
    phase_branch_template: 'gsd/phase-{phase}-{slug}',
    milestone_branch_template: 'gsd/{milestone}-{slug}',
    quick_branch_template: null,
  },
  workflow: {
    research: true,
    plan_check: true,
    verifier: true,
    nyquist_validation: true,
    tdd_mode: false,
    auto_advance: false,
    node_repair: true,
    node_repair_budget: 2,
    ui_phase: true,
    ui_safety_gate: true,
    text_mode: false,
    research_before_questions: false,
    discuss_mode: 'discuss',
    skip_discuss: false,
    max_discuss_passes: 3,
    subagent_timeout: 300000,
    context_coverage_gate: true,
  },
  hooks: {
    context_warnings: true,
  },
  agent_skills: {},
  project_code: null,
  mode: 'interactive',
  _auto_chain_active: false,
};

// ─── Loader ──────────────────────────────────────────────────────────────────

/**
 * Load project config from `.planning/config.json`, merging with defaults.
 * When project config is missing or empty, layers user defaults
 * (`~/.gsd/defaults.json`) over built-in defaults.
 * Throws on malformed JSON with a helpful error message.
 */
/**
 * Read user-level defaults from `~/.gsd/defaults.json` (or `$GSD_HOME/.gsd/`
 * when set). Returns `{}` when the file is missing, empty, or malformed —
 * matches CJS behavior in `get-shit-done/bin/lib/core.cjs` (#1683, #2652).
 */
async function loadUserDefaults(): Promise<Record<string, unknown>> {
  const home = process.env.GSD_HOME || homedir();
  const defaultsPath = join(home, '.gsd', 'defaults.json');
  let raw: string;
  try {
    raw = await readFile(defaultsPath, 'utf-8');
  } catch {
    return {};
  }
  const trimmed = raw.trim();
  if (trimmed === '') return {};
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function loadConfig(projectDir: string, workstream?: string): Promise<GSDConfig> {
  const configPath = join(projectDir, relPlanningPath(workstream), 'config.json');
  const rootConfigPath = join(projectDir, '.planning', 'config.json');

  let raw: string;
  let projectConfigFound = false;
  try {
    raw = await readFile(configPath, 'utf-8');
    projectConfigFound = true;
  } catch {
    // If workstream config missing, fall back to root config.
    if (workstream) {
      try {
        raw = await readFile(rootConfigPath, 'utf-8');
        projectConfigFound = true;
      } catch {
        raw = '';
      }
    } else {
      raw = '';
    }
  }

  // Pre-project context: no .planning/config.json exists. Layer user-level
  // defaults from ~/.gsd/defaults.json over built-in defaults. Mirrors the
  // CJS fall-back branch in get-shit-done/bin/lib/core.cjs:421 (#1683) so
  // SDK-dispatched init queries (e.g. resolveModel in Codex installs, #2652)
  // honor user-level knobs like `resolve_model_ids: "omit"`.
  if (!projectConfigFound) {
    const userDefaults = await loadUserDefaults();
    return mergeDefaults(userDefaults);
  }

  const parsed = parseProjectConfig(raw, configPath);

  // Workstream configs inherit root config and override only their local keys.
  // This mirrors CJS core.cjs loadConfig behavior so SDK query surfaces do not
  // lose root-level runtime/model_overrides when --ws is used.
  if (workstream && configPath !== rootConfigPath) {
    try {
      const rootRaw = await readFile(rootConfigPath, 'utf-8');
      const rootParsed = parseProjectConfig(rootRaw, rootConfigPath);
      return mergeDefaults(deepMergeConfig(rootParsed, parsed));
    } catch (err) {
      if (err instanceof Error && err.message.startsWith('Failed to parse config at ')) {
        throw err;
      }
      return mergeDefaults(parsed);
    }
  }

  // Project config exists — user-level defaults are ignored (CJS parity).
  // `buildNewProjectConfig` already baked them into config.json at /gsd:new-project.
  return mergeDefaults(parsed);
}

function parseProjectConfig(raw: string, configPath: string): Record<string, unknown> {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse config at ${configPath}: ${msg}`);
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error(`Config at ${configPath} must be a JSON object`);
  }

  return parsed as Record<string, unknown>;
}

function isPlainConfigObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMergeConfig(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (isPlainConfigObject(value) && isPlainConfigObject(result[key])) {
      result[key] = deepMergeConfig(result[key] as Record<string, unknown>, value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function mergeDefaults(parsed: Record<string, unknown>): GSDConfig {
  return {
    ...structuredClone(CONFIG_DEFAULTS),
    ...parsed,
    git: {
      ...CONFIG_DEFAULTS.git,
      ...(parsed.git as Partial<GitConfig> ?? {}),
    },
    workflow: {
      ...CONFIG_DEFAULTS.workflow,
      ...(parsed.workflow as Partial<WorkflowConfig> ?? {}),
    },
    hooks: {
      ...CONFIG_DEFAULTS.hooks,
      ...(parsed.hooks as Partial<HooksConfig> ?? {}),
    },
    agent_skills: {
      ...CONFIG_DEFAULTS.agent_skills,
      ...(parsed.agent_skills as Record<string, unknown> ?? {}),
    },
  };
}

/**
 * Unit tests for config-get and resolve-model query handlers.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { GSDError } from '../errors.js';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'gsd-cfg-'));
  await mkdir(join(tmpDir, '.planning'), { recursive: true });
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('configGet', () => {
  it('returns raw config value for top-level key', async () => {
    const { configGet } = await import('./config-query.js');
    await writeFile(
      join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({ model_profile: 'quality' }),
    );
    const result = await configGet(['model_profile'], tmpDir);
    expect(result.data).toBe('quality');
  });

  it('traverses dot-notation for nested keys', async () => {
    const { configGet } = await import('./config-query.js');
    await writeFile(
      join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({ workflow: { auto_advance: true } }),
    );
    const result = await configGet(['workflow.auto_advance'], tmpDir);
    expect(result.data).toBe(true);
  });

  it('throws GSDError when no key provided', async () => {
    const { configGet } = await import('./config-query.js');
    await expect(configGet([], tmpDir)).rejects.toThrow(GSDError);
  });

  it('throws GSDError for nonexistent key', async () => {
    const { configGet } = await import('./config-query.js');
    await writeFile(
      join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({ model_profile: 'quality' }),
    );
    await expect(configGet(['nonexistent.key'], tmpDir)).rejects.toThrow(GSDError);
  });

  it('reads raw config without merging defaults', async () => {
    const { configGet } = await import('./config-query.js');
    await writeFile(
      join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({ model_profile: 'balanced' }),
    );
    await expect(configGet(['workflow.auto_advance'], tmpDir)).rejects.toThrow(GSDError);
  });
});

describe('runtime-model contract', () => {
  it('exports a capability registry for every supported runtime', async () => {
    const { RUNTIME_CAPABILITIES } = await import('./runtime-model-contract.js');
    const { SUPPORTED_RUNTIMES } = await import('./helpers.js');
    expect(Object.keys(RUNTIME_CAPABILITIES).sort()).toEqual([...SUPPORTED_RUNTIMES].sort());
    expect(RUNTIME_CAPABILITIES.codex.supportsCrossAiExecution).toBe(true);
    expect(RUNTIME_CAPABILITIES.codex.explicitModelFamilies).toContain('openai');
    expect(RUNTIME_CAPABILITIES.hermes.explicitModelFamilies).toEqual(['anthropic', 'openai', 'google', 'unknown']);
  });

  it('supports inherit as a compatibility profile input while keeping adaptive valid', async () => {
    const { ACCEPTED_MODEL_PROFILES, VALID_PROFILES, getAgentToModelMapForProfile } = await import('./config-query.js');
    expect(VALID_PROFILES).toEqual(['quality', 'balanced', 'budget', 'adaptive']);
    expect(ACCEPTED_MODEL_PROFILES).toEqual(['quality', 'balanced', 'budget', 'adaptive', 'inherit']);
    expect(getAgentToModelMapForProfile('inherit')['gsd-planner']).toBe('inherit');
  });

  it('resolves structured binding kinds distinctly', async () => {
    const { resolveAgentBinding } = await import('./runtime-model-contract.js');

    const explicit = resolveAgentBinding({
      model_profile: 'balanced',
      model_overrides: { 'gsd-planner': 'openai/gpt-5.4' },
      workflow: {},
    }, 'gsd-planner');
    expect(explicit.kind).toBe('resolved');
    if (explicit.kind !== 'resolved') throw new Error('expected resolved explicit binding');
    expect(explicit.bindingKind).toBe('explicit');
    expect(explicit.configuredModel).toBe('openai/gpt-5.4');
    expect(explicit.resolvedModel).toBe('openai/gpt-5.4');

    const inherit = resolveAgentBinding({ model_profile: 'inherit', workflow: {} }, 'gsd-planner');
    expect(inherit.kind).toBe('resolved');
    if (inherit.kind !== 'resolved') throw new Error('expected resolved inherit binding');
    expect(inherit.bindingKind).toBe('inherit');
    expect(inherit.modelToken).toBeNull();

    const runtimeDefault = resolveAgentBinding({ model_profile: 'balanced', resolve_model_ids: 'omit', workflow: {} }, 'gsd-planner');
    expect(runtimeDefault.kind).toBe('resolved');
    if (runtimeDefault.kind !== 'resolved') throw new Error('expected resolved runtime-default binding');
    expect(runtimeDefault.bindingKind).toBe('runtime-default');
    expect(runtimeDefault.modelToken).toBeNull();
  });

  it('maps profile aliases to full IDs when resolve_model_ids is true', async () => {
    const { resolveAgentBinding } = await import('./runtime-model-contract.js');
    const result = resolveAgentBinding({ model_profile: 'balanced', resolve_model_ids: true, workflow: {} }, 'gsd-planner');
    expect(result.kind).toBe('resolved');
    if (result.kind !== 'resolved') throw new Error('expected resolved binding');
    expect(result.resolvedModel).toBe('claude-opus-4-6');
    expect(result.modelToken).toBe('claude-opus-4-6');
  });

  it('reports unknown agents as structured unsupported results instead of sonnet fallback', async () => {
    const { resolveAgentBinding } = await import('./runtime-model-contract.js');
    const result = resolveAgentBinding({ model_profile: 'balanced', workflow: {} }, 'unknown-agent');
    expect(result.kind).toBe('unsupported');
    if (result.kind !== 'unsupported') throw new Error('expected unsupported binding');
    expect(result.agent).toBe('unknown-agent');
    expect(result.runtime).toBe('claude');
    expect(result.bindingKind).toBe('profile');
    expect(result.rejectionReason).toBe('unknown-agent');
    expect(result.suggestedFix).toContain('supported agent');
  });

  it('projects explicit override bindings into runtime/model receipts with separated truth fields', async () => {
    const { resolveAgentBinding, toRuntimeModelReceipt } = await import('./runtime-model-contract.js');
    const resolution = resolveAgentBinding({
      runtime: 'hermes',
      model_profile: 'inherit',
      resolve_model_ids: 'omit',
      model_overrides: { 'gsd-planner': 'openai/gpt-5.4' },
      workflow: {},
    }, 'gsd-planner');

    const receipt = toRuntimeModelReceipt(resolution, 'planner');

    expect(receipt).toMatchObject({
      role: 'planner',
      agent: 'gsd-planner',
      runtime: 'hermes',
      profile: 'inherit',
      binding_kind: 'explicit',
      source: 'override',
      configured_model: 'openai/gpt-5.4',
      resolved_model: 'openai/gpt-5.4',
      model_token: 'openai/gpt-5.4',
      provider_family: 'openai',
      known_agent: true,
      resolved_by_gsd: true,
      passed_to_runtime: true,
      runtime_enforced: 'unknown',
      enforceability: 'explicit-token-needs-runtime-proof',
    });
  });

  it('projects runtime-default bindings as resolved by GSD but not passed to runtime', async () => {
    const { resolveAgentBinding, toRuntimeModelReceipt } = await import('./runtime-model-contract.js');
    const resolution = resolveAgentBinding({
      runtime: 'hermes',
      model_profile: 'balanced',
      resolve_model_ids: 'omit',
      workflow: {},
    }, 'gsd-verifier');

    const receipt = toRuntimeModelReceipt(resolution, 'verifier');

    expect(receipt.resolved_by_gsd).toBe(true);
    expect(receipt.passed_to_runtime).toBe(false);
    expect(receipt.runtime_enforced).toBe('unknown');
    expect(receipt.enforceability).toBe('inherits-or-runtime-default');
    expect(receipt.model_token).toBeNull();
    expect(receipt.provider_family).toBe('unknown');
  });

  it('projects unsupported unknown-agent bindings with actionable diagnostics', async () => {
    const { resolveAgentBinding, toRuntimeModelReceipt } = await import('./runtime-model-contract.js');
    const resolution = resolveAgentBinding({
      runtime: 'hermes',
      model_profile: 'balanced',
      workflow: {},
    }, 'unknown-agent');

    const receipt = toRuntimeModelReceipt(resolution, 'mystery');

    expect(receipt).toMatchObject({
      role: 'mystery',
      agent: 'unknown-agent',
      known_agent: false,
      resolved_by_gsd: false,
      passed_to_runtime: false,
      runtime_enforced: 'unknown',
      enforceability: 'unsupported',
      rejection_reason: 'unknown-agent',
    });
    expect(receipt.message).toContain('unknown-agent');
    expect(receipt.suggested_fix).toContain('supported agent');
  });
});

describe('strict runtime-model validation', () => {
  it('rejects profile-derived Anthropic bindings on codex with actionable diagnostics', async () => {
    const { validateAgentBinding, formatBindingValidationError } = await import('./config-query.js');
    const result = validateAgentBinding({
      runtime: 'codex',
      model_profile: 'balanced',
      workflow: { cross_ai_execution: false },
    }, 'gsd-planner');

    expect(result.ok).toBe(false);
    expect(result.issue?.agent).toBe('gsd-planner');
    expect(result.issue?.runtime).toBe('codex');
    expect(result.issue?.bindingKind).toBe('profile');
    expect(result.issue?.resolvedModel).toBe('opus');
    expect(result.issue?.rejectionReason).toBe('runtime-model-unsupported');
    expect(result.issue?.reason).toContain('does not support Anthropic model bindings');
    expect(result.issue?.suggestedFix).toContain('resolve_model_ids to "omit"');
    expect(result.issue?.crossAiExecutionRecommended).toBe(true);
    expect(result.issue?.crossAiExecutionSuggestion).toContain('workflow.cross_ai_execution is currently disabled');

    const message = formatBindingValidationError({
      ok: false,
      runtime: result.runtime,
      agents: ['gsd-planner'],
      results: [result],
      issues: result.issue ? [result.issue] : [],
    }, 'plan execution');

    expect(message).toContain('Agent: gsd-planner');
    expect(message).toContain('Runtime: codex');
    expect(message).toContain('Resolved model: opus');
    expect(message).toContain('Suggested fix:');
    expect(message).toContain('Cross-AI suggestion:');
  });

  it('rejects explicit unsupported overrides but keeps cross_ai_execution as recommendation only', async () => {
    const { validateAgentBinding } = await import('./config-query.js');
    const result = validateAgentBinding({
      runtime: 'codex',
      model_profile: 'inherit',
      resolve_model_ids: 'omit',
      model_overrides: { 'gsd-planner': 'claude-opus-4-7' },
      workflow: { cross_ai_execution: true },
    }, 'gsd-planner');

    expect(result.ok).toBe(false);
    expect(result.issue?.bindingKind).toBe('explicit');
    expect(result.issue?.configuredModel).toBe('claude-opus-4-7');
    expect(result.issue?.resolvedModel).toBe('claude-opus-4-7');
    expect(result.issue?.crossAiExecutionConfigured).toBe(true);
    expect(result.issue?.crossAiExecutionRecommended).toBe(true);
    expect(result.issue?.crossAiExecutionSuggestion).toContain('will not auto-route into it');
  });

  it('keeps inherit and runtime-default bindings valid on codex', async () => {
    const { validateAgentBinding } = await import('./config-query.js');

    const inherit = validateAgentBinding({
      runtime: 'codex',
      model_profile: 'inherit',
      workflow: {},
    }, 'gsd-planner');
    expect(inherit.ok).toBe(true);
    expect(inherit.bindingKind).toBe('inherit');

    const runtimeDefault = validateAgentBinding({
      runtime: 'codex',
      model_profile: 'balanced',
      resolve_model_ids: 'omit',
      workflow: {},
    }, 'gsd-planner');
    expect(runtimeDefault.ok).toBe(true);
    expect(runtimeDefault.bindingKind).toBe('runtime-default');
  });

  it('keeps runtime-compatible explicit openai overrides valid on codex', async () => {
    const { validateAgentBinding } = await import('./config-query.js');
    const result = validateAgentBinding({
      runtime: 'codex',
      model_profile: 'balanced',
      resolve_model_ids: 'omit',
      model_overrides: { 'gsd-planner': 'openai/o3' },
      workflow: {},
    }, 'gsd-planner');

    expect(result.ok).toBe(true);
    expect(result.bindingKind).toBe('explicit');
    expect(result.resolvedModel).toBe('openai/o3');
    expect(result.issue).toBeNull();
  });

  it('accepts explicit mixed-provider bindings on hermes', async () => {
    const { validateAgentBinding } = await import('./config-query.js');

    const planner = validateAgentBinding({
      runtime: 'hermes',
      model_profile: 'inherit',
      resolve_model_ids: 'omit',
      model_overrides: { 'gsd-planner': 'claude-opus-4-7' },
      workflow: {},
    }, 'gsd-planner');

    const checker = validateAgentBinding({
      runtime: 'hermes',
      model_profile: 'inherit',
      resolve_model_ids: 'omit',
      model_overrides: { 'gsd-plan-checker': 'openai/gpt-5.4' },
      workflow: {},
    }, 'gsd-plan-checker');

    expect(planner.ok).toBe(true);
    expect(planner.bindingKind).toBe('explicit');
    expect(planner.resolvedModel).toBe('claude-opus-4-7');
    expect(planner.issue).toBeNull();

    expect(checker.ok).toBe(true);
    expect(checker.bindingKind).toBe('explicit');
    expect(checker.resolvedModel).toBe('openai/gpt-5.4');
    expect(checker.issue).toBeNull();
  });
});

describe('resolveModel', () => {
  it('returns model/profile metadata for known agents', async () => {
    const { resolveModel } = await import('./config-query.js');
    await writeFile(
      join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({ model_profile: 'balanced' }),
    );
    const result = await resolveModel(['gsd-planner'], tmpDir);
    const data = result.data as Record<string, unknown>;
    expect(data.model).toBe('opus');
    expect(data.profile).toBe('balanced');
    expect(data.binding_kind).toBe('profile');
    expect(data.runtime).toBe('claude');
    const runtimeModel = data.runtime_model as Record<string, unknown>;
    expect(runtimeModel.runtime).toBe('claude');
    expect((runtimeModel.binding as Record<string, unknown>).binding_kind).toBe('profile');
  });

  it('respects explicit model_overrides before all other paths', async () => {
    const { resolveModel } = await import('./config-query.js');
    await writeFile(
      join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({
        model_profile: 'inherit',
        resolve_model_ids: 'omit',
        model_overrides: { 'gsd-planner': 'openai/gpt-5.4' },
      }),
    );
    const result = await resolveModel(['gsd-planner'], tmpDir);
    const data = result.data as Record<string, unknown>;
    expect(data.model).toBe('openai/gpt-5.4');
    expect(data.binding_kind).toBe('explicit');
    expect(data.source).toBe('override');
    expect(((data.runtime_model as Record<string, unknown>).binding as Record<string, unknown>).configured_model).toBe('openai/gpt-5.4');
  });

  it('preserves runtime-default binding when resolve_model_ids is omit', async () => {
    const { resolveModel } = await import('./config-query.js');
    await writeFile(
      join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({
        model_profile: 'balanced',
        resolve_model_ids: 'omit',
      }),
    );
    const result = await resolveModel(['gsd-planner'], tmpDir);
    const data = result.data as Record<string, unknown>;
    expect(data.model).toBe('');
    expect(data.binding_kind).toBe('runtime-default');
    expect(data.resolved_model).toBeNull();
    const runtimeModel = data.runtime_model as Record<string, unknown>;
    expect(runtimeModel.resolve_model_ids).toBe('omit');
    expect(((runtimeModel.binding as Record<string, unknown>).binding_kind)).toBe('runtime-default');
  });

  it('preserves fully-qualified model_overrides when resolve_model_ids is omit', async () => {
    const { resolveModel } = await import('./config-query.js');
    await writeFile(
      join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({
        model_profile: 'inherit',
        resolve_model_ids: 'omit',
        model_overrides: {
          'gsd-planner': 'claude-opus-4-7',
          'gsd-executor': 'openai/gpt-5.4',
        },
      }),
    );

    const planner = await resolveModel(['gsd-planner'], tmpDir);
    const plannerData = planner.data as Record<string, unknown>;
    expect(plannerData.model).toBe('claude-opus-4-7');
    expect(plannerData.binding_kind).toBe('explicit');

    const executor = await resolveModel(['gsd-executor'], tmpDir);
    const executorData = executor.data as Record<string, unknown>;
    expect(executorData.model).toBe('openai/gpt-5.4');
    expect(executorData.binding_kind).toBe('explicit');

    const verifier = await resolveModel(['gsd-verifier'], tmpDir);
    const verifierData = verifier.data as Record<string, unknown>;
    expect(verifierData.model).toBe('');
    expect(verifierData.binding_kind).toBe('runtime-default');
  });

  it('serializes inherit profile as an explicit inherit binding state', async () => {
    const { resolveModel } = await import('./config-query.js');
    await writeFile(
      join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({ model_profile: 'inherit' }),
    );
    const result = await resolveModel(['gsd-planner'], tmpDir);
    const data = result.data as Record<string, unknown>;
    expect(data.model).toBe('');
    expect(data.binding_kind).toBe('inherit');
    expect(data.resolved_model).toBe('inherit');
  });

  it('returns structured unsupported metadata for unknown agents', async () => {
    const { resolveModel } = await import('./config-query.js');
    await writeFile(
      join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({ model_profile: 'balanced' }),
    );
    const result = await resolveModel(['unknown-agent'], tmpDir);
    const data = result.data as Record<string, unknown>;
    expect(data.model).toBe('');
    expect(data.unsupported).toBe(true);
    expect(data.agent).toBe('unknown-agent');
    expect(data.runtime).toBe('claude');
    expect(data.rejection_reason).toBe('unknown-agent');
    expect(data.suggested_fix).toBeTruthy();
    expect((((data.runtime_model as Record<string, unknown>).binding as Record<string, unknown>).rejection_reason)).toBe('unknown-agent');
  });

  it('captures cross_ai_execution capability/config without implementing routing', async () => {
    const { resolveModel } = await import('./config-query.js');
    await writeFile(
      join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({
        model_profile: 'balanced',
        workflow: { cross_ai_execution: true, cross_ai_command: 'external-ai', cross_ai_timeout: 15 },
      }),
    );
    const result = await resolveModel(['gsd-planner'], tmpDir);
    const data = result.data as Record<string, unknown>;
    expect(data.cross_ai_execution_supported).toBe(true);
    expect(data.cross_ai_execution_configured).toBe(true);
    expect(data.model).toBe('opus');
    const runtimeModel = data.runtime_model as Record<string, unknown>;
    expect(((runtimeModel.cross_ai as Record<string, unknown>).execution_configured)).toBe(true);
    expect(((runtimeModel.cross_ai as Record<string, unknown>).command_configured)).toBe(true);
    expect(((runtimeModel.cross_ai as Record<string, unknown>).timeout_seconds)).toBe(15);
  });

  it('throws GSDError when no agent type provided', async () => {
    const { resolveModel } = await import('./config-query.js');
    await expect(resolveModel([], tmpDir)).rejects.toThrow(GSDError);
  });
});

describe('MODEL_PROFILES', () => {
  it('contains all 18 agent entries (sync with model-profiles.cjs)', async () => {
    const { MODEL_PROFILES } = await import('./config-query.js');
    expect(Object.keys(MODEL_PROFILES)).toHaveLength(18);
  });

  it('has quality/balanced/budget/adaptive for each agent', async () => {
    const { MODEL_PROFILES } = await import('./config-query.js');
    for (const agent of Object.keys(MODEL_PROFILES)) {
      expect(MODEL_PROFILES[agent]).toHaveProperty('quality');
      expect(MODEL_PROFILES[agent]).toHaveProperty('balanced');
      expect(MODEL_PROFILES[agent]).toHaveProperty('budget');
      expect(MODEL_PROFILES[agent]).toHaveProperty('adaptive');
    }
  });
});

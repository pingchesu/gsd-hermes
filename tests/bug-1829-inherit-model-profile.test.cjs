/**
 * Regression tests for bug #1829
 *
 * model_profile: "inherit" in .planning/config.json was not recognised as a
 * valid profile. resolveModelInternal() silently fell back to "balanced",
 * causing all agents to use "sonnet" instead of inheriting the parent model.
 *
 * Root cause in core.cjs:
 *   const profile = config.model_profile || 'balanced';
 *   const agentModels = MODEL_PROFILES[agentType];
 *   if (!agentModels) return 'sonnet';
 *   const resolved = agentModels[profile] || agentModels['balanced'] || 'sonnet';
 *   // agentModels['inherit'] is undefined → falls through to agentModels['balanced']
 *
 * Fix 1 (core.cjs): add early return — if (profile === 'inherit') return 'inherit';
 * Fix 2 (verify.cjs): add 'inherit' to validProfiles so it doesn't trigger W004.
 */

'use strict';

const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');

const { resolveModelInternal } = require('../get-shit-done/bin/lib/core.cjs');
const { pathToFileURL } = require('url');

const USER_GUIDE_PATH = path.join(__dirname, '..', 'docs', 'USER-GUIDE.md');
const KO_USER_GUIDE_PATH = path.join(__dirname, '..', 'docs', 'ko-KR', 'USER-GUIDE.md');
const JA_USER_GUIDE_PATH = path.join(__dirname, '..', 'docs', 'ja-JP', 'USER-GUIDE.md');
const KO_CONFIGURATION_PATH = path.join(__dirname, '..', 'docs', 'ko-KR', 'CONFIGURATION.md');

const SDK_RUNTIME_MODEL_VALIDATION_PATH = pathToFileURL(
  path.join(__dirname, '..', 'sdk', 'dist', 'query', 'runtime-model-validation.js')
).href;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function writeConfig(tmpDir, obj) {
  fs.writeFileSync(
    path.join(tmpDir, '.planning', 'config.json'),
    JSON.stringify(obj, null, 2)
  );
}

function writeMinimalProjectMd(tmpDir) {
  fs.writeFileSync(
    path.join(tmpDir, '.planning', 'PROJECT.md'),
    '# Project\n\n## What This Is\n\nContent.\n\n## Core Value\n\nContent.\n\n## Requirements\n\nContent.\n'
  );
}

function writeMinimalRoadmap(tmpDir) {
  fs.writeFileSync(
    path.join(tmpDir, '.planning', 'ROADMAP.md'),
    '# Roadmap\n\n### Phase 1: First Phase\n'
  );
}

function writeMinimalStateMd(tmpDir) {
  fs.writeFileSync(
    path.join(tmpDir, '.planning', 'STATE.md'),
    '# Session State\n\n## Current Position\n\nPhase: 1\n'
  );
}

// ─── resolveModelInternal — inherit profile ───────────────────────────────────

describe('bug #1829: model_profile "inherit" — resolveModelInternal', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('returns "inherit" for gsd-planner when model_profile is "inherit"', () => {
    writeConfig(tmpDir, { model_profile: 'inherit' });
    assert.strictEqual(resolveModelInternal(tmpDir, 'gsd-planner'), 'inherit');
  });

  test('returns "inherit" for gsd-executor when model_profile is "inherit"', () => {
    writeConfig(tmpDir, { model_profile: 'inherit' });
    assert.strictEqual(resolveModelInternal(tmpDir, 'gsd-executor'), 'inherit');
  });

  test('returns "inherit" for gsd-phase-researcher when model_profile is "inherit"', () => {
    writeConfig(tmpDir, { model_profile: 'inherit' });
    assert.strictEqual(resolveModelInternal(tmpDir, 'gsd-phase-researcher'), 'inherit');
  });

  test('returns "inherit" for gsd-codebase-mapper when model_profile is "inherit"', () => {
    writeConfig(tmpDir, { model_profile: 'inherit' });
    assert.strictEqual(resolveModelInternal(tmpDir, 'gsd-codebase-mapper'), 'inherit');
  });

  test('returns "inherit" for gsd-verifier when model_profile is "inherit"', () => {
    writeConfig(tmpDir, { model_profile: 'inherit' });
    assert.strictEqual(resolveModelInternal(tmpDir, 'gsd-verifier'), 'inherit');
  });

  test('returns empty string for unknown agent even with inherit profile', () => {
    writeConfig(tmpDir, { model_profile: 'inherit' });
    assert.strictEqual(resolveModelInternal(tmpDir, 'gsd-nonexistent'), '');
  });

  test('per-agent override takes precedence over inherit profile', () => {
    writeConfig(tmpDir, {
      model_profile: 'inherit',
      model_overrides: { 'gsd-executor': 'haiku' },
    });
    // Override wins even when profile is inherit
    assert.strictEqual(resolveModelInternal(tmpDir, 'gsd-executor'), 'haiku');
    // Other agents without override still inherit
    assert.strictEqual(resolveModelInternal(tmpDir, 'gsd-planner'), 'inherit');
  });

  test('does not silently fall back to "sonnet" (the original bug)', () => {
    writeConfig(tmpDir, { model_profile: 'inherit' });
    // Before the fix, this returned 'sonnet' (via balanced fallback)
    const model = resolveModelInternal(tmpDir, 'gsd-planner');
    assert.notStrictEqual(model, 'sonnet', 'inherit profile must not silently fall back to sonnet');
  });
});

// ─── resolve-model CLI — inherit profile ──────────────────────────────────────

describe('bug #1829: model_profile "inherit" — resolve-model CLI', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('CLI resolve-model returns "inherit" for gsd-executor with inherit profile', () => {
    fs.writeFileSync(
      path.join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({ model_profile: 'inherit' }, null, 2)
    );

    const result = runGsdTools('resolve-model gsd-executor', tmpDir);
    assert.ok(result.success, `resolve-model failed: ${result.error}`);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.model, 'inherit');
    assert.strictEqual(parsed.profile, 'inherit');
  });

  test('CLI resolve-model returns "inherit" for gsd-planner with inherit profile', () => {
    fs.writeFileSync(
      path.join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({ model_profile: 'inherit' }, null, 2)
    );

    const result = runGsdTools('resolve-model gsd-planner', tmpDir);
    assert.ok(result.success, `resolve-model failed: ${result.error}`);

    const parsed = JSON.parse(result.output);
    assert.strictEqual(parsed.model, 'inherit');
  });
});

// ─── verify health — inherit profile is not a validation error ────────────────

describe('bug #1829: model_profile "inherit" — validate health does not warn W004', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
    writeMinimalProjectMd(tmpDir);
    writeMinimalRoadmap(tmpDir);
    writeMinimalStateMd(tmpDir);
    fs.mkdirSync(path.join(tmpDir, '.planning', 'phases', '01-first-phase'), { recursive: true });
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('does not emit W004 for model_profile "inherit"', () => {
    fs.writeFileSync(
      path.join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({
        model_profile: 'inherit',
        workflow: {
          research: true,
          plan_check: true,
          verifier: true,
          nyquist_validation: true,
        },
      }, null, 2)
    );

    const result = runGsdTools('validate health', tmpDir);
    assert.ok(result.success, `validate health failed: ${result.error}`);

    const output = JSON.parse(result.output);
    assert.ok(
      !output.warnings.some(w => w.code === 'W004'),
      `inherit profile must not trigger W004: ${JSON.stringify(output.warnings)}`
    );
  });

  test('still emits W004 for genuinely invalid model_profile values', () => {
    fs.writeFileSync(
      path.join(tmpDir, '.planning', 'config.json'),
      JSON.stringify({ model_profile: 'invalid-profile' }, null, 2)
    );

    const result = runGsdTools('validate health', tmpDir);
    assert.ok(result.success, `validate health failed: ${result.error}`);

    const output = JSON.parse(result.output);
    assert.ok(
      output.warnings.some(w => w.code === 'W004'),
      `Invalid profile should trigger W004: ${JSON.stringify(output.warnings)}`
    );
  });
});

describe('Phase 6 migration-safe omit and inherit behavior', () => {
  test('runtime-default omission stays valid for codex when no unsupported explicit model is requested', async () => {
    const { validateAgentBindings } = await import(SDK_RUNTIME_MODEL_VALIDATION_PATH);
    const summary = validateAgentBindings({
      runtime: 'codex',
      model_profile: 'balanced',
      resolve_model_ids: 'omit',
      workflow: {
        research: true,
        plan_check: true,
        verifier: true,
        cross_ai_execution: false,
      },
    }, ['gsd-phase-researcher', 'gsd-planner', 'gsd-executor', 'gsd-verifier']);

    assert.strictEqual(summary.ok, true);
    assert.deepStrictEqual(summary.issues, []);
    assert.ok(summary.results.every(result => result.ok));
    assert.ok(summary.results.every(result => result.binding.bindingKind === 'runtime-default'));
  });

  test('inherit stays valid for codex when no unsupported explicit model is requested', async () => {
    const { validateAgentBindings } = await import(SDK_RUNTIME_MODEL_VALIDATION_PATH);
    const summary = validateAgentBindings({
      runtime: 'codex',
      model_profile: 'inherit',
      workflow: {
        research: true,
        plan_check: true,
        verifier: true,
        cross_ai_execution: false,
      },
    }, ['gsd-phase-researcher', 'gsd-planner', 'gsd-executor', 'gsd-verifier']);

    assert.strictEqual(summary.ok, true);
    assert.deepStrictEqual(summary.issues, []);
    assert.ok(summary.results.every(result => result.ok));
    assert.ok(summary.results.every(result => result.binding.bindingKind === 'inherit'));
  });
});

describe('Phase 8 migration guidance docs', () => {
  test('user guide states migration guidance is non-mutating', () => {
    const userGuide = fs.readFileSync(USER_GUIDE_PATH, 'utf8');
    assert.match(userGuide, /do not auto-rewrite/i);
    assert.match(userGuide, /cross_ai_execution/);
  });

  test('translated docs mention the migrated runtime-model choices', () => {
    const koUserGuide = fs.readFileSync(KO_USER_GUIDE_PATH, 'utf8');
    const jaUserGuide = fs.readFileSync(JA_USER_GUIDE_PATH, 'utf8');
    const koConfiguration = fs.readFileSync(KO_CONFIGURATION_PATH, 'utf8');

    assert.match(koUserGuide, /cross_ai_execution/);
    assert.match(jaUserGuide, /resolve_model_ids/);
    assert.match(koConfiguration, /cross_ai_execution/);
  });
});

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fsNative = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const CONFIG_PATH = path.join(__dirname, '..', 'get-shit-done', 'bin', 'lib', 'config.cjs');
const CONFIG_TEMPLATE_PATH = path.join(__dirname, '..', 'get-shit-done', 'templates', 'config.json');
const SDK_RUNTIME_MODEL_CONTRACT_PATH = pathToFileURL(
  path.join(__dirname, '..', 'sdk', 'dist', 'query', 'runtime-model-contract.js')
).href;
const SDK_RUNTIME_MODEL_VALIDATION_PATH = pathToFileURL(
  path.join(__dirname, '..', 'sdk', 'dist', 'query', 'runtime-model-validation.js')
).href;

describe('cross-AI execution contract surface', () => {
  describe('config keys', () => {
    test('workflow.cross_ai_execution is in VALID_CONFIG_KEYS', () => {
      const { VALID_CONFIG_KEYS } = require(CONFIG_PATH);
      assert.ok(VALID_CONFIG_KEYS.has('workflow.cross_ai_execution'));
    });

    test('workflow.cross_ai_command is in VALID_CONFIG_KEYS', () => {
      const { VALID_CONFIG_KEYS } = require(CONFIG_PATH);
      assert.ok(VALID_CONFIG_KEYS.has('workflow.cross_ai_command'));
    });

    test('workflow.cross_ai_timeout is in VALID_CONFIG_KEYS', () => {
      const { VALID_CONFIG_KEYS } = require(CONFIG_PATH);
      assert.ok(VALID_CONFIG_KEYS.has('workflow.cross_ai_timeout'));
    });
  });

  describe('config template defaults', () => {
    test('config template keeps cross_ai_execution disabled by default', () => {
      const template = JSON.parse(fsNative.readFileSync(CONFIG_TEMPLATE_PATH, 'utf-8'));
      assert.strictEqual(template.workflow.cross_ai_execution, false);
      assert.strictEqual(template.workflow.cross_ai_command, '');
      assert.strictEqual(template.workflow.cross_ai_timeout, 300);
    });
  });

  describe('sdk contract metadata', () => {
    test('resolveAgentBinding reports cross_ai_execution capability/config without claiming routing', async () => {
      const { resolveAgentBinding, toLegacyResolveModelResult } = await import(SDK_RUNTIME_MODEL_CONTRACT_PATH);
      const resolution = resolveAgentBinding({
        model_profile: 'balanced',
        workflow: {
          cross_ai_execution: true,
          cross_ai_command: 'external-ai',
          cross_ai_timeout: 15,
        },
      }, 'gsd-planner');
      const legacy = toLegacyResolveModelResult(resolution);

      assert.strictEqual(legacy.cross_ai_execution_supported, true);
      assert.strictEqual(legacy.cross_ai_execution_configured, true);
      assert.strictEqual(legacy.binding_kind, 'profile');
      assert.strictEqual(legacy.model, 'opus');
      assert.ok(!('route' in legacy), 'Phase 5 must expose recognition metadata, not routing state');
    });

    test('strict validation only recommends cross_ai_execution and does not auto-route', async () => {
      const { validateAgentBinding, formatBindingValidationError } = await import(SDK_RUNTIME_MODEL_VALIDATION_PATH);
      const result = validateAgentBinding({
        runtime: 'codex',
        model_profile: 'balanced',
        workflow: {
          cross_ai_execution: true,
          cross_ai_command: 'external-ai',
          cross_ai_timeout: 15,
        },
      }, 'gsd-planner');

      assert.strictEqual(result.ok, false);
      assert.ok(result.issue, 'expected a validation issue for codex + balanced planner');
      assert.strictEqual(result.issue.crossAiExecutionConfigured, true);
      assert.strictEqual(result.issue.crossAiExecutionRecommended, true);
      assert.strictEqual(result.issue.availableAlternative, 'cross_ai_execution');

      const message = formatBindingValidationError({
        ok: false,
        runtime: result.runtime,
        agents: [result.agent],
        results: [result],
        issues: [result.issue],
      }, 'planning step group');

      assert.match(message, /Cross-AI suggestion:/);
      assert.match(message, /will not auto-route into it/);
      assert.ok(!/route[:=]/i.test(message), 'Phase 6 should suggest cross_ai_execution without claiming active routing');
    });
  });
});

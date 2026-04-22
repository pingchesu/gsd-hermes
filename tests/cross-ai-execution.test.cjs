'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fsNative = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const CONFIG_PATH = path.join(__dirname, '..', 'get-shit-done', 'bin', 'lib', 'config.cjs');
const CONFIG_TEMPLATE_PATH = path.join(__dirname, '..', 'get-shit-done', 'templates', 'config.json');
const EXECUTE_PHASE_WORKFLOW_PATH = path.join(__dirname, '..', 'get-shit-done', 'workflows', 'execute-phase.md');
const CONFIGURATION_DOC_PATH = path.join(__dirname, '..', 'docs', 'CONFIGURATION.md');
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

    test('hermes accepts explicit mixed-provider bindings without cross-ai delegation', async () => {
      const { validateAgentBinding } = await import(SDK_RUNTIME_MODEL_VALIDATION_PATH);

      const anthropicPlanner = validateAgentBinding({
        runtime: 'hermes',
        model_profile: 'inherit',
        resolve_model_ids: 'omit',
        model_overrides: { 'gsd-planner': 'claude-opus-4-7' },
        workflow: { cross_ai_execution: false },
      }, 'gsd-planner');

      const openAiChecker = validateAgentBinding({
        runtime: 'hermes',
        model_profile: 'inherit',
        resolve_model_ids: 'omit',
        model_overrides: { 'gsd-plan-checker': 'openai/gpt-5.4' },
        workflow: { cross_ai_execution: false },
      }, 'gsd-plan-checker');

      assert.strictEqual(anthropicPlanner.ok, true);
      assert.strictEqual(anthropicPlanner.issue, null);
      assert.strictEqual(openAiChecker.ok, true);
      assert.strictEqual(openAiChecker.issue, null);
    });

    test('cross-AI routing precedence is CLI > config > frontmatter', async () => {
      const { resolveCrossAiRouting } = await import(SDK_RUNTIME_MODEL_VALIDATION_PATH);

      const disabledByCli = resolveCrossAiRouting({
        cliDisabled: true,
        cliForce: true,
        configCrossAiExecution: true,
        planFrontmatterCrossAi: true,
      });
      assert.strictEqual(disabledByCli.decision, 'disabled');
      assert.strictEqual(disabledByCli.source, 'cli');

      const forcedByCli = resolveCrossAiRouting({
        cliForce: true,
        configCrossAiExecution: false,
        planFrontmatterCrossAi: false,
      });
      assert.strictEqual(forcedByCli.decision, 'forced');
      assert.strictEqual(forcedByCli.source, 'cli');

      const configWinsOverFrontmatter = resolveCrossAiRouting({
        configCrossAiExecution: false,
        planFrontmatterCrossAi: true,
      });
      assert.strictEqual(configWinsOverFrontmatter.decision, 'disabled');
      assert.strictEqual(configWinsOverFrontmatter.source, 'config');

      const frontmatterFallback = resolveCrossAiRouting({
        planFrontmatterCrossAi: true,
      });
      assert.strictEqual(frontmatterFallback.decision, 'required');
      assert.strictEqual(frontmatterFallback.source, 'frontmatter');
    });

    test('valid direct Hermes binding is preferred over config or frontmatter cross-AI requests', async () => {
      const { resolveCrossAiRouting } = await import(SDK_RUNTIME_MODEL_VALIDATION_PATH);

      const routing = resolveCrossAiRouting({
        configCrossAiExecution: true,
        planFrontmatterCrossAi: true,
        directRuntimeBindingValid: true,
      });

      assert.strictEqual(routing.decision, 'direct');
      assert.strictEqual(routing.shouldUseCrossAi, false);
      assert.strictEqual(routing.source, 'direct-binding');
    });

    test('cross-AI required runs fail early when cross_ai_command is missing', async () => {
      const { evaluateCrossAiExecutionResult, resolveCrossAiRouting } = await import(SDK_RUNTIME_MODEL_VALIDATION_PATH);

      const result = evaluateCrossAiExecutionResult({
        routing: resolveCrossAiRouting({ configCrossAiExecution: true }),
        crossAiCommand: '   ',
        exitCode: 0,
        summaryText: '## Summary\nCompleted successfully.\n\n## What Changed\n- Added tests.\n\n## Verification\n- node --test tests/cross-ai-execution.test.cjs',
      });

      assert.strictEqual(result.ok, false);
      assert.strictEqual(result.failureKind, 'missing-command');
      assert.match(result.reason, /workflow\.cross_ai_command/);
    });

    test('cross-AI result handling distinguishes timeout, non-zero exit, malformed summary, and partial execution', async () => {
      const { evaluateCrossAiExecutionResult, resolveCrossAiRouting } = await import(SDK_RUNTIME_MODEL_VALIDATION_PATH);
      const routing = resolveCrossAiRouting({ configCrossAiExecution: true });

      const timedOut = evaluateCrossAiExecutionResult({
        routing,
        crossAiCommand: 'external-ai',
        exitCode: 124,
        timedOut: true,
      });
      assert.strictEqual(timedOut.failureKind, 'timeout');

      const failedExit = evaluateCrossAiExecutionResult({
        routing,
        crossAiCommand: 'external-ai',
        exitCode: 7,
      });
      assert.strictEqual(failedExit.failureKind, 'non-zero-exit');

      const malformed = evaluateCrossAiExecutionResult({
        routing,
        crossAiCommand: 'external-ai',
        exitCode: 0,
        summaryText: 'finished successfully',
      });
      assert.strictEqual(malformed.failureKind, 'malformed-summary');
      assert.deepStrictEqual(malformed.summaryValidation.missingSections, [
        'completion summary',
        'what changed',
        'verification results',
      ]);

      const partial = evaluateCrossAiExecutionResult({
        routing,
        crossAiCommand: 'external-ai',
        exitCode: 0,
        summaryText: [
          '## Summary',
          'Partial execution completed.',
          '',
          '## What Changed',
          '- Updated one file.',
          '',
          '## Verification',
          '- Verification not run.',
          '',
          '## Deviations',
          '- Remaining tasks left unfinished.',
        ].join('\n'),
      });
      assert.strictEqual(partial.failureKind, 'partial-execution');
    });

    test('valid external SUMMARY contract is accepted', async () => {
      const { evaluateCrossAiExecutionResult, resolveCrossAiRouting } = await import(SDK_RUNTIME_MODEL_VALIDATION_PATH);

      const result = evaluateCrossAiExecutionResult({
        routing: resolveCrossAiRouting({ configCrossAiExecution: true }),
        crossAiCommand: 'external-ai',
        exitCode: 0,
        summaryText: [
          '## Outcome',
          'Completed Phase 07 Plan 07-01 successfully.',
          '',
          '## What Changed',
          '- Updated workflow routing rules.',
          '- Added regression tests.',
          '',
          '## Verification',
          '- node --test tests/cross-ai-execution.test.cjs',
        ].join('\n'),
      });

      assert.strictEqual(result.ok, true);
      assert.strictEqual(result.failureKind, null);
    });
  });

  describe('workflow and docs contract text', () => {
    test('execute-phase workflow documents deterministic routing precedence and hardened failure handling', () => {
      const workflow = fsNative.readFileSync(EXECUTE_PHASE_WORKFLOW_PATH, 'utf-8');

      assert.match(workflow, /CLI flags override config, and config overrides plan frontmatter/i);
      assert.match(workflow, /Missing `workflow\.cross_ai_command` is a fail-fast error whenever routing requires cross-AI/i);
      assert.match(workflow, /timeout, non-zero exit, malformed summary, and partial execution/i);
      assert.match(workflow, /Hermes mixed-provider direct bindings remain on the normal direct execution path unless cross-AI is explicitly forced/i);
    });

    test('configuration docs describe explicit command requirement and minimum SUMMARY contract', () => {
      const docs = fsNative.readFileSync(CONFIGURATION_DOC_PATH, 'utf-8');

      assert.match(docs, /CLI flags > config > plan frontmatter/i);
      assert.match(docs, /Required when cross-AI routing is enabled or forced/i);
      assert.match(docs, /completion summary, what changed, verification results/i);
      assert.match(docs, /Hermes mixed-provider direct bindings remain a direct runtime path/i);
    });
  });
});

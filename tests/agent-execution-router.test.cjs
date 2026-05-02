'use strict';

const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const { createTempProject, cleanup } = require('./helpers.cjs');

const ROOT = path.join(__dirname, '..');
const SDK_ROUTER_PATH = pathToFileURL(
  path.join(ROOT, 'sdk', 'dist', 'query', 'agent-execution-router.js')
).href;
const SDK_CONTRACT_PATH = pathToFileURL(
  path.join(ROOT, 'sdk', 'dist', 'query', 'runtime-model-contract.js')
).href;
const GSD_SDK_BIN = path.join(ROOT, 'bin', 'gsd-sdk.js');

function writeConfig(tmpDir, config) {
  fs.writeFileSync(
    path.join(tmpDir, '.planning', 'config.json'),
    JSON.stringify(config, null, 2)
  );
}

function writeRoadmap(tmpDir) {
  fs.writeFileSync(
    path.join(tmpDir, '.planning', 'ROADMAP.md'),
    [
      '# Roadmap',
      '',
      '| # | Phase | Goal | Requirements | Success Criteria |',
      '|---|-------|------|--------------|------------------|',
      '| 8.1 | Execution Binding Resolver | Test provider routing. | ROUTE-01 | 1 |',
      '',
      '### Phase 8.1: Execution Binding Resolver',
      '',
      '**Goal:** Test provider routing.',
      '',
    ].join('\n')
  );
}

function runSdkJson(tmpDir, args) {
  const output = execFileSync(process.execPath, [GSD_SDK_BIN, ...args], {
    cwd: tmpDir,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      GSD_SESSION_KEY: '',
      CODEX_THREAD_ID: '',
      CLAUDE_SESSION_ID: '',
      OPENCODE_SESSION_ID: '',
      GEMINI_SESSION_ID: '',
      CURSOR_SESSION_ID: '',
      WINDSURF_SESSION_ID: '',
    },
  });
  return JSON.parse(output);
}

describe('provider-routed agent execution bindings', () => {
  let router;
  let contract;

  beforeEach(async () => {
    router = await import(SDK_ROUTER_PATH);
    contract = await import(SDK_CONTRACT_PATH);
  });

  test('routes Anthropic/Claude explicit overrides to claude-cli with normalized CLI model', () => {
    const receipt = contract.toRuntimeModelReceipt(
      contract.resolveAgentBinding({
        runtime: 'hermes',
        resolve_model_ids: 'omit',
        model_overrides: { 'gsd-executor': 'anthropic/claude-opus-4-7' },
        workflow: { agent_execution_router: 'provider-cli' },
      }, 'gsd-executor'),
      'executor'
    );

    const binding = router.resolveAgentExecutionBinding(receipt);
    assert.equal(binding.status, 'resolved');
    assert.equal(binding.provider_family, 'anthropic');
    assert.equal(binding.execution_driver, 'claude-cli');
    assert.equal(binding.cli_model, 'claude-opus-4-7');
    assert.equal(binding.strict, true);
  });

  test('routes OpenAI/GPT explicit overrides to codex-cli with normalized CLI model', () => {
    const receipt = contract.toRuntimeModelReceipt(
      contract.resolveAgentBinding({
        runtime: 'hermes',
        resolve_model_ids: 'omit',
        model_overrides: { 'gsd-executor': 'openai/gpt-5.5' },
        workflow: { agent_execution_router: 'provider-cli' },
      }, 'gsd-executor'),
      'executor'
    );

    const binding = router.resolveAgentExecutionBinding(receipt);
    assert.equal(binding.status, 'resolved');
    assert.equal(binding.provider_family, 'openai');
    assert.equal(binding.execution_driver, 'codex-cli');
    assert.equal(binding.cli_model, 'gpt-5.5');
    assert.equal(binding.strict, true);
  });

  test('routes explicit overrides through Hermes chat when requested by config', () => {
    const receipt = contract.toRuntimeModelReceipt(
      contract.resolveAgentBinding({
        runtime: 'hermes',
        resolve_model_ids: 'omit',
        model_overrides: { 'gsd-executor': 'openai/gpt-5.5' },
        workflow: {
          agent_execution_router: 'provider-cli',
          agent_execution_driver: 'hermes-chat',
        },
      }, 'gsd-executor'),
      'executor'
    );

    const binding = router.resolveAgentExecutionBinding(receipt, { driverPreference: 'hermes-chat' });
    assert.equal(binding.status, 'resolved');
    assert.equal(binding.provider_family, 'openai');
    assert.equal(binding.execution_driver, 'hermes-chat');
    assert.equal(binding.cli_model, 'openai/gpt-5.5');
    assert.equal(binding.strict, true);
    assert.match(binding.diagnostic, /Hermes chat/i);
  });

  test('routes explicit overrides through Hermes terminal tool when requested by config', () => {
    const receipt = contract.toRuntimeModelReceipt(
      contract.resolveAgentBinding({
        runtime: 'hermes',
        resolve_model_ids: 'omit',
        model_overrides: { 'gsd-executor': 'anthropic/claude-opus-4-7' },
        workflow: {
          agent_execution_router: 'provider-cli',
          agent_execution_driver: 'hermes-terminal-tool',
        },
      }, 'gsd-executor'),
      'executor'
    );

    const binding = router.resolveAgentExecutionBinding(receipt, { driverPreference: 'hermes-terminal-tool' });
    assert.equal(binding.status, 'resolved');
    assert.equal(binding.provider_family, 'anthropic');
    assert.equal(binding.execution_driver, 'hermes-terminal-tool');
    assert.equal(binding.cli_model, 'anthropic/claude-opus-4-7');
    assert.equal(binding.strict, true);
    assert.match(binding.diagnostic, /Hermes terminal tool/i);
  });

  test('routes bare provider-family model tokens to the same CLI drivers', () => {
    const cases = [
      ['gpt-5.5', 'openai', 'codex-cli', 'gpt-5.5'],
      ['claude-opus-4-7', 'anthropic', 'claude-cli', 'claude-opus-4-7'],
    ];

    for (const [model, providerFamily, executionDriver, cliModel] of cases) {
      const receipt = contract.toRuntimeModelReceipt(
        contract.resolveAgentBinding({
          runtime: 'hermes',
          resolve_model_ids: 'omit',
          model_overrides: { 'gsd-executor': model },
          workflow: { agent_execution_router: 'provider-cli' },
        }, 'gsd-executor'),
        'executor'
      );
      const binding = router.resolveAgentExecutionBinding(receipt);
      assert.equal(binding.status, 'resolved');
      assert.equal(binding.provider_family, providerFamily);
      assert.equal(binding.execution_driver, executionDriver);
      assert.equal(binding.cli_model, cliModel);
    }
  });

  test('does not build execution bindings unless workflow.agent_execution_router is provider-cli', () => {
    const receipt = contract.toRuntimeModelReceipt(
      contract.resolveAgentBinding({
        runtime: 'hermes',
        resolve_model_ids: 'omit',
        model_overrides: { 'gsd-executor': 'openai/gpt-5.5' },
        workflow: {},
      }, 'gsd-executor'),
      'executor'
    );
    const bindings = router.buildAgentExecutionBindings(
      { workflow: {} },
      { agents: { executor: receipt } }
    );
    assert.equal(bindings, null);
  });

  test('unknown providers fail fast without choosing claude-cli or codex-cli', () => {
    const receipt = contract.toRuntimeModelReceipt(
      contract.resolveAgentBinding({
        runtime: 'hermes',
        resolve_model_ids: 'omit',
        model_overrides: { 'gsd-executor': 'mistral/large-latest' },
        workflow: { agent_execution_router: 'provider-cli' },
      }, 'gsd-executor'),
      'executor'
    );

    const binding = router.resolveAgentExecutionBinding(receipt);
    assert.equal(binding.status, 'unsupported');
    assert.equal(binding.execution_driver, 'unsupported');
    assert.equal(binding.cli_model, null);
    assert.match(binding.diagnostic, /does not support provider family 'unknown'/);
    assert.doesNotMatch(JSON.stringify(binding), /claude -p|codex exec/);
  });
});

describe('init.execute-phase provider-routed bindings', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
    writeRoadmap(tmpDir);
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('emits executor codex-cli and verifier claude-cli bindings when provider-cli router is enabled', () => {
    writeConfig(tmpDir, {
      runtime: 'hermes',
      resolve_model_ids: 'omit',
      model_overrides: {
        'gsd-executor': 'openai/gpt-5.5',
        'gsd-verifier': 'anthropic/claude-opus-4-7',
      },
      workflow: { agent_execution_router: 'provider-cli' },
    });

    const json = runSdkJson(tmpDir, ['query', 'init.execute-phase', '8.1']);
    assert.equal(json.executor_model, 'openai/gpt-5.5');
    assert.equal(json.verifier_model, 'anthropic/claude-opus-4-7');
    assert.equal(json.agent_execution_bindings.router, 'provider-cli');
    assert.equal(json.agent_execution_bindings.agents.executor.execution_driver, 'codex-cli');
    assert.equal(json.agent_execution_bindings.agents.executor.cli_model, 'gpt-5.5');
    assert.equal(json.agent_execution_bindings.agents.verifier.execution_driver, 'claude-cli');
    assert.equal(json.agent_execution_bindings.agents.verifier.cli_model, 'claude-opus-4-7');
  });

  test('init.execute-phase emits Hermes-native driver bindings from workflow.agent_execution_driver', () => {
    writeConfig(tmpDir, {
      runtime: 'hermes',
      resolve_model_ids: 'omit',
      model_overrides: {
        'gsd-executor': 'openai/gpt-5.5',
        'gsd-verifier': 'anthropic/claude-opus-4-7',
      },
      workflow: {
        agent_execution_router: 'provider-cli',
        agent_execution_driver: 'hermes-terminal-tool',
      },
    });

    const json = runSdkJson(tmpDir, ['query', 'init.execute-phase', '8.1']);
    assert.equal(json.agent_execution_bindings.router, 'provider-cli');
    assert.equal(json.agent_execution_bindings.driver_preference, 'hermes-terminal-tool');
    assert.equal(json.agent_execution_bindings.agents.executor.execution_driver, 'hermes-terminal-tool');
    assert.equal(json.agent_execution_bindings.agents.executor.cli_model, 'openai/gpt-5.5');
    assert.equal(json.agent_execution_bindings.agents.verifier.execution_driver, 'hermes-terminal-tool');
    assert.equal(json.agent_execution_bindings.agents.verifier.cli_model, 'anthropic/claude-opus-4-7');
  });

  test('omits agent_execution_bindings when provider-cli router is disabled', () => {
    writeConfig(tmpDir, {
      runtime: 'hermes',
      resolve_model_ids: 'omit',
      model_overrides: { 'gsd-executor': 'openai/gpt-5.5' },
      workflow: {},
    });

    const json = runSdkJson(tmpDir, ['query', 'init.execute-phase', '8.1']);
    assert.equal(Object.prototype.hasOwnProperty.call(json, 'agent_execution_bindings'), false);
  });
});

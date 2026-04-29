'use strict';

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const GSD_SDK_BIN = path.join(ROOT, 'bin', 'gsd-sdk.js');
const EXECUTE_PHASE = path.join(ROOT, 'get-shit-done', 'workflows', 'execute-phase.md');

function runCurrentRepoInit(phase = '8.3') {
  const output = execFileSync(process.execPath, [GSD_SDK_BIN, 'query', 'init.execute-phase', phase], {
    cwd: ROOT,
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

describe('Hermes provider-routed execution regression fixture', () => {
  test('current planning config routes executor to Codex and verifier to Claude', () => {
    const init = runCurrentRepoInit('8.3');
    const bindings = init.agent_execution_bindings;

    assert.equal(bindings.router, 'provider-cli');
    assert.equal(bindings.strict, true);

    const executor = bindings.agents.executor;
    assert.equal(executor.agent, 'gsd-executor');
    assert.equal(executor.status, 'resolved');
    assert.equal(executor.configured_model, 'openai/gpt-5.5');
    assert.equal(executor.provider_family, 'openai');
    assert.equal(executor.execution_driver, 'codex-cli');
    assert.equal(executor.cli_model, 'gpt-5.5');

    const verifier = bindings.agents.verifier;
    assert.equal(verifier.agent, 'gsd-verifier');
    assert.equal(verifier.status, 'resolved');
    assert.equal(verifier.configured_model, 'anthropic/claude-opus-4-7');
    assert.equal(verifier.provider_family, 'anthropic');
    assert.equal(verifier.execution_driver, 'claude-cli');
    assert.equal(verifier.cli_model, 'claude-opus-4-7');
  });

  test('init payload does not inject degraded runtime note that reroutes OpenAI through Claude', () => {
    const init = runCurrentRepoInit('8.3');
    const serialized = JSON.stringify(init);

    assert.doesNotMatch(serialized, /Hermes native delegate_task is unavailable/i);
    assert.doesNotMatch(serialized, /invoked via Claude Code CLI as the canonical `gsd-executor` agent/i);
    assert.doesNotMatch(serialized, /openai\/gpt-5\.5[\s\S]{0,200}claude -p/i);
  });
});

describe('execute-phase provider-cli workflow guardrails', () => {
  test('workflow keeps provider-cli as canonical direct binding before legacy fallback', () => {
    const workflow = require('node:fs').readFileSync(EXECUTE_PHASE, 'utf8');

    assert.match(workflow, /agent_execution_bindings\.router == "provider-cli"/);
    assert.match(workflow, /Provider CLI execution receipt/);
    assert.match(workflow, /Proof boundary: provider-cli proves deterministic CLI driver selection/);
    assert.match(workflow, /canonical driver selection/);
    assert.match(workflow, /codex exec --model/);
    assert.match(workflow, /claude -p --model/);
    assert.match(workflow, /legacy whole-plan fallback, lower priority than provider-cli/i);
    assert.match(workflow, /do not let legacy `cross_ai_execution` override valid provider-routed bindings/);
    assert.match(workflow, /valid OpenAI\/GPT binding from being silently rerouted to an unrelated `claude -p` fallback/);
  });

  test('workflow does not describe cross_ai_execution as overriding provider-cli', () => {
    const workflow = require('node:fs').readFileSync(EXECUTE_PHASE, 'utf8');

    assert.doesNotMatch(workflow, /cross_ai_execution[^\n]{0,120}overrides[^\n]{0,120}provider-cli/i);
    assert.doesNotMatch(workflow, /provider-cli[^\n]{0,120}lower priority[^\n]{0,120}cross_ai_execution/i);
    assert.doesNotMatch(workflow, /OpenAI[^\n]{0,120}fallback[^\n]{0,120}claude -p/i);
  });
});

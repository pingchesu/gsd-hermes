'use strict';
// allow-test-rule: Hermes downstream regression tests intentionally assert installer/docs/CLI text contracts where no typed IR exists yet.

const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const HELPER = require('../get-shit-done/bin/lib/provider-cli-dispatch.cjs');
const CLI = path.join(ROOT, 'get-shit-done', 'bin', 'gsd-provider-cli-dispatch.cjs');

const OPENAI_BINDING = {
  agent: 'gsd-executor',
  role: 'executor',
  status: 'resolved',
  configured_model: 'openai/gpt-5.5',
  provider_family: 'openai',
  execution_driver: 'codex-cli',
  cli_model: 'gpt-5.5',
  source: 'override',
  strict: true,
  diagnostic: 'test',
  suggested_fix: null,
};

const ANTHROPIC_BINDING = {
  agent: 'gsd-verifier',
  role: 'verifier',
  status: 'resolved',
  configured_model: 'anthropic/claude-opus-4-7',
  provider_family: 'anthropic',
  execution_driver: 'claude-cli',
  cli_model: 'claude-opus-4-7',
  source: 'override',
  strict: true,
  diagnostic: 'test',
  suggested_fix: null,
};

const HERMES_CHAT_BINDING = {
  ...OPENAI_BINDING,
  execution_driver: 'hermes-chat',
  cli_model: 'gpt-5.5',
  diagnostic: 'test hermes chat',
};

const HERMES_TERMINAL_BINDING = {
  ...ANTHROPIC_BINDING,
  execution_driver: 'hermes-terminal-tool',
  cli_model: 'claude-opus-4-7',
  diagnostic: 'test hermes terminal tool',
};

describe('provider CLI dispatch helper', () => {
  test('renders OpenAI bindings as Codex CLI commands without inspecting model strings', () => {
    const command = HELPER.renderProviderCliCommand(OPENAI_BINDING, {
      workdir: ROOT,
      prompt_path: '/tmp/plan.md',
      agent_name: 'gsd-executor',
    });

    assert.equal(command.driver, 'codex-cli');
    assert.deepEqual(command.argv.slice(0, 4), ['codex', 'exec', '--model', 'gpt-5.5']);
    assert.equal(command.argv.includes('claude'), false);
    assert.equal(command.argv.includes('--agent'), false);
    assert.match(command.display, /^codex exec --model gpt-5\.5 /);
    assert.doesNotMatch(command.display, /claude/);
    assert.doesNotMatch(command.display, /claude -p/);
    assert.doesNotMatch(command.argv.join(' '), /claude|--agent/);
  });

  test('renders Anthropic bindings as Claude CLI commands without using Codex', () => {
    const command = HELPER.renderProviderCliCommand(ANTHROPIC_BINDING, {
      workdir: ROOT,
      prompt_path: '/tmp/verify.md',
      agent_name: 'gsd-verifier',
    });

    assert.equal(command.driver, 'claude-cli');
    assert.deepEqual(command.argv.slice(0, 4), ['claude', '-p', '--model', 'claude-opus-4-7']);
    assert.equal(command.argv.includes('codex'), false);
    assert.match(command.display, /^claude -p --model claude-opus-4-7 /);
    assert.doesNotMatch(command.display, /codex/);
    assert.doesNotMatch(command.display, /codex exec/);
    assert.doesNotMatch(command.argv.join(' '), /codex|--full-auto/);
  });

  test('unsupported bindings fail fast with actionable binding details', () => {
    assert.throws(
      () => HELPER.renderProviderCliCommand({
        agent: 'gsd-executor',
        status: 'unsupported',
        configured_model: 'mistral/large-latest',
        provider_family: 'unknown',
        execution_driver: 'unsupported',
        cli_model: null,
        suggested_fix: 'Use supported provider.',
      }, { workdir: ROOT, prompt_path: '/tmp/plan.md' }),
      /execution_driver.*unsupported.*configured_model.*mistral\/large-latest.*provider_family.*unknown/s
    );
  });

  test('shell-quotes display paths while keeping prompt content out of argv', () => {
    const command = HELPER.renderProviderCliCommand(OPENAI_BINDING, {
      workdir: '/tmp/gsd workdir/with spaces',
      prompt_path: "/tmp/provider cli/plan's prompt.md",
      agent_name: 'gsd-executor',
    });

    assert.equal(command.stdin_path, "/tmp/provider cli/plan's prompt.md");
    assert.deepEqual(command.argv.slice(0, 6), ['codex', 'exec', '--model', 'gpt-5.5', '--full-auto', '-C']);
    assert.equal(command.argv[6], '/tmp/gsd workdir/with spaces');
    assert.match(command.display, /'\/tmp\/gsd workdir\/with spaces'/);
    assert.match(command.display, /< '\/tmp\/provider cli\/plan'"'"'s prompt\.md'/);
    assert.doesNotMatch(command.display, /prompt content|<objective>|model_overrides/);
  });

  test('bindings missing cli_model fail before command rendering', () => {
    assert.throws(
      () => HELPER.renderProviderCliCommand({
        ...OPENAI_BINDING,
        cli_model: null,
      }, { workdir: ROOT, prompt_path: '/tmp/plan.md' }),
      /missing cli_model.*configured_model.*openai\/gpt-5\.5/s
    );
  });

  test('preflight reports missing CLI without making provider calls', () => {
    const result = HELPER.preflightProviderCliDriver(OPENAI_BINDING, { PATH: '/definitely/missing' });
    assert.equal(result.ok, false);
    assert.equal(result.driver, 'codex-cli');
    assert.equal(result.command, 'codex');
    assert.match(result.message, /codex.*not found|codex.*not found|'codex' CLI was not found/i);
  });

  test('renders Hermes chat bindings without falling back to Claude or Codex', () => {
    const command = HELPER.renderProviderCliCommand(HERMES_CHAT_BINDING, {
      workdir: ROOT,
      prompt_path: '/tmp/plan.md',
      agent_name: 'gsd-executor',
    });

    assert.equal(command.driver, 'hermes-chat');
    assert.deepEqual(command.argv.slice(0, 4), ['hermes', 'chat', '--quiet', '--source']);
    assert.equal(command.argv.includes('--model'), true);
    assert.equal(command.argv[command.argv.indexOf('--model') + 1], 'gpt-5.5');
    assert.equal(command.argv.includes('--provider'), false);
    assert.equal(command.argv.includes('claude'), false);
    assert.equal(command.argv.includes('codex'), false);
    assert.match(command.display, /hermes chat .*--model gpt-5\.5/);
    assert.doesNotMatch(command.display, /claude -p|codex exec/);
  });

  test('Hermes terminal tool bindings enable terminal and file toolsets', () => {
    const command = HELPER.renderProviderCliCommand(HERMES_TERMINAL_BINDING, {
      workdir: ROOT,
      prompt_path: '/tmp/verify.md',
      agent_name: 'gsd-verifier',
    });

    assert.equal(command.driver, 'hermes-terminal-tool');
    assert.equal(command.argv[0], 'hermes');
    assert.equal(command.argv.includes('--toolsets'), true);
    assert.equal(command.argv[command.argv.indexOf('--toolsets') + 1], 'terminal,file');
    assert.equal(command.argv.includes('--model'), true);
    assert.equal(command.argv[command.argv.indexOf('--model') + 1], 'claude-opus-4-7');
    assert.equal(command.argv.includes('--provider'), false);
    assert.doesNotMatch(command.display, /--provider|claude -p|codex exec/);
  });

  test('preflight reports missing Hermes CLI for Hermes-native drivers', () => {
    const result = HELPER.preflightProviderCliDriver(HERMES_CHAT_BINDING, { PATH: '/definitely/missing' });
    assert.equal(result.ok, false);
    assert.equal(result.driver, 'hermes-chat');
    assert.equal(result.command, 'hermes');
    assert.match(result.message, /hermes.*not found|'hermes' CLI was not found/i);
  });
});

describe('provider CLI dispatch wrapper', () => {
  test('prints command metadata as JSON', () => {
    const output = execFileSync(process.execPath, [
      CLI,
      'command',
      '--binding-json', JSON.stringify(OPENAI_BINDING),
      '--prompt-path', '/tmp/plan.md',
      '--workdir', ROOT,
      '--agent-name', 'gsd-executor',
    ], { encoding: 'utf8' });
    const parsed = JSON.parse(output);
    assert.equal(parsed.driver, 'codex-cli');
    assert.equal(parsed.argv[0], 'codex');
    assert.match(parsed.display, /codex exec --model gpt-5\.5/);
  });

  test('returns non-zero for unsupported preflight', () => {
    const result = spawnSync(process.execPath, [
      CLI,
      'preflight',
      '--binding-json', JSON.stringify({
        agent: 'gsd-executor',
        status: 'unsupported',
        configured_model: 'mistral/large-latest',
        provider_family: 'unknown',
        execution_driver: 'unsupported',
        cli_model: null,
        suggested_fix: 'Use supported provider.',
      }),
    ], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /unsupported provider CLI binding/i);
  });
});

'use strict';

/**
 * Downstream gsd-hermes provider routing glue.
 *
 * This helper consumes Phase 8.1 SDK `agent_execution_bindings` and renders
 * deterministic CLI command metadata for workflows. It deliberately branches on
 * `binding.execution_driver` only; provider/model-family detection belongs in
 * the SDK resolver, not in workflow prose or command rendering.
 *
 * Proof boundary: this module proves driver/model argument selection and local
 * CLI availability. It does not prove wire-level API provider enforcement, npm
 * auth, or cloud credentials. Phase 8.3 adds stricter regression coverage.
 */

const { spawnSync } = require('node:child_process');

function shellQuote(value) {
  const text = String(value ?? '');
  if (/^[A-Za-z0-9_/:=@%+.,~.-]+$/.test(text)) return text;
  return `'${text.replace(/'/g, `'"'"'`)}'`;
}

function normalizeBinding(binding) {
  if (!binding || typeof binding !== 'object' || Array.isArray(binding)) {
    throw new Error('Provider CLI binding must be an object.');
  }
  return binding;
}

function bindingError(binding, message) {
  const details = {
    execution_driver: binding && binding.execution_driver != null ? binding.execution_driver : null,
    agent: binding && binding.agent != null ? binding.agent : null,
    configured_model: binding && binding.configured_model != null ? binding.configured_model : null,
    provider_family: binding && binding.provider_family != null ? binding.provider_family : null,
    suggested_fix: binding && binding.suggested_fix != null ? binding.suggested_fix : null,
  };
  return new Error(`${message} ${JSON.stringify(details)}`);
}

function requireOption(options, key) {
  const value = options && options[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Provider CLI command rendering requires option '${key}'.`);
  }
  return value;
}

function renderProviderCliReceipt(binding) {
  const normalized = normalizeBinding(binding);
  return {
    agent: normalized.agent || null,
    role: normalized.role || null,
    status: normalized.status || null,
    configured_model: normalized.configured_model || null,
    provider_family: normalized.provider_family || 'unknown',
    execution_driver: normalized.execution_driver || 'unsupported',
    cli_model: normalized.cli_model || null,
    source: normalized.source || null,
    strict: normalized.strict === true,
    diagnostic: normalized.diagnostic || null,
    suggested_fix: normalized.suggested_fix || null,
  };
}

function providerNameForHermes(providerFamily) {
  if (providerFamily === 'openai') return 'openai';
  if (providerFamily === 'anthropic') return 'anthropic';
  if (providerFamily === 'google') return 'google';
  return null;
}

function renderHermesDisplay(argv, promptPath, workdir) {
  const prefix = `cd ${shellQuote(workdir)} && `;
  const queryIndex = argv.indexOf('--query');
  const printable = queryIndex === -1
    ? argv
    : [
        ...argv.slice(0, queryIndex + 1),
        `$(cat ${shellQuote(promptPath)})`,
        ...argv.slice(queryIndex + 2),
      ];
  return `${prefix}${printable.map((value, index) => (
    index === queryIndex + 1 && queryIndex !== -1 ? value : shellQuote(value)
  )).join(' ')}`;
}

function renderProviderCliCommand(binding, options = {}) {
  const normalized = normalizeBinding(binding);
  const driver = normalized.execution_driver;
  const promptPath = requireOption(options, 'prompt_path');
  const workdir = requireOption(options, 'workdir');
  const agentName = options.agent_name || normalized.agent || normalized.role;
  const cliModel = normalized.cli_model;

  if (normalized.status !== 'resolved') {
    throw bindingError(normalized, 'Provider CLI binding is not resolved.');
  }
  if (typeof cliModel !== 'string' || !cliModel.trim()) {
    throw bindingError(normalized, 'Provider CLI binding is missing cli_model.');
  }

  let argv;
  let display;
  if (driver === 'claude-cli') {
    if (typeof agentName !== 'string' || !agentName.trim()) {
      throw bindingError(normalized, 'Claude CLI command rendering requires agent name.');
    }
    argv = [
      'claude',
      '-p',
      '--model', cliModel,
      '--agent', agentName,
      '--permission-mode', 'acceptEdits',
    ];
  } else if (driver === 'codex-cli') {
    argv = [
      'codex',
      'exec',
      '--model', cliModel,
      '--full-auto',
      '-C', workdir,
    ];
  } else if (driver === 'hermes-chat' || driver === 'hermes-terminal-tool') {
    const provider = providerNameForHermes(normalized.provider_family);
    if (!provider) {
      throw bindingError(normalized, 'Hermes-native command rendering requires a supported provider_family.');
    }
    argv = [
      'hermes',
      'chat',
      '--quiet',
      '--source', 'gsd-provider-cli',
      '--model', cliModel,
      '--provider', provider,
    ];
    if (driver === 'hermes-terminal-tool') {
      argv.push('--toolsets', 'terminal,file');
    }
    argv.push('--query', '<prompt from stdin_path>');
    display = renderHermesDisplay(argv, promptPath, workdir);
  } else {
    throw bindingError(normalized, 'Unsupported provider CLI execution_driver.');
  }

  return {
    driver,
    argv,
    stdin_path: promptPath,
    workdir,
    display: display || `${argv.map(shellQuote).join(' ')} < ${shellQuote(promptPath)}`,
    receipt: renderProviderCliReceipt(normalized),
  };
}

function commandNameForDriver(driver) {
  if (driver === 'claude-cli') return 'claude';
  if (driver === 'codex-cli') return 'codex';
  if (driver === 'hermes-chat' || driver === 'hermes-terminal-tool') return 'hermes';
  return null;
}

function pathEntriesFromEnv(env) {
  const pathValue = env && typeof env.PATH === 'string' ? env.PATH : process.env.PATH || '';
  return pathValue.split(require('node:path').delimiter).filter(Boolean);
}

function commandExists(command, env = process.env) {
  const result = spawnSync('command', ['-v', command], {
    shell: true,
    env,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 5000,
  });
  return result.status === 0;
}

function preflightProviderCliDriver(binding, env = process.env) {
  const normalized = normalizeBinding(binding);
  const driver = normalized.execution_driver;
  const command = commandNameForDriver(driver);
  const receipt = renderProviderCliReceipt(normalized);

  if (normalized.status !== 'resolved' || !command) {
    return {
      ok: false,
      driver: driver || 'unsupported',
      command,
      receipt,
      message: `Cannot execute ${normalized.agent || 'agent'}: unsupported provider CLI binding.`,
      suggested_fix: normalized.suggested_fix || 'Choose a supported provider-cli model override or disable workflow.agent_execution_router.',
    };
  }

  if (!commandExists(command, env)) {
    return {
      ok: false,
      driver,
      command,
      receipt,
      message: `Cannot execute ${normalized.agent || 'agent'}: '${command}' CLI was not found on PATH.`,
      suggested_fix: driver === 'claude-cli'
        ? 'Install/login Claude Code CLI or change this agent model_overrides entry to a provider routed to an available driver.'
        : driver === 'codex-cli'
          ? 'Install/login Codex CLI or change this agent model_overrides entry to a provider routed to an available driver.'
          : 'Install/login Hermes Agent CLI and configure the requested provider credentials, or set workflow.agent_execution_driver to provider-cli.',
      path_entries: pathEntriesFromEnv(env),
    };
  }

  return {
    ok: true,
    driver,
    command,
    receipt,
    message: `${normalized.agent || 'agent'} provider CLI preflight passed for ${driver}.`,
  };
}

module.exports = {
  shellQuote,
  renderProviderCliCommand,
  renderProviderCliReceipt,
  preflightProviderCliDriver,
};

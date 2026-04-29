#!/usr/bin/env node
'use strict';

/**
 * Private workflow helper for gsd-hermes provider-routed execution.
 *
 * It renders and preflights CLI command metadata from SDK
 * `agent_execution_bindings`. It is intentionally not a public package bin yet:
 * workflows should call this file path directly until the Phase 8 API hardens.
 */

const fs = require('node:fs');
const {
  renderProviderCliCommand,
  renderProviderCliReceipt,
  preflightProviderCliDriver,
} = require('./lib/provider-cli-dispatch.cjs');

function usage(exitCode = 2) {
  const out = exitCode === 0 ? process.stdout : process.stderr;
  out.write([
    'Usage:',
    '  node get-shit-done/bin/gsd-provider-cli-dispatch.cjs receipt --binding-json JSON|--binding-file FILE',
    '  node get-shit-done/bin/gsd-provider-cli-dispatch.cjs command --binding-json JSON|--binding-file FILE --prompt-path FILE --workdir DIR [--agent-name NAME]',
    '  node get-shit-done/bin/gsd-provider-cli-dispatch.cjs preflight --binding-json JSON|--binding-file FILE',
    '',
  ].join('\n'));
  process.exit(exitCode);
}

function parseArgs(argv) {
  const [action, ...rest] = argv;
  if (!action || action === '-h' || action === '--help') usage(action ? 0 : 2);
  const options = { action };
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument '${token}'.`);
    }
    const key = token.slice(2).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
    const value = rest[i + 1];
    if (value == null || value.startsWith('--')) {
      throw new Error(`Missing value for ${token}.`);
    }
    options[key] = value;
    i += 1;
  }
  return options;
}

function readBinding(options) {
  if (options.bindingJson && options.bindingFile) {
    throw new Error('Use only one of --binding-json or --binding-file.');
  }
  let raw = options.bindingJson;
  if (options.bindingFile) raw = fs.readFileSync(options.bindingFile, 'utf8');
  if (!raw) throw new Error('Missing --binding-json or --binding-file.');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Failed to parse binding JSON: ${error.message}`);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const binding = readBinding(options);
  let result;

  if (options.action === 'receipt') {
    result = renderProviderCliReceipt(binding);
  } else if (options.action === 'command') {
    result = renderProviderCliCommand(binding, {
      prompt_path: options.promptPath,
      workdir: options.workdir,
      agent_name: options.agentName,
    });
  } else if (options.action === 'preflight') {
    result = preflightProviderCliDriver(binding, process.env);
    if (!result.ok) {
      process.stderr.write(`${result.message}\n${result.suggested_fix || ''}\n`);
      process.exitCode = 1;
    }
  } else {
    throw new Error(`Unknown action '${options.action}'.`);
  }

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  usage(2);
}

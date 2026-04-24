#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

const testFiles = [
  'tests/hermes-install.test.cjs',
  'tests/hermes-core-workflow.test.cjs',
  'tests/hermes-lifecycle.test.cjs',
  'tests/hermes-docs.test.cjs',
  'tests/multi-runtime-select.test.cjs',
  'tests/bugs-1656-1657.test.cjs',
  'tests/runtime-model-parity.test.cjs',
  'tests/hermes-sdk-query.test.cjs',
];

console.log('Verifying fork identity...');
const identityResult = spawnSync(process.execPath, ['scripts/verify-fork-identity.cjs'], {
  stdio: 'inherit',
});
if (identityResult.status !== 0) {
  process.exit(identityResult.status === null ? 1 : identityResult.status);
}

console.log('Running Hermes compatibility validation...');

const result = spawnSync(process.execPath, ['--test', ...testFiles], {
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(result.status === null ? 1 : result.status);
}

console.log('Running Hermes SDK model config validation...');

const vitestCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const vitestResult = spawnSync(vitestCmd, ['--no-install', 'vitest', 'run', 'sdk/src/query/config-query.test.ts'], {
  stdio: 'inherit',
});

process.exit(vitestResult.status === null ? 1 : vitestResult.status);

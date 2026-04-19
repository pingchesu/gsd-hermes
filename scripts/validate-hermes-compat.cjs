#!/usr/bin/env node

const { spawnSync } = require('node:child_process');

const testFiles = [
  'tests/hermes-core-workflow.test.cjs',
  'tests/hermes-lifecycle.test.cjs',
  'tests/hermes-docs.test.cjs',
  'tests/multi-runtime-select.test.cjs',
];

console.log('Running Hermes compatibility validation...');

const result = spawnSync(process.execPath, ['--test', ...testFiles], {
  stdio: 'inherit',
});

process.exit(result.status === null ? 1 : result.status);

/**
 * GSD Tools Tests - Hermes Docs and Compatibility
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const installGuide = fs.readFileSync('docs/hermes-install.md', 'utf8');
const compatibility = fs.readFileSync('docs/hermes-compatibility.md', 'utf8');
const docsIndex = fs.readFileSync('docs/README.md', 'utf8');
const installer = fs.readFileSync('bin/install.js', 'utf8');

describe('Hermes install documentation', () => {
  test('documents global and project-linked command discovery', () => {
    for (const expected of [
      '--hermes --global',
      '--hermes --local',
      'skills.external_dirs',
      '.gsd-hermes/skills',
      '/gsd-help',
      '/gsd-progress',
      'Phase 4',
      'Phase 5',
    ]) {
      assert.ok(installGuide.includes(expected), `missing ${expected}`);
    }
  });

  test('documents core workflow smoke and degraded paths', () => {
    for (const expected of [
      'Core Workflow Smoke',
      'Optional real Hermes smoke',
      'node --test tests/hermes-core-workflow.test.cjs',
      'hermes chat -q "/gsd-help"',
      '/gsd-new-project',
      '/gsd-discuss-phase 1 --auto',
      '/gsd-plan-phase 1 --auto',
      'AskUserQuestion',
      'Task',
    ]) {
      assert.ok(installGuide.includes(expected), `missing ${expected}`);
    }
  });

  test('documents Hermes lifecycle commands', () => {
    for (const expected of [
      'Hermes Lifecycle',
      '### Update',
      '### Uninstall',
      '### Doctor',
      'npx gsd-hermes --hermes --global',
      'npx gsd-hermes --hermes --local',
      'npx gsd-hermes --hermes --global --uninstall',
      'npx gsd-hermes --hermes --local --uninstall',
      'npx gsd-hermes --hermes --global --doctor',
      'npx gsd-hermes --hermes --local --doctor',
      'project-linked uninstall removes only the matching',
      'Doctor is read-only',
    ]) {
      assert.ok(installGuide.includes(expected), `missing ${expected}`);
    }
  });

  test('is linked from docs index', () => {
    assert.ok(docsIndex.includes('hermes-install.md'));
  });

  test('documents Phase 6 compatibility closure', () => {
    for (const expected of [
      '## Compatibility Validation',
      'npm run test:hermes',
      'npm test',
    ]) {
      assert.ok(installGuide.includes(expected), `missing ${expected}`);
    }

    assert.ok(docsIndex.includes('validation matrix and maintenance contract'));
    assert.ok(docsIndex.includes('post-sync validation checklist'));
  });
});

describe('Hermes compatibility matrix', () => {
  test('pins Phase 3 support and later-phase boundaries', () => {
    for (const expected of [
      'Global Hermes install | supported',
      'Project-linked external_dirs mode | supported',
      'Command discovery for /gsd-* | supported',
      'Core workflow execution | supported with degraded paths',
      'Update / uninstall / doctor | supported',
      'Phase 5 complete',
      'deterministic fixture coverage',
      'Validation evidence',
      'npm run test:hermes',
      '## Maintenance Contract',
      'Project-linked mode uses skills.external_dirs instead.',
      'known gaps instead of claiming unsupported parity',
      'Native local Hermes install mode | out of scope',
    ]) {
      assert.ok(compatibility.includes(expected), `missing ${expected}`);
    }
  });
});

describe('Hermes installer copy', () => {
  test('reflects supported discovery without stale planned-later wording', () => {
    for (const expected of [
      'project-linked mode',
      'skills.external_dirs',
      '/gsd-help',
    ]) {
      assert.ok(installer.includes(expected), `missing ${expected}`);
    }

    assert.ok(!installer.includes('command discovery are planned for later phases'));
  });
});

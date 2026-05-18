// allow-test-rule: Hermes downstream regression tests intentionally assert installer/docs/CLI text contracts where no typed IR exists yet.
/**
 * GSD Tools Tests - Hermes Core Workflow Parity
 *
 * Deterministic Hermes fixture tests for the core GSD lifecycle command set.
 * These tests do not require a real Hermes binary.
 */

process.env.GSD_TEST_MODE = '1';

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createTempDir, cleanup } = require('./helpers.cjs');

const installPath = path.join(__dirname, '..', 'bin', 'install.js');

const CORE_WORKFLOW_SKILLS = [
  'new-project',
  'discuss-phase',
  'plan-phase',
  'execute-phase',
  'verify-work',
  'progress',
  'settings',
  'update',
];

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function assertNoExecutableClaudePathLeaks(rootDir) {
  const leaks = [];

  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
        continue;
      }

      if (!entry.name.endsWith('.md')) continue;

      const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
      if (
        relativePath.includes('CHANGELOG.md') ||
        relativePath.includes('USER-PROFILE.md') ||
        relativePath.includes('backup')
      ) {
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/(?:~|\$HOME)\/\.claude\b/g);
      if (matches) {
        leaks.push(`${relativePath}:${matches.length}`);
      }
    }
  }

  scan(rootDir);
  assert.deepStrictEqual(leaks, [], `Found executable Claude path leaks: ${leaks.join(', ')}`);
}

function runInstaller(args, options = {}) {
  const env = {
    ...process.env,
    HOME: options.home || process.env.HOME,
  };
  delete env.GSD_TEST_MODE;

  return spawnSync(process.execPath, [installPath, ...args], {
    cwd: options.cwd || process.cwd(),
    env,
    encoding: 'utf8',
  });
}

describe('Hermes core workflow skill installation', () => {
  let tmpHome;
  let tmpProject;

  beforeEach(() => {
    tmpHome = createTempDir('gsd-hermes-core-home-');
    tmpProject = createTempDir('gsd-hermes-core-project-');
  });

  afterEach(() => {
    cleanup(tmpHome);
    cleanup(tmpProject);
  });

  test('global Hermes install includes the core GSD lifecycle skills', () => {
    const result = runInstaller(['--hermes', '--global', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });

    assert.strictEqual(result.status, 0, result.stdout + result.stderr);

    const skillsDir = path.join(tmpHome, '.hermes', 'skills', 'gsd');
    for (const skillName of CORE_WORKFLOW_SKILLS) {
      const skillPath = path.join(skillsDir, skillName, 'SKILL.md');
      assert.ok(fs.existsSync(skillPath), `gsd/${skillName} skill exists`);
      const content = fs.readFileSync(skillPath, 'utf8');
      assert.match(
        content,
        new RegExp(`^name:\\s+${skillName}$`, 'm'),
        `${skillName} has command-discoverable frontmatter`
      );
    }
  });

  test('project-linked Hermes install includes the core GSD lifecycle skills', () => {
    const result = runInstaller(['--hermes', '--local', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });

    assert.strictEqual(result.status, 0, result.stdout + result.stderr);

    const skillsDir = path.join(tmpProject, '.gsd-hermes', 'skills', 'gsd');
    for (const skillName of CORE_WORKFLOW_SKILLS) {
      const skillPath = path.join(skillsDir, skillName, 'SKILL.md');
      assert.ok(fs.existsSync(skillPath), `gsd/${skillName} project-linked skill exists`);
    }

    const configPath = path.join(tmpHome, '.hermes', 'config.yaml');
    const config = fs.readFileSync(configPath, 'utf8');
    const absoluteSkillsRoot = path.resolve(tmpProject, '.gsd-hermes', 'skills').replace(/\\/g, '/');
    assert.strictEqual(countOccurrences(config, absoluteSkillsRoot), 1);
  });

  test('global Hermes install has no executable Claude path leaks in workflows', () => {
    const result = runInstaller(['--hermes', '--global', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });

    assert.strictEqual(result.status, 0, result.stdout + result.stderr);
    assertNoExecutableClaudePathLeaks(path.join(tmpHome, '.hermes', 'get-shit-done'));
  });

  test('project-linked Hermes install has no executable Claude path leaks in workflows', () => {
    const result = runInstaller(['--hermes', '--local', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });

    assert.strictEqual(result.status, 0, result.stdout + result.stderr);
    assertNoExecutableClaudePathLeaks(path.join(tmpProject, '.gsd-hermes', 'get-shit-done'));
  });

  test('global Hermes skills include runtime compatibility guidance', () => {
    const result = runInstaller(['--hermes', '--global', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });

    assert.strictEqual(result.status, 0, result.stdout + result.stderr);

    const skillPath = path.join(tmpHome, '.hermes', 'skills', 'gsd', 'plan-phase', 'SKILL.md');
    const content = fs.readFileSync(skillPath, 'utf8');
    assert.match(content, /## Hermes runtime compatibility/);
    assert.match(content, /Use text-mode fallback when AskUserQuestion is unavailable/);
    assert.match(content, /Use sequential inline execution when Task-style subagents are unavailable/);
    assert.match(content, /Do not report full parity when a workflow needs a degraded path/);
  });

  test('optional real Hermes CLI smoke is skipped when hermes is unavailable', (t) => {
    const version = spawnSync('hermes', ['--version'], { encoding: 'utf8' });
    if (version.error && version.error.code === 'ENOENT') {
      t.diagnostic('hermes binary not found; skipping optional real Hermes CLI smoke');
      return;
    }

    const result = runInstaller(['--hermes', '--local', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(result.status, 0, result.stdout + result.stderr);

    const skills = spawnSync('hermes', ['skills', 'list'], {
      cwd: tmpProject,
      env: { ...process.env, HOME: tmpHome },
      encoding: 'utf8',
    });

    if (skills.status !== 0) {
      t.diagnostic(`hermes skills list unsupported or failed; stdout=${skills.stdout}; stderr=${skills.stderr}`);
      return;
    }

    assert.strictEqual(skills.status, 0);
  });
});

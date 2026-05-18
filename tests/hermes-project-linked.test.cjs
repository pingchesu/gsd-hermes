// allow-test-rule: Hermes downstream regression tests intentionally assert installer/docs/CLI text contracts where no typed IR exists yet.
/**
 * GSD Tools Tests - Hermes Project-Linked Install
 *
 * Covers `.gsd-hermes/skills` installs and conservative
 * `~/.hermes/config.yaml` skills.external_dirs mutation.
 */

process.env.GSD_TEST_MODE = '1';

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createTempDir, cleanup } = require('./helpers.cjs');

const installPath = path.join(__dirname, '..', 'bin', 'install.js');
const { ensureHermesExternalDir, normalizeHermesExternalDir } = require('../bin/install.js');

function hermesHelpSkillPath(rootDir) {
  return path.join(rootDir, 'skills', 'gsd', 'help', 'SKILL.md');
}

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
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

describe('Hermes external_dirs config mutation', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempDir('gsd-hermes-external-dirs-');
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('writes missing config with skills.external_dirs', () => {
    const configPath = path.join(tmpDir, '.hermes', 'config.yaml');
    const skillsDir = path.join(tmpDir, 'project', '.gsd-hermes', 'skills');
    const absoluteSkillsDir = normalizeHermesExternalDir(skillsDir);

    const result = ensureHermesExternalDir(configPath, skillsDir);
    const content = fs.readFileSync(configPath, 'utf8');

    assert.deepStrictEqual(result, { added: true, path: absoluteSkillsDir });
    assert.match(content, /^skills:$/m);
    assert.match(content, /^  external_dirs:$/m);
    assert.strictEqual(countOccurrences(content, absoluteSkillsDir), 1);
  });

  test('is idempotent when called twice', () => {
    const configPath = path.join(tmpDir, '.hermes', 'config.yaml');
    const skillsDir = path.join(tmpDir, 'project', '.gsd-hermes', 'skills');
    const absoluteSkillsDir = normalizeHermesExternalDir(skillsDir);

    assert.equal(ensureHermesExternalDir(configPath, skillsDir).added, true);
    assert.equal(ensureHermesExternalDir(configPath, skillsDir).added, false);

    const content = fs.readFileSync(configPath, 'utf8');
    assert.strictEqual(countOccurrences(content, absoluteSkillsDir), 1);
  });

  test('preserves unrelated config text and existing skills keys', () => {
    const configPath = path.join(tmpDir, '.hermes', 'config.yaml');
    const skillsDir = path.join(tmpDir, 'project', '.gsd-hermes', 'skills');
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(
      configPath,
      [
        'model:',
        '  provider: test',
        '# keep me',
        'skills:',
        '  enabled: true',
        '',
      ].join('\n')
    );

    ensureHermesExternalDir(configPath, skillsDir);
    const content = fs.readFileSync(configPath, 'utf8');

    assert.match(content, /provider: test/);
    assert.match(content, /# keep me/);
    assert.match(content, /enabled: true/);
    assert.match(content, /external_dirs:/);
    assert.strictEqual(countOccurrences(content, normalizeHermesExternalDir(skillsDir)), 1);
  });
});

describe('Hermes project-linked installer behavior', () => {
  let tmpHome;
  let tmpProject;

  beforeEach(() => {
    tmpHome = createTempDir('gsd-hermes-home-');
    tmpProject = createTempDir('gsd-hermes-project-');
  });

  afterEach(() => {
    cleanup(tmpHome);
    cleanup(tmpProject);
  });

  test('installs project skills and registers external_dirs once', () => {
    const args = ['--hermes', '--local', '--no-sdk'];
    const first = runInstaller(args, { home: tmpHome, cwd: tmpProject });

    assert.strictEqual(first.status, 0, first.stdout + first.stderr);
    assert.match(first.stdout, /project-linked mode/);

    const skillsDir = path.join(tmpProject, '.gsd-hermes', 'skills');
    const helpSkillPath = hermesHelpSkillPath(path.join(tmpProject, '.gsd-hermes'));
    assert.ok(fs.existsSync(helpSkillPath), 'project-linked gsd-help skill exists');

    const configPath = path.join(tmpHome, '.hermes', 'config.yaml');
    const absoluteSkillsDir = normalizeHermesExternalDir(skillsDir);
    let config = fs.readFileSync(configPath, 'utf8');
    assert.match(config, /external_dirs:/);
    assert.strictEqual(countOccurrences(config, absoluteSkillsDir), 1);

    const second = runInstaller(args, { home: tmpHome, cwd: tmpProject });
    assert.strictEqual(second.status, 0, second.stdout + second.stderr);

    config = fs.readFileSync(configPath, 'utf8');
    assert.strictEqual(countOccurrences(config, absoluteSkillsDir), 1);
  });
});

// allow-test-rule: Hermes downstream regression tests intentionally assert installer/docs/CLI text contracts where no typed IR exists yet.
/**
 * GSD Tools Tests - Hermes Lifecycle
 *
 * Covers Hermes update and uninstall behavior for global and project-linked
 * install modes.
 */

process.env.GSD_TEST_MODE = '1';

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createTempDir, cleanup } = require('./helpers.cjs');

const installPath = path.join(__dirname, '..', 'bin', 'install.js');
const {
  doctorHermesInstall,
  normalizeHermesExternalDir,
  removeHermesExternalDir,
} = require('../bin/install.js');

function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

function runInstaller(args, options = {}) {
  const env = {
    ...process.env,
    HOME: options.home || process.env.HOME,
    USERPROFILE: options.home || process.env.USERPROFILE,
  };
  delete env.GSD_TEST_MODE;

  return spawnSync(process.execPath, [installPath, ...args], {
    cwd: options.cwd || process.cwd(),
    env,
    encoding: 'utf8',
  });
}

function hermesHelpSkillPath(rootDir) {
  return path.join(rootDir, 'skills', 'gsd', 'help', 'SKILL.md');
}

function hermesHelpSkillDir(rootDir) {
  return path.dirname(hermesHelpSkillPath(rootDir));
}

describe('Hermes external_dirs cleanup', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempDir('gsd-hermes-cleanup-');
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('preserves unrelated Hermes config while removing one matching external dir', () => {
    const configPath = path.join(tmpDir, '.hermes', 'config.yaml');
    const matchingDir = path.join(tmpDir, 'project', '.gsd-hermes', 'skills');
    const otherDir = path.join(tmpDir, 'other-project', '.gsd-hermes', 'skills');
    const normalizedMatchingDir = normalizeHermesExternalDir(matchingDir);
    const normalizedOtherDir = normalizeHermesExternalDir(otherDir);

    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(
      configPath,
      [
        'model:',
        '  provider: test',
        'skills:',
        '  enabled: true',
        '  external_dirs:',
        `    - "${normalizedMatchingDir}"`,
        `    - "${normalizedOtherDir}"`,
        'theme: terminal',
        '',
      ].join('\n')
    );

    const result = removeHermesExternalDir(configPath, matchingDir);
    const content = fs.readFileSync(configPath, 'utf8');

    assert.deepStrictEqual(result, { removed: true, path: normalizedMatchingDir });
    assert.match(content, /provider: test/);
    assert.match(content, /enabled: true/);
    assert.match(content, /theme: terminal/);
    assert.strictEqual(countOccurrences(content, normalizedMatchingDir), 0);
    assert.strictEqual(countOccurrences(content, normalizedOtherDir), 1);
    assert.ok(content.endsWith('\n'));
  });

  test('returns removed false when the external dir is absent', () => {
    const configPath = path.join(tmpDir, '.hermes', 'config.yaml');
    const missingDir = path.join(tmpDir, 'project', '.gsd-hermes', 'skills');
    const otherDir = normalizeHermesExternalDir(path.join(os.tmpdir(), 'gsd-hermes-other'));
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, `model:\n  provider: test\nskills:\n  external_dirs:\n    - "${otherDir}"\n`);

    const result = removeHermesExternalDir(configPath, missingDir);
    const content = fs.readFileSync(configPath, 'utf8');

    assert.deepStrictEqual(result, {
      removed: false,
      path: normalizeHermesExternalDir(missingDir),
    });
    assert.match(content, /provider: test/);
    assert.match(content, new RegExp(otherDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
});

describe('Hermes lifecycle update and uninstall', () => {
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

  test('project-linked update backs up modified Hermes skill files', () => {
    const args = ['--hermes', '--local', '--no-sdk'];
    const first = runInstaller(args, { home: tmpHome, cwd: tmpProject });
    assert.strictEqual(first.status, 0, first.stdout + first.stderr);

    const projectRoot = path.join(tmpProject, '.gsd-hermes');
    const skillPath = hermesHelpSkillPath(projectRoot);
    fs.appendFileSync(skillPath, '\n<!-- user edit -->\n');

    const second = runInstaller(args, { home: tmpHome, cwd: tmpProject });
    assert.strictEqual(second.status, 0, second.stdout + second.stderr);

    const patchPath = path.join(
      projectRoot,
      'gsd-local-patches',
      'skills',
      'gsd',
      'help',
      'SKILL.md'
    );
    assert.ok(fs.existsSync(patchPath), 'project-linked patch backup exists');
    assert.match(fs.readFileSync(patchPath, 'utf8'), /user edit/);
  });

  test('global update backs up modified Hermes skill files', () => {
    const args = ['--hermes', '--global', '--no-sdk'];
    const first = runInstaller(args, { home: tmpHome, cwd: tmpProject });
    assert.strictEqual(first.status, 0, first.stdout + first.stderr);

    const hermesRoot = path.join(tmpHome, '.hermes');
    const skillPath = hermesHelpSkillPath(hermesRoot);
    fs.appendFileSync(skillPath, '\n<!-- user edit -->\n');

    const second = runInstaller(args, { home: tmpHome, cwd: tmpProject });
    assert.strictEqual(second.status, 0, second.stdout + second.stderr);

    const patchPath = path.join(
      hermesRoot,
      'gsd-local-patches',
      'skills',
      'gsd',
      'help',
      'SKILL.md'
    );
    assert.ok(fs.existsSync(patchPath), 'global patch backup exists');
    assert.match(fs.readFileSync(patchPath, 'utf8'), /user edit/);
  });

  test('project-linked uninstall removes Hermes skills and exact external_dirs entry', () => {
    const install = runInstaller(['--hermes', '--local', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(install.status, 0, install.stdout + install.stderr);

    const skillsDir = path.join(tmpProject, '.gsd-hermes', 'skills');
    const unrelatedDir = path.join(tmpProject, 'other-skills');
    const configPath = path.join(tmpHome, '.hermes', 'config.yaml');
    const normalizedSkillsDir = normalizeHermesExternalDir(skillsDir);
    const normalizedUnrelatedDir = normalizeHermesExternalDir(unrelatedDir);
    fs.appendFileSync(configPath, `    - "${normalizedUnrelatedDir}"\n`);

    const result = runInstaller(['--hermes', '--local', '--uninstall'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /Removed \d+ Hermes skills/);
    assert.match(result.stdout, /Removed project-linked Hermes skills\.external_dirs entry/);

    assert.ok(!fs.existsSync(hermesHelpSkillDir(path.join(tmpProject, '.gsd-hermes'))), 'gsd/help skill removed');
    const config = fs.readFileSync(configPath, 'utf8');
    assert.strictEqual(countOccurrences(config, normalizedSkillsDir), 0);
    assert.strictEqual(countOccurrences(config, normalizedUnrelatedDir), 1);
  });

  test('global uninstall removes Hermes skills without mutating external_dirs', () => {
    const install = runInstaller(['--hermes', '--global', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(install.status, 0, install.stdout + install.stderr);

    const configPath = path.join(tmpHome, '.hermes', 'config.yaml');
    const externalSkillsDir = path.join(os.tmpdir(), 'external-skills');
    fs.writeFileSync(configPath, `skills:\n  external_dirs:\n    - "${externalSkillsDir}"\n`);

    const result = runInstaller(['--hermes', '--global', '--uninstall'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /Removed \d+ Hermes skills/);

    assert.ok(!fs.existsSync(hermesHelpSkillDir(path.join(tmpHome, '.hermes'))));
    assert.match(
      fs.readFileSync(configPath, 'utf8'),
      new RegExp(externalSkillsDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    );
  });
});

describe('Hermes doctor diagnostics', () => {
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

  test('reports missing global gsd-help skill', () => {
    const result = doctorHermesInstall({ isGlobal: true, homeDir: tmpHome });

    assert.equal(result.runtime, 'hermes');
    assert.equal(result.mode, 'global');
    assert.ok(
      result.findings.some(finding => finding.message.includes('Missing Hermes gsd-help skill')),
      'missing gsd-help finding exists'
    );
  });

  test('project-linked install has no error severity doctor findings', () => {
    const install = runInstaller(['--hermes', '--local', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(install.status, 0, install.stdout + install.stderr);

    const result = doctorHermesInstall({
      isGlobal: false,
      cwd: tmpProject,
      homeDir: tmpHome,
    });

    assert.deepStrictEqual(
      result.findings.filter(finding => finding.severity === 'error'),
      []
    );
  });

  test('reports duplicate project-linked external_dirs entry', () => {
    const install = runInstaller(['--hermes', '--local', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(install.status, 0, install.stdout + install.stderr);

    const skillsDir = path.join(tmpProject, '.gsd-hermes', 'skills');
    const configPath = path.join(tmpHome, '.hermes', 'config.yaml');
    fs.appendFileSync(configPath, `    - "${normalizeHermesExternalDir(skillsDir)}"\n`);

    const result = doctorHermesInstall({
      isGlobal: false,
      cwd: tmpProject,
      homeDir: tmpHome,
    });

    assert.ok(
      result.findings.some(finding => finding.message.includes('Duplicate project-linked Hermes external_dirs entry')),
      'duplicate external_dirs finding exists'
    );
  });

  test('reports stale external_dirs entry', () => {
    const install = runInstaller(['--hermes', '--local', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(install.status, 0, install.stdout + install.stderr);

    const configPath = path.join(tmpHome, '.hermes', 'config.yaml');
    fs.appendFileSync(configPath, `    - "${path.join(tmpHome, 'missing-skills').replace(/\\/g, '/')}"\n`);

    const result = doctorHermesInstall({
      isGlobal: false,
      cwd: tmpProject,
      homeDir: tmpHome,
    });

    assert.ok(
      result.findings.some(finding => finding.message.includes('Stale Hermes external_dirs entry')),
      'stale external_dirs finding exists'
    );
  });

  test('prints Hermes doctor CLI output', () => {
    const result = runInstaller(['--hermes', '--global', '--doctor', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });

    assert.strictEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /Hermes doctor:/);
  });
});

describe('Hermes lifecycle end-to-end', () => {
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

  test('global lifecycle installs updates doctors and uninstalls', () => {
    const install = runInstaller(['--hermes', '--global', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(install.status, 0, install.stdout + install.stderr);

    const hermesRoot = path.join(tmpHome, '.hermes');
    const skillPath = hermesHelpSkillPath(hermesRoot);
    assert.ok(fs.existsSync(skillPath), 'global gsd-help skill exists');

    const doctor = runInstaller(['--hermes', '--global', '--doctor', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(doctor.status, 0, doctor.stdout + doctor.stderr);
    assert.match(doctor.stdout, /Hermes doctor: global/);

    fs.appendFileSync(skillPath, '\n<!-- user edit -->\n');
    const update = runInstaller(['--hermes', '--global', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(update.status, 0, update.stdout + update.stderr);
    assert.ok(
      fs.existsSync(path.join(hermesRoot, 'gsd-local-patches', 'skills', 'gsd', 'help', 'SKILL.md')),
      'global update patch backup exists'
    );

    const uninstall = runInstaller(['--hermes', '--global', '--uninstall', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(uninstall.status, 0, uninstall.stdout + uninstall.stderr);
    assert.ok(!fs.existsSync(hermesHelpSkillDir(hermesRoot)));
    assert.ok(!fs.existsSync(path.join(hermesRoot, 'gsd-file-manifest.json')));
  });

  test('project-linked lifecycle installs updates doctors and uninstalls', () => {
    const install = runInstaller(['--hermes', '--local', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(install.status, 0, install.stdout + install.stderr);

    const projectRoot = path.join(tmpProject, '.gsd-hermes');
    const skillsDir = path.join(projectRoot, 'skills');
    const skillPath = hermesHelpSkillPath(projectRoot);
    const configPath = path.join(tmpHome, '.hermes', 'config.yaml');
    const normalizedSkillsDir = normalizeHermesExternalDir(skillsDir);
    const unrelatedExternalDir = path.join(tmpProject, 'unrelated external dir');
    const normalizedUnrelatedExternalDir = normalizeHermesExternalDir(unrelatedExternalDir);

    assert.ok(fs.existsSync(skillPath), 'project-linked gsd-help skill exists');
    let config = fs.readFileSync(configPath, 'utf8');
    assert.strictEqual(countOccurrences(config, normalizedSkillsDir), 1);

    fs.appendFileSync(configPath, `    - "${normalizedUnrelatedExternalDir}"\n`);

    const doctor = runInstaller(['--hermes', '--local', '--doctor', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(doctor.status, 0, doctor.stdout + doctor.stderr);
    assert.match(doctor.stdout, /Hermes doctor: project-linked/);

    fs.appendFileSync(skillPath, '\n<!-- user edit -->\n');
    const update = runInstaller(['--hermes', '--local', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(update.status, 0, update.stdout + update.stderr);
    assert.ok(
      fs.existsSync(path.join(projectRoot, 'gsd-local-patches', 'skills', 'gsd', 'help', 'SKILL.md')),
      'project-linked update patch backup exists'
    );

    const uninstall = runInstaller(['--hermes', '--local', '--uninstall', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });
    assert.strictEqual(uninstall.status, 0, uninstall.stdout + uninstall.stderr);
    assert.ok(!fs.existsSync(hermesHelpSkillDir(projectRoot)));
    assert.ok(!fs.existsSync(path.join(projectRoot, 'gsd-file-manifest.json')));

    config = fs.readFileSync(configPath, 'utf8');
    assert.strictEqual(countOccurrences(config, normalizedSkillsDir), 0);
    assert.strictEqual(countOccurrences(config, normalizedUnrelatedExternalDir), 1);
  });
});

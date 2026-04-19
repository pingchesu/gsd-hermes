/**
 * GSD Tools Tests - Hermes Install Plumbing
 *
 * Tests for Hermes runtime path helpers, global install semantics, project-linked
 * install seams, and command-discoverable skills.
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
const installSrc = fs.readFileSync(installPath, 'utf8');

const {
  getDirName,
  getGlobalDir,
  getConfigDirFromHome,
  copyCommandsAsHermesSkills,
  reportLocalPatches,
} = require('../bin/install.js');

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

describe('Hermes runtime directory mapping', () => {
  test('maps Hermes to .hermes for local helper consistency', () => {
    assert.strictEqual(getDirName('hermes'), '.hermes');
  });

  test('maps Hermes to ~/.hermes for global installs', () => {
    assert.strictEqual(getGlobalDir('hermes'), path.join(os.homedir(), '.hermes'));
  });

  test('returns explicit config dir for Hermes global installs', () => {
    assert.strictEqual(getGlobalDir('hermes', '/custom/hermes'), '/custom/hermes');
  });

  test('returns .hermes config fragments for local and global helper calls', () => {
    assert.strictEqual(getConfigDirFromHome('hermes', false), "'.hermes'");
    assert.strictEqual(getConfigDirFromHome('hermes', true), "'.hermes'");
  });
});

describe('Hermes installer source integration', () => {
  test('--hermes flag parsing and runtime boolean exist', () => {
    assert.ok(installSrc.includes("args.includes('--hermes')"), '--hermes flag parsed');
    assert.ok(
      /const isHermes = runtime === 'hermes';/.test(installSrc),
      'isHermes runtime boolean exists'
    );
  });

  test('project-linked local-mode source seams exist', () => {
    assert.ok(!installSrc.includes('Hermes local install is not supported in Phase 2'));
    assert.ok(installSrc.includes('.gsd-hermes'), 'project-linked skills root exists');
    assert.ok(installSrc.includes('project-linked mode'), 'user-facing project-linked wording exists');
    assert.ok(installSrc.includes('skills.external_dirs'), 'external_dirs wording exists');
    assert.ok(installSrc.includes('ensureHermesExternalDir(configPath, skillsDir)'));
  });

  test('Hermes install branch targets global and project-linked skill roots', () => {
    assert.ok(
      /isGlobal[\s\S]{0,120}path\.join\(getGlobalDir\('hermes', explicitConfigDir\), 'skills'\)/.test(installSrc),
      'Hermes branch installs under getGlobalDir("hermes")/skills'
    );
    assert.ok(
      /!isGlobal[\s\S]{0,500}\.gsd-hermes/.test(installSrc),
      'Hermes local branch installs under .gsd-hermes'
    );
  });

  test('Hermes follows the no-settings path', () => {
    assert.ok(
      /if \(!isCodex && !isHermes && !isCopilot[\s\S]{0,120}writeSettings/.test(installSrc),
      'finishInstall skips settings.json writes for Hermes'
    );
    assert.ok(
      /if \(isHermes\) \{[\s\S]{0,180}settingsPath: null/.test(installSrc),
      'install returns null settingsPath for Hermes'
    );
  });

  test('finish output states global mode and accepted GSD defaults side effect', () => {
    assert.ok(installSrc.includes('global mode'), 'finish output states global mode');
    assert.ok(
      /runtime !== 'claude'[\s\S]{0,900}resolve_model_ids/.test(installSrc),
      'non-Claude defaults write still covers Hermes'
    );
    assert.ok(
      installSrc.includes('resolve_model_ids: "omit"'),
      'Hermes finish copy reports resolve_model_ids side effect'
    );
  });
});

describe('Hermes installer CLI behavior', () => {
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

  test('direct Hermes local install uses project-linked mode', () => {
    const result = runInstaller(['--hermes', '--local', '--no-sdk'], { home: tmpHome, cwd: tmpProject });

    assert.strictEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /project-linked mode/);
    assert.ok(fs.existsSync(path.join(tmpProject, '.gsd-hermes', 'skills', 'gsd-help', 'SKILL.md')));
    assert.match(
      fs.readFileSync(path.join(tmpHome, '.hermes', 'config.yaml'), 'utf8'),
      /external_dirs:/
    );
  });

  test('global Hermes install writes skills under ~/.hermes and defaults under ~/.gsd', () => {
    const result = runInstaller(['--hermes', '--global', '--no-sdk'], {
      home: tmpHome,
      cwd: tmpProject,
    });

    assert.strictEqual(result.status, 0, result.stdout + result.stderr);
    assert.match(result.stdout, /global mode/, 'finish output reports global mode');

    const hermesRoot = path.join(tmpHome, '.hermes');
    const skillsDir = path.join(hermesRoot, 'skills');
    const gsdSkillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && entry.name.startsWith('gsd-'));

    assert.ok(gsdSkillDirs.length > 0, 'GSD skills installed under ~/.hermes/skills');
    const helpSkillPath = path.join(skillsDir, 'gsd-help', 'SKILL.md');
    assert.ok(fs.existsSync(helpSkillPath), 'gsd-help skill exists');
    const helpSkill = fs.readFileSync(helpSkillPath, 'utf8');
    assert.match(helpSkill, /^name:\s+gsd-help$/m, 'gsd-help uses command-discoverable frontmatter');
    assert.ok(!helpSkill.includes('~/.claude/'), 'no tilde Claude path in Hermes skill');
    assert.ok(!helpSkill.includes('$HOME/.claude/'), 'no HOME Claude path in Hermes skill');
    assert.ok(!helpSkill.includes('./.claude/'), 'no project Claude path in Hermes skill');
    assert.ok(!fs.existsSync(path.join(hermesRoot, 'settings.json')), 'Hermes install does not write settings.json');
    assert.ok(!fs.existsSync(path.join(hermesRoot, 'config.yaml')), 'Hermes install does not mutate config.yaml');

    const defaultsPath = path.join(tmpHome, '.gsd', 'defaults.json');
    const defaults = JSON.parse(fs.readFileSync(defaultsPath, 'utf8'));
    assert.strictEqual(defaults.resolve_model_ids, 'omit');
  });
});

describe('Hermes skill conversion', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempDir('gsd-hermes-skill-convert-');
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  test('creates command-discoverable skills with Hermes path references', () => {
    const srcDir = path.join(tmpDir, 'src');
    fs.mkdirSync(srcDir, { recursive: true });
    fs.writeFileSync(
      path.join(srcDir, 'help.md'),
      [
        '---',
        'name: gsd:help',
        'description: Show help',
        '---',
        '',
        '@~/.claude/get-shit-done/workflows/help.md',
        '@$HOME/.claude/get-shit-done/references/gates.md',
      ].join('\n')
    );

    const skillsDir = path.join(tmpDir, 'skills');
    copyCommandsAsHermesSkills(srcDir, skillsDir, 'gsd', '$HOME/.hermes/', true);

    const helpSkillPath = path.join(skillsDir, 'gsd-help', 'SKILL.md');
    assert.ok(fs.existsSync(helpSkillPath), 'gsd-help skill exists');
    const content = fs.readFileSync(helpSkillPath, 'utf8');
    assert.match(content, /^name:\s+gsd-help$/m);
    assert.ok(content.includes('$HOME/.hermes/get-shit-done/workflows/help.md'));
    assert.ok(content.includes('$HOME/.hermes/get-shit-done/references/gates.md'));
    assert.ok(!content.includes('.claude'), 'Hermes skill does not reference Claude paths');
  });
});

describe('Hermes local patch reporting', () => {
  let tmpHome;
  let originalLog;
  let logs;

  beforeEach(() => {
    tmpHome = createTempDir('gsd-hermes-patches-');
    originalLog = console.log;
    logs = [];
    console.log = (...args) => logs.push(args.join(' '));
  });

  afterEach(() => {
    console.log = originalLog;
    cleanup(tmpHome);
  });

  test('does not print unsupported slash command guidance for Hermes patches', () => {
    const patchesDir = path.join(tmpHome, 'gsd-local-patches');
    fs.mkdirSync(patchesDir, { recursive: true });
    fs.writeFileSync(path.join(patchesDir, 'backup-meta.json'), JSON.stringify({
      from_version: '1.37.1',
      files: ['skills/gsd-help/SKILL.md'],
    }));

    const result = reportLocalPatches(tmpHome, 'hermes');

    assert.deepStrictEqual(result, ['skills/gsd-help/SKILL.md']);
    const output = logs.join('\n');
    assert.ok(!output.includes('/gsd-reapply-patches'), 'Hermes does not advertise slash command recovery');
    assert.match(output, /Reapply the saved files manually/, 'Hermes uses manual reapply guidance');
    assert.match(output, /for Hermes installs/, 'Hermes guidance does not use stale Phase 2 wording');
  });
});

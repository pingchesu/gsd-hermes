// allow-test-rule: Hermes downstream regression tests intentionally assert installer/docs/CLI text contracts where no typed IR exists yet.
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

function hermesHelpSkillPath(rootDir) {
  return path.join(rootDir, 'skills', 'gsd', 'help', 'SKILL.md');
}

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
    USERPROFILE: options.home || process.env.USERPROFILE,
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
    const originalHermesHome = process.env.HERMES_HOME;
    delete process.env.HERMES_HOME;
    try {
      assert.strictEqual(getGlobalDir('hermes'), path.join(os.homedir(), '.hermes'));
    } finally {
      if (originalHermesHome === undefined) delete process.env.HERMES_HOME;
      else process.env.HERMES_HOME = originalHermesHome;
    }
  });

  test('respects HERMES_HOME for Hermes global installs', () => {
    const originalHermesHome = process.env.HERMES_HOME;
    process.env.HERMES_HOME = '~/custom-hermes';
    try {
      assert.strictEqual(getGlobalDir('hermes'), path.join(os.homedir(), 'custom-hermes'));
    } finally {
      if (originalHermesHome === undefined) delete process.env.HERMES_HOME;
      else process.env.HERMES_HOME = originalHermesHome;
    }
  });

  test('returns explicit config dir for Hermes global installs', () => {
    const originalHermesHome = process.env.HERMES_HOME;
    process.env.HERMES_HOME = '~/ignored-hermes';
    try {
      assert.strictEqual(getGlobalDir('hermes', '/custom/hermes'), '/custom/hermes');
    } finally {
      if (originalHermesHome === undefined) delete process.env.HERMES_HOME;
      else process.env.HERMES_HOME = originalHermesHome;
    }
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
    assert.ok(installSrc.includes('ensureHermesExternalDir(configPath, hermesSkillsRoot)'));
  });

  test('Hermes install branch targets global and project-linked skill roots', () => {
    assert.ok(
      installSrc.includes("const skillsDir = path.join(targetDir, 'skills')"),
      'Hermes branch installs under the resolved target skills directory'
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
    assert.ok(fs.existsSync(hermesHelpSkillPath(path.join(tmpProject, '.gsd-hermes'))));
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
    const gsdSkillDirs = fs.readdirSync(path.join(skillsDir, 'gsd'), { withFileTypes: true })
      .filter(entry => entry.isDirectory());

    assert.ok(gsdSkillDirs.length > 0, 'GSD skills installed under ~/.hermes/skills/gsd');
    const helpSkillPath = hermesHelpSkillPath(hermesRoot);
    assert.ok(fs.existsSync(helpSkillPath), 'gsd-help skill exists');
    const helpSkill = fs.readFileSync(helpSkillPath, 'utf8');
    assert.match(helpSkill, /^name:\s+help$/m, 'Hermes nested gsd/help skill uses bare command frontmatter');
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

// =============================================================================
// Phase 7 Plan 02: HERM-01/02 install smoke triad + INST-01/02 SDK decouple triad
// =============================================================================

describe('HERM-01/02 install modes end-to-end', () => {
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

  test('HERM-01: --hermes --global writes ~/.hermes/skills/gsd/help/SKILL.md', () => {
    const result = runInstaller(['--hermes', '--global', '--no-sdk'], { home: tmpHome, cwd: tmpProject });
    assert.strictEqual(result.status, 0, `installer exit != 0:\n${result.stdout}\n${result.stderr}`);
    const skillPath = hermesHelpSkillPath(path.join(tmpHome, '.hermes'));
    assert.ok(fs.existsSync(skillPath), `missing ${skillPath}`);
    const skill = fs.readFileSync(skillPath, 'utf8');
    assert.match(skill, /name:\s*help/, 'SKILL.md must declare name: help frontmatter');
  });

  test('HERM-02: --hermes --local writes .gsd-hermes/skills + registers external_dirs', () => {
    const result = runInstaller(['--hermes', '--local', '--no-sdk'], { home: tmpHome, cwd: tmpProject });
    assert.strictEqual(result.status, 0, `installer exit != 0:\n${result.stdout}\n${result.stderr}`);
    const localSkill = hermesHelpSkillPath(path.join(tmpProject, '.gsd-hermes'));
    assert.ok(fs.existsSync(localSkill), `missing ${localSkill}`);
    const configYamlPath = path.join(tmpHome, '.hermes', 'config.yaml');
    assert.ok(fs.existsSync(configYamlPath), 'config.yaml must be written');
    const yaml = fs.readFileSync(configYamlPath, 'utf8');
    assert.match(yaml, /external_dirs:/, 'config.yaml must declare skills.external_dirs block');
    // The registered path may be either tmpProject or its canonical form on macOS — accept both
    const escaped = tmpProject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const canonicalAlt = escaped.replace('/var/', '(?:/private)?/var/');
    assert.match(yaml, new RegExp(canonicalAlt + '/\\.gsd-hermes/skills'),
      `external_dirs must contain registered project skills path (accepting canonical form)`);
  });

  test('HERM-02 (macOS): /var/folders path canonicalizes to /private/var in external_dirs', () => {
    if (process.platform !== 'darwin') return;  // platform-guarded spot check per §Assumption A2
    const result = runInstaller(['--hermes', '--local', '--no-sdk'], { home: tmpHome, cwd: tmpProject });
    assert.strictEqual(result.status, 0, `installer exit != 0:\n${result.stdout}\n${result.stderr}`);
    const yaml = fs.readFileSync(path.join(tmpHome, '.hermes', 'config.yaml'), 'utf8');
    // mktemp on macOS gives /var/folders/...; canonical form is /private/var/folders/...
    assert.match(yaml, /\/private\/var\/folders\//,
      'macOS canonicalization must rewrite /var/folders/... → /private/var/folders/... in external_dirs');
  });
});

// INST-01 triad coverage map (D-14):
//   Check 1 (direct require resolves)       — this describe, "check 1" test (below)
//   Check 2 (semantic exercise — SDK load)  — Plan 02 Task 2 (tests/hermes-sdk-query.test.cjs)
//                                             gsd-sdk query invocations load @anthropic-ai/claude-agent-sdk
//                                             via the SDK runtime chain (session-runner.ts → claude-agent-sdk)
//   Check 3 (decouple: esbuild/vitest absent from root deps + SDK tree) — this describe, "check 3" test (below)
describe('INST-01: @anthropic-ai/claude-agent-sdk decouple + INST-02: chmod 0o755', () => {
  test('INST-01 check 1: require("@anthropic-ai/claude-agent-sdk") resolves without throw', () => {
    assert.doesNotThrow(() => require('@anthropic-ai/claude-agent-sdk'),
      'SDK dependency must be resolvable — regression surface for upstream #2457 decoupling');
  });

  test('INST-01 check 3: esbuild and vitest are root devDeps, not runtime SDK deps (root decouple proof + SDK install-path check per D-14)', () => {
    // Build-from-source decouple check: esbuild/vitest may exist at root as devDeps (for scripts/build-hooks.js
    // and test harness), but MUST NOT appear as direct runtime deps of @anthropic-ai/claude-agent-sdk.
    // Per D-14 literal wording "absent in the SDK's direct tree", we additionally verify sdk/package.json itself
    // does not list esbuild/vitest in its own `dependencies` block — covers the SDK's install-path tree, not just
    // the root #2457 decouple surface.
    const rootPkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
    const runtimeDeps = rootPkg.dependencies || {};
    assert.ok(!runtimeDeps.esbuild, 'esbuild must NOT be in root runtime dependencies (it is a devDep for hook builds)');
    assert.ok(!runtimeDeps.vitest, 'vitest must NOT be in root runtime dependencies (it is a devDep for tests)');
    assert.ok(runtimeDeps['@anthropic-ai/claude-agent-sdk'], 'Claude agent SDK must be a runtime dep');

    // D-14 Check 3 (SDK install-path tree): sdk/package.json MUST NOT list esbuild/vitest as runtime deps.
    // This closes the literal "absent in the SDK's direct tree" aspect of D-14 alongside the root decouple proof.
    const sdkPkgPath = path.join(__dirname, '..', 'sdk', 'package.json');
    if (fs.existsSync(sdkPkgPath)) {
      const sdkPkg = JSON.parse(fs.readFileSync(sdkPkgPath, 'utf8'));
      const sdkDeps = sdkPkg.dependencies || {};
      assert.ok(!sdkDeps.esbuild,
        'esbuild must NOT be in sdk/package.json dependencies (D-14 literal: "absent in the SDK\'s direct tree")');
      assert.ok(!sdkDeps.vitest,
        'vitest must NOT be in sdk/package.json dependencies (D-14 literal: "absent in the SDK\'s direct tree")');
    }
  });

  test('INST-02: scripts/verify-fork-identity.cjs has mode 0o755 on non-Windows',
    { skip: process.platform === 'win32' },
    () => {
      const scriptPath = path.join(__dirname, '..', 'scripts', 'verify-fork-identity.cjs');
      assert.ok(fs.existsSync(scriptPath), 'verify-fork-identity.cjs must exist (Phase 6 Plan 01 scaffolding)');
      const mode = fs.statSync(scriptPath).mode & 0o777;
      assert.strictEqual(mode, 0o755,
        `verify-fork-identity.cjs mode is 0o${mode.toString(8)}, expected 0o755 per Phase 6 Plan 01`);
    });

  test('INST-02: sdk/dist/cli.js has mode 0o755 on non-Windows (if built)',
    { skip: process.platform === 'win32' },
    () => {
      const cliPath = path.join(__dirname, '..', 'sdk', 'dist', 'cli.js');
      if (!fs.existsSync(cliPath)) {
        // SDK dist not built in this environment — skip assertion (test:hermes does NOT auto-build SDK).
        // Upstream #2525 regression: re-run after `npm install` to catch strip-exec-bit drift.
        return;
      }
      const mode = fs.statSync(cliPath).mode & 0o777;
      assert.strictEqual(mode, 0o755,
        `sdk/dist/cli.js mode is 0o${mode.toString(8)}, expected 0o755 per upstream #2525`);
    });
});
'use strict';
/**
 * Regression test for #3691 — Hermes install doubles the profile path.
 *
 * `HERMES_HOME` may point at a profile dir (`~/.hermes/profiles/<name>`), so the
 * installer's pathPrefix is `$HOME/.hermes/profiles/<name>/`. The per-form
 * `String.replace` chain expanded `~/.claude/` → prefix first and then matched
 * the `.hermes/` anchor *inside that freshly written prefix*, producing
 * `.../profiles/<name>/profiles/<name>/...`. Every `@`-included workflow file
 * then failed to resolve at runtime.
 *
 * The contract asserted here is behavioral: run the real installer, then check
 * that every `$HOME/...` reference it wrote points at a path that exists.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createTempDir, cleanup } = require('./helpers.cjs');

const installPath = path.join(__dirname, '..', 'bin', 'install.js');

/** Run the installer with HERMES_HOME unset and an explicit config dir. */
function installHermesProfile(configDir) {
  const env = { ...process.env, HOME: configDir.home };
  delete env.HERMES_HOME;
  delete env.GSD_TEST_MODE;
  return spawnSync(
    process.execPath,
    [installPath, '--hermes', '--global', '--config-dir', configDir.config],
    { env, encoding: 'utf8' }
  );
}

/**
 * Every `$HOME/<path>` reference in installed markdown, as paths relative to
 * the install root. Strips markdown/punctuation noise and skips template
 * variables such as `$dir`.
 */
function homeReferences(installRoot, homeDir) {
  const refs = [];
  const pattern = /\$HOME(\/[^\s`"')\]]+)/g;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.md')) {
        const content = fs.readFileSync(full, 'utf8');
        for (const [, suffix] of content.matchAll(pattern)) {
          const cleaned = suffix.replace(/[.,;:*`]+$/, '').replace(/\/$/, '');
          // Skip shell/template variables (`$dir`, `{name}`) — not literal paths.
          if (cleaned.includes('$') || cleaned.includes('{')) continue;
          refs.push({ file: path.relative(installRoot, full), abs: homeDir + cleaned });
        }
      }
    }
  };
  walk(installRoot);
  return refs;
}

describe('#3691 Hermes profile install path expansion', () => {
  test('profile-layout install produces no doubled path segment', () => {
    const home = createTempDir('gsd-3691-home-');
    const config = path.join(home, '.hermes', 'profiles', 'work');
    fs.mkdirSync(config, { recursive: true });
    try {
      const result = installHermesProfile({ home, config });
      assert.strictEqual(result.status, 0, result.stderr);

      const doubled = path.join(config, 'profiles', 'work');
      const refs = homeReferences(config, home);
      const offenders = refs.filter((ref) => ref.abs.startsWith(doubled));
      assert.deepStrictEqual(
        offenders.map((o) => `${o.file}: ${o.abs}`),
        [],
        'no reference may repeat the profile segment'
      );
    } finally {
      cleanup(home);
    }
  });

  test('every $HOME reference written by a profile install resolves on disk', () => {
    const home = createTempDir('gsd-3691-resolve-');
    const config = path.join(home, '.hermes', 'profiles', 'work');
    fs.mkdirSync(config, { recursive: true });
    try {
      const result = installHermesProfile({ home, config });
      assert.strictEqual(result.status, 0, result.stderr);

      // Only workflow/reference/template targets are asserted: those are files
      // the installer copies, so a correct install always ships them. Output
      // paths it does not create (e.g. USER-PROFILE.md) are out of scope.
      const shipped = /get-shit-done\/(workflows|references|templates)\//;
      const broken = homeReferences(config, home)
        .filter((ref) => shipped.test(ref.abs))
        .filter((ref) => !fs.existsSync(ref.abs))
        .map((ref) => `${ref.file}: ${ref.abs}`);
      assert.deepStrictEqual(broken, [], 'shipped workflow references must resolve');
    } finally {
      cleanup(home);
    }
  });

  test('a non-profile install is unaffected (prefix has no .hermes anchor)', () => {
    const home = createTempDir('gsd-3691-plain-');
    const config = path.join(home, 'plain-config');
    fs.mkdirSync(config, { recursive: true });
    try {
      const result = installHermesProfile({ home, config });
      assert.strictEqual(result.status, 0, result.stderr);

      // Same contract as the profile case: references must resolve, and none
      // may repeat the install root.
      const shipped = /get-shit-done\/(workflows|references|templates)\//;
      const refs = homeReferences(config, home).filter((ref) => shipped.test(ref.abs));
      assert.ok(refs.length > 0, 'install wrote workflow references');
      assert.deepStrictEqual(
        refs.filter((ref) => !fs.existsSync(ref.abs)).map((ref) => ref.abs),
        [],
        'plain install references must resolve'
      );
    } finally {
      cleanup(home);
    }
  });
});

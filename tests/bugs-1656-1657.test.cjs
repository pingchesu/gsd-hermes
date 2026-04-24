/**
 * Regression tests for:
 *   #1656 — 3 bash hooks referenced in settings.json but never installed
 *   #1657 — SDK install prompt fires and fails during interactive install
 */

'use strict';

process.env.GSD_TEST_MODE = '1';

const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const HOOKS_DIST = path.join(__dirname, '..', 'hooks', 'dist');
const BUILD_SCRIPT = path.join(__dirname, '..', 'scripts', 'build-hooks.js');
const INSTALL_SRC = path.join(__dirname, '..', 'bin', 'install.js');

// ─── #1656 ───────────────────────────────────────────────────────────────────

describe('#1656: community .sh hooks must be present in hooks/dist', () => {
  // Run the build script once before checking outputs.
  // hooks/dist/ is gitignored so it must be generated; this mirrors what
  // `npm run build:hooks` (prepublishOnly) does before publish.
  before(() => {
    execFileSync(process.execPath, [BUILD_SCRIPT], {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
  });

  test('gsd-session-state.sh exists in hooks/dist', () => {
    const p = path.join(HOOKS_DIST, 'gsd-session-state.sh');
    assert.ok(fs.existsSync(p), 'gsd-session-state.sh must be in hooks/dist/ so the installer can copy it');
  });

  test('gsd-validate-commit.sh exists in hooks/dist', () => {
    const p = path.join(HOOKS_DIST, 'gsd-validate-commit.sh');
    assert.ok(fs.existsSync(p), 'gsd-validate-commit.sh must be in hooks/dist/ so the installer can copy it');
  });

  test('gsd-phase-boundary.sh exists in hooks/dist', () => {
    const p = path.join(HOOKS_DIST, 'gsd-phase-boundary.sh');
    assert.ok(fs.existsSync(p), 'gsd-phase-boundary.sh must be in hooks/dist/ so the installer can copy it');
  });
});

// ─── #1657 / #2385 — updated for upstream fix/2441-sdk-decouple ────────────
//
// Historical context: #1657 originally guarded against a broken `promptSdk()`
// flow. #2385 restored --sdk / --no-sdk flags and made SDK install the
// default path — back when the installer still built from source.
//
// POST-#2441 CONTRACT (Phase 7.2 Plan 04, commit e9447dac): the installer
// NO LONGER builds from source. sdk/dist/ ships prebuilt inside the tarball;
// root package.json declares `bin.gsd-sdk` so npm wires the shim correctly
// at tarball-extract time. See tests/bug-2441-sdk-decouple.test.cjs for the
// authoritative post-#2441 regression gates (F10/F11/F12/F13/F14).
//
// Fork-ownership (docs/fork-ownership.md): upstream-carried test file.
// Per Phase 7.2 D-03, the SDK-install subtests are updated to assert the
// post-#2441 Hermes contract: --sdk / --no-sdk flags still honored, dist is
// verified not built, tarball ships sdk/dist. promptSdk() still forbidden.

describe('#1657 / #2385: SDK handling wired into installer (post-#2441)', () => {
  let src;
  test('install.js does not contain the legacy promptSdk() prompt (#1657)', () => {
    src = fs.readFileSync(INSTALL_SRC, 'utf-8');
    assert.ok(
      !src.includes('promptSdk('),
      'promptSdk() must not be reintroduced — the old interactive prompt flow was broken'
    );
  });

  test('install.js wires up --sdk / --no-sdk flag handling (#2385)', () => {
    src = src || fs.readFileSync(INSTALL_SRC, 'utf-8');
    assert.ok(
      src.includes("args.includes('--sdk')"),
      '--sdk flag must be parsed so users can force SDK (re)install'
    );
    assert.ok(
      src.includes("args.includes('--no-sdk')"),
      '--no-sdk flag must be parsed so users can opt out of SDK install'
    );
  });

  test('install.js verifies prebuilt sdk/dist/cli.js instead of building from source (post-#2441)', () => {
    src = src || fs.readFileSync(INSTALL_SRC, 'utf-8');
    // Post-#2441: the installer references sdk/dist/cli.js and calls
    // fs.existsSync on it. It does NOT spawn `npm run build` or
    // `npm install -g` — those paths were removed by Phase 7.2 Plan 04.
    assert.ok(
      src.includes('sdk/dist/cli.js') ||
      src.includes("'sdk', 'dist', 'cli.js'"),
      'installer must reference sdk/dist/cli.js as the dist-verify target (post-#2441)'
    );
    assert.ok(
      src.includes("path.resolve(__dirname, '..', 'sdk'"),
      'installer must locate sdk/ via path.resolve(__dirname, "..", "sdk", ...)'
    );
  });

  test('install.js exits fatally when sdk/dist/cli.js is missing (post-#2441)', () => {
    src = src || fs.readFileSync(INSTALL_SRC, 'utf-8');
    const fnStart = src.indexOf('function installSdkIfNeeded()');
    assert.ok(fnStart !== -1, 'installSdkIfNeeded function must exist in install.js');
    const fnEnd = src.indexOf('\nfunction ', fnStart + 1);
    const fnBody = fnEnd !== -1 ? src.slice(fnStart, fnEnd) : src.slice(fnStart);

    assert.ok(
      fnBody.includes('process.exit(1)'),
      'installSdkIfNeeded must exit fatally (process.exit(1)) when sdk/dist/cli.js is missing — ' +
      'post-#2441 contract: no silent build-from-source fallback'
    );
    assert.ok(
      fnBody.includes('cd sdk'),
      'installSdkIfNeeded must print a hint directing git-clone users to build the SDK manually ' +
      '(hint string uses concatenation to avoid bare-substring collision — Option α)'
    );
  });

  test('package.json ships prebuilt sdk/dist in published tarball (post-#2441 F14)', () => {
    const rootPkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));
    const files = rootPkg.files || [];
    // Post-#2441: the tarball ships the prebuilt sdk/dist/ directory so
    // every install has an immediately-usable gsd-sdk shim without a
    // build-from-source step.
    assert.ok(
      files.includes('sdk/dist'),
      'root package.json `files` must include sdk/dist so the prebuilt CLI ships in the tarball (post-#2441)'
    );
    // Dev/clone builds still need sdk/src — preserved post-#2441 for source parity.
    assert.ok(
      files.some((f) => f === 'sdk/src' || f.startsWith('sdk/src')),
      'root package.json `files` should still include sdk/src for developer builds'
    );
  });
});

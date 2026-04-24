/**
 * Regression test for bug #2525 — updated for upstream fix/2441-sdk-decouple
 *
 * ORIGINAL PREMISE (pre-#2441): installSdkIfNeeded ran `npm run build` then
 * `npm install -g .`; between those two steps, dist/cli.js was at mode 644;
 * the installer had to chmod it to 0o755 to make gsd-sdk executable on
 * Homebrew/macOS setups.
 *
 * POST-#2441 CONTRACT (Phase 7.2 Plan 04, commit e9447dac): installSdkIfNeeded
 * no longer runs `npm run build` or `npm install -g`. sdk/dist/ ships prebuilt
 * inside the tarball. The #2525 execute-bit concern is defended at THREE
 * distinct layers:
 *   1. Publish-time: sdk/package.json `prepublishOnly` runs `chmod +x dist/cli.js`
 *   2. Build-time (local dev): sdk/package.json `postbuild` runs `chmod 755 dist/cli.js`
 *   3. Install-time (fallback): bin/install.js::installSdkIfNeeded does an
 *      in-place `fs.chmodSync(sdkCliPath, stat.mode | 0o111)` when the
 *      execute bit is missing (e.g., git-clone developer setups)
 *
 * Fork-ownership (docs/fork-ownership.md): upstream-carried test file.
 * Per Phase 7.2 D-03, updated to assert the post-#2441 Hermes contract.
 * See tests/bug-2441-sdk-decouple.test.cjs for the authoritative post-#2441
 * regression gates (F10/F11/F12/F13/F14) and the no-build-from-source proof.
 */

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const INSTALL_PATH = path.join(__dirname, '..', 'bin', 'install.js');
const SDK_PKG_PATH = path.join(__dirname, '..', 'sdk', 'package.json');

describe('bug #2525: dist/cli.js execute-bit defended at publish/build/install (post-#2441)', () => {
  test('install.js exists', () => {
    assert.ok(fs.existsSync(INSTALL_PATH), 'bin/install.js should exist');
  });

  test('layer 3: installSdkIfNeeded applies in-place execute-bit guard on sdk/dist/cli.js', () => {
    const content = fs.readFileSync(INSTALL_PATH, 'utf-8');
    // Find the installSdkIfNeeded function body
    const fnStart = content.indexOf('function installSdkIfNeeded()');
    assert.ok(fnStart !== -1, 'installSdkIfNeeded function must exist in bin/install.js');

    // Find the closing brace of the function (next top-level function definition)
    const nextFnIdx = content.indexOf('\nfunction ', fnStart + 1);
    const fnEnd = nextFnIdx === -1 ? content.length : nextFnIdx;
    const fnBody = content.slice(fnStart, fnEnd);

    // Post-#2441: installSdkIfNeeded does NOT spawn `npm run build` or
    // `npm install -g` — the dist is shipped prebuilt. The function instead
    // verifies sdk/dist/cli.js exists (fatal if missing) and chmods in-place
    // if the execute bit has drifted. Assert the verify + chmod invariants.
    const hasExistsCheck = fnBody.includes('existsSync');
    const hasCliRef = fnBody.includes("'cli.js'") || fnBody.includes('sdk/dist/cli.js');
    const hasChmod = fnBody.includes('chmodSync');
    const hasExecBit = fnBody.includes('0o111') || fnBody.includes('0o755');

    assert.ok(hasExistsCheck, 'installSdkIfNeeded must call fs.existsSync on the sdk CLI path');
    assert.ok(hasCliRef, "installSdkIfNeeded must reference 'cli.js' (post-#2441 dist-verify)");
    assert.ok(hasChmod, 'installSdkIfNeeded must call chmodSync for in-place execute-bit guard');
    assert.ok(hasExecBit, 'chmodSync must OR in 0o111 execute bits (or apply absolute 0o755)');
  });

  test('layer 1 (publish) + layer 2 (build): sdk/package.json hardens dist/cli.js mode', () => {
    const sdkPkg = JSON.parse(fs.readFileSync(SDK_PKG_PATH, 'utf-8'));
    const scripts = sdkPkg.scripts || {};

    // Publish-time defense: prepublishOnly runs chmod on dist/cli.js
    assert.ok(
      scripts.prepublishOnly && scripts.prepublishOnly.includes('chmod') &&
        scripts.prepublishOnly.includes('dist/cli.js'),
      'sdk/package.json prepublishOnly must chmod dist/cli.js (publish-time defense)'
    );

    // Build-time defense: postbuild hook (Hermes-only hardening — Phase 7.1 INST-02)
    assert.ok(
      scripts.postbuild && scripts.postbuild.includes('chmod') &&
        scripts.postbuild.includes('dist/cli.js'),
      'sdk/package.json postbuild must chmod dist/cli.js (build-time defense; ' +
      'Hermes-only Phase 7.1 INST-02 hardening preserved after Phase 7.2 Plan 04)'
    );
  });
});

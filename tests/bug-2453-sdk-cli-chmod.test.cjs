/**
 * Regression test for bug #2453 — updated for upstream fix/2441-sdk-decouple
 *
 * ORIGINAL PREMISE (pre-#2441): installSdkIfNeeded() built dist/cli.js via tsc
 * then ran `npm install -g .`. The global install left dist/cli.js at mode 644;
 * the installer had to chmod it to 0o755 explicitly.
 *
 * POST-#2441 CONTRACT (Phase 7.2 Plan 04, commit e9447dac): installSdkIfNeeded
 * no longer builds from source and no longer runs `npm install -g`. Instead,
 * sdk/dist/ ships prebuilt inside the tarball and npm chmods the parent's
 * `bin.gsd-sdk` shim correctly at tarball-extract time. The installer only
 * verifies sdk/dist/cli.js exists and applies an in-place chmod fallback for
 * git-clone setups where the on-disk mode drifted.
 *
 * Fork-ownership (docs/fork-ownership.md): upstream-carried test file.
 * Per Phase 7.2 D-03, updated to assert the post-#2441 Hermes contract.
 * See tests/bug-2441-sdk-decouple.test.cjs for the authoritative post-#2441
 * regression gates (F10/F11/F12/F13/F14).
 *
 * The #2453 root cause (execute bit on dist/cli.js) is still addressed —
 * it's now defended at THREE layers:
 *   1. Publish-time: sdk/package.json prepublishOnly runs `chmod +x dist/cli.js`
 *   2. Build-time (local dev): sdk/package.json postbuild runs `chmod 755 dist/cli.js`
 *   3. Install-time (fallback): bin/install.js::installSdkIfNeeded does an
 *      in-place `fs.chmodSync(sdkCliPath, stat.mode | 0o111)` when the
 *      execute bit is missing
 * Layer 3 is what these subtests now assert.
 */

'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const INSTALL_SRC = path.join(__dirname, '..', 'bin', 'install.js');

describe('bug #2453: installSdkIfNeeded guards execute bit on sdk/dist/cli.js (post-#2441)', () => {
  let installSrc;

  test('install.js source exists', () => {
    assert.ok(fs.existsSync(INSTALL_SRC), 'bin/install.js must exist');
    installSrc = fs.readFileSync(INSTALL_SRC, 'utf-8');
  });

  test('installSdkIfNeeded contains an in-place chmodSync for sdk/dist/cli.js execute bit', () => {
    installSrc = installSrc || fs.readFileSync(INSTALL_SRC, 'utf-8');

    // Locate the installSdkIfNeeded function body
    const fnStart = installSrc.indexOf('function installSdkIfNeeded()');
    assert.ok(fnStart !== -1, 'installSdkIfNeeded function must exist in install.js');

    // Find the end of the function (next top-level function declaration)
    const fnEnd = installSrc.indexOf('\nfunction ', fnStart + 1);
    const fnBody = fnEnd !== -1 ? installSrc.slice(fnStart, fnEnd) : installSrc.slice(fnStart);

    // Post-#2441: chmodSync is applied in-place on the verified sdk/dist/cli.js
    // path (sdkCliPath variable). It restores the execute bit when the on-disk
    // artifact has drifted below 0o755 (e.g., a git clone that committed at 0o644).
    const hasChmod = fnBody.includes('chmodSync') &&
                     (fnBody.includes('sdkCliPath') || fnBody.includes("'cli.js'"));
    assert.ok(
      hasChmod,
      'installSdkIfNeeded must call chmodSync on sdk/dist/cli.js as an in-place ' +
      'execute-bit guard (#2453 defense-in-depth, post-#2441). See ' +
      'tests/bug-2441-sdk-decouple.test.cjs for the no-build-from-source contract.'
    );
  });

  test('chmodSync restores execute bits (adds 0o111 — upstream #2441 idiom)', () => {
    installSrc = installSrc || fs.readFileSync(INSTALL_SRC, 'utf-8');

    const fnStart = installSrc.indexOf('function installSdkIfNeeded()');
    const fnEnd = installSrc.indexOf('\nfunction ', fnStart + 1);
    const fnBody = fnEnd !== -1 ? installSrc.slice(fnStart, fnEnd) : installSrc.slice(fnStart);

    // Upstream fix/2441-sdk-decouple uses `stat.mode | 0o111` to OR in the
    // execute bits without disturbing read/write bits. This is strictly more
    // conservative than the pre-#2441 hard-coded 0o755 because it preserves
    // any group/other permissions the user set intentionally.
    const hasExecBit = fnBody.includes('0o111') || fnBody.includes('0o755');
    assert.ok(
      hasExecBit,
      'chmodSync call in installSdkIfNeeded must add execute bits ' +
      '(0o111 OR with stat.mode — upstream #2441 idiom — or absolute 0o755)'
    );
  });

  test('installSdkIfNeeded verifies sdk/dist/cli.js existence (fatal if missing — post-#2441)', () => {
    installSrc = installSrc || fs.readFileSync(INSTALL_SRC, 'utf-8');

    const fnStart = installSrc.indexOf('function installSdkIfNeeded()');
    const fnEnd = installSrc.indexOf('\nfunction ', fnStart + 1);
    const fnBody = fnEnd !== -1 ? installSrc.slice(fnStart, fnEnd) : installSrc.slice(fnStart);

    // Post-#2441 contract: no `npm install -g` step exists. Instead, the
    // function verifies sdk/dist/cli.js exists on-disk (it ships in the tarball
    // per root package.json files[]) and fails fatally if not.
    const existsCheck = fnBody.indexOf('existsSync') !== -1;
    const cliRef = fnBody.indexOf('sdk/dist/cli.js') !== -1 ||
                   fnBody.indexOf("'dist', 'cli.js'") !== -1 ||
                   fnBody.indexOf("'cli.js'") !== -1;
    const fatal = fnBody.indexOf('process.exit(1)') !== -1;

    assert.ok(existsCheck, 'installSdkIfNeeded must call fs.existsSync on the sdk CLI path (post-#2441)');
    assert.ok(cliRef, 'installSdkIfNeeded must reference sdk/dist/cli.js (post-#2441 dist-verify contract)');
    assert.ok(fatal, 'installSdkIfNeeded must exit fatally via process.exit(1) when dist is missing');
  });
});

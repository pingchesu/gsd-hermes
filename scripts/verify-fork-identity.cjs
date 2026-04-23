#!/usr/bin/env node

const pkg = require('../package.json');
const assert = require('node:assert/strict');

// Identity
assert.strictEqual(pkg.name, 'gsd-hermes',
  `package.json name must be 'gsd-hermes', got '${pkg.name}'`);

// bin entries (downstream-first ordering)
assert.ok(pkg.bin && pkg.bin['gsd-hermes'] === 'bin/install.js',
  'bin.gsd-hermes must map to bin/install.js');
assert.ok(pkg.bin['get-shit-done-cc'] === 'bin/install.js',
  'bin.get-shit-done-cc must still map to bin/install.js (upstream parity bin)');

// Version is on downstream semver line (NOT upstream 1.38.x or 1.39.x)
// Phase 6 accepts 1.2.x (pre-release-metadata) OR 1.3.x (post-release-metadata)
const version = pkg.version;
assert.ok(/^1\.(2|3)\.\d+/.test(version),
  `package.json version must be on gsd-hermes 1.2.x or 1.3.x line, got '${version}'`);
assert.ok(!/^1\.3[89]\./.test(version),
  `package.json version must NOT be on upstream 1.38.x/1.39.x line (identity drift); got '${version}'`);

// files[] preserves Hermes-owned paths
const requiredFiles = ['bin', 'get-shit-done', 'commands', 'agents', 'hooks', 'scripts',
                       'sdk/src', 'sdk/prompts'];
for (const f of requiredFiles) {
  assert.ok(pkg.files.includes(f),
    `package.json files[] must include '${f}' (upstream-aligned file entry)`);
}
const hermesFiles = ['docs/hermes-install.md', 'docs/hermes-compatibility.md', 'docs/upstream-sync.md'];
for (const f of hermesFiles) {
  assert.ok(pkg.files.includes(f),
    `package.json files[] must include '${f}' (downstream-added Hermes doc)`);
}

// Hermes-specific script presence
assert.ok(pkg.scripts && pkg.scripts['test:hermes'],
  'package.json scripts.test:hermes must exist (Hermes compatibility gate)');

// Homepage/repo still point downstream
assert.ok(pkg.repository && pkg.repository.url.includes('pingchesu/gsd-hermes'),
  `repository.url must point to downstream fork, got '${pkg.repository && pkg.repository.url}'`);
assert.ok(pkg.homepage && pkg.homepage.includes('pingchesu/gsd-hermes'),
  `homepage must point to downstream fork, got '${pkg.homepage}'`);

console.log('✓ Fork identity intact: gsd-hermes@' + version);
process.exit(0);

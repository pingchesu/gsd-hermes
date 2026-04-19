const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

test.describe('Hermes compatibility validation command', () => {
  test.it('publishes under the gsd-hermes package identity with a compatibility bin', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    assert.equal(packageJson.name, 'gsd-hermes');
    assert.equal(packageJson.bin['gsd-hermes'], 'bin/install.js');
    assert.equal(packageJson.bin['get-shit-done-cc'], 'bin/install.js');
    assert.equal(
      packageJson.repository.url,
      'git+https://github.com/pingchesu/gsd-hermes.git'
    );
    assert.equal(packageJson.homepage, 'https://github.com/pingchesu/gsd-hermes');
    assert.equal(packageJson.bugs.url, 'https://github.com/pingchesu/gsd-hermes/issues');
  });

  test.it('packs Hermes operator docs needed by npm users', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    assert.ok(packageJson.files.includes('docs/hermes-install.md'));
    assert.ok(packageJson.files.includes('docs/hermes-compatibility.md'));
    assert.ok(packageJson.files.includes('docs/upstream-sync.md'));
  });

  test.it('exposes npm script for targeted Hermes compatibility validation', () => {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    assert.equal(
      packageJson.scripts['test:hermes'],
      'node scripts/validate-hermes-compat.cjs'
    );
  });

  test.it('runs the deterministic Hermes compatibility test set', () => {
    const script = fs.readFileSync('scripts/validate-hermes-compat.cjs', 'utf8');

    assert.ok(script.includes('spawnSync(process.execPath'));
    assert.ok(script.includes('tests/hermes-core-workflow.test.cjs'));
    assert.ok(script.includes('tests/hermes-lifecycle.test.cjs'));
    assert.ok(script.includes('tests/hermes-docs.test.cjs'));
    assert.ok(script.includes('tests/multi-runtime-select.test.cjs'));
  });
});

test.describe('Hermes upstream sync documentation', () => {
  test.it('documents post-sync validation and release blocker criteria', () => {
    const syncDoc = fs.readFileSync('docs/upstream-sync.md', 'utf8');

    [
      'Post-Sync Validation Checklist',
      'Release Blocker Criteria',
      'git status --short',
      'npm run test:hermes',
      'npm test',
      'optional real Hermes CLI unavailability',
      'Upstream base',
      'Hermes adapter seam',
      'Downstream governance',
    ].forEach(expected => {
      assert.ok(syncDoc.includes(expected), `missing ${expected}`);
    });
  });
});

// allow-test-rule: Hermes downstream regression tests intentionally assert installer/docs/CLI text contracts where no typed IR exists yet.
/**
 * GSD Tools Tests - Hermes Docs and Compatibility
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const installGuide = fs.readFileSync('docs/hermes-install.md', 'utf8');
const compatibility = fs.readFileSync('docs/hermes-compatibility.md', 'utf8');
const docsIndex = fs.readFileSync('docs/README.md', 'utf8');
const installer = fs.readFileSync('bin/install.js', 'utf8');

describe('Hermes install documentation', () => {
  test('documents global and project-linked command discovery', () => {
    for (const expected of [
      '--hermes --global',
      '--hermes --local',
      'skills.external_dirs',
      '.gsd-hermes/skills',
      '/gsd-help',
      '/gsd-progress',
      'Phase 4',
      'Phase 5',
    ]) {
      assert.ok(installGuide.includes(expected), `missing ${expected}`);
    }
  });

  test('documents core workflow smoke and degraded paths', () => {
    for (const expected of [
      'Core Workflow Smoke',
      'Optional real Hermes smoke',
      'node --test tests/hermes-core-workflow.test.cjs',
      'hermes chat -q "/gsd-help"',
      '/gsd-new-project',
      '/gsd-discuss-phase 1 --auto',
      '/gsd-plan-phase 1 --auto',
      'AskUserQuestion',
      'Task',
    ]) {
      assert.ok(installGuide.includes(expected), `missing ${expected}`);
    }
  });

  test('documents Hermes lifecycle commands', () => {
    for (const expected of [
      'Hermes Lifecycle',
      '### Update',
      '### Uninstall',
      '### Doctor',
      'npx gsd-hermes --hermes --global',
      'npx gsd-hermes --hermes --local',
      'npx gsd-hermes --hermes --global --uninstall',
      'npx gsd-hermes --hermes --local --uninstall',
      'npx gsd-hermes --hermes --global --doctor',
      'npx gsd-hermes --hermes --local --doctor',
      'project-linked uninstall removes only the matching',
      'Doctor is read-only',
    ]) {
      assert.ok(installGuide.includes(expected), `missing ${expected}`);
    }
  });

  test('is linked from docs index', () => {
    assert.ok(docsIndex.includes('hermes-install.md'));
  });

  test('documents Phase 6 compatibility closure', () => {
    for (const expected of [
      '## Compatibility Validation',
      'npm run test:hermes',
      'npm test',
    ]) {
      assert.ok(installGuide.includes(expected), `missing ${expected}`);
    }

    assert.ok(docsIndex.includes('validation matrix and maintenance contract'));
    assert.ok(docsIndex.includes('post-sync validation checklist'));
  });
});

describe('Hermes compatibility matrix', () => {
  test('pins Phase 3 support and later-phase boundaries', () => {
    for (const expected of [
      'Global Hermes install | supported',
      'Project-linked external_dirs mode | supported',
      'Command discovery for /gsd-* | supported',
      'Core workflow execution | supported with degraded paths',
      'Update / uninstall / doctor | supported',
      'Phase 5 complete',
      'deterministic fixture coverage',
      'Validation evidence',
      'npm run test:hermes',
      '## Maintenance Contract',
      'Project-linked mode uses skills.external_dirs instead.',
      'known gaps instead of claiming unsupported parity',
      'Native local Hermes install mode | out of scope',
    ]) {
      assert.ok(compatibility.includes(expected), `missing ${expected}`);
    }
  });
});

describe('Hermes installer copy', () => {
  test('reflects supported discovery without stale planned-later wording', () => {
    for (const expected of [
      'project-linked mode',
      'skills.external_dirs',
      '/gsd-help',
    ]) {
      assert.ok(installer.includes(expected), `missing ${expected}`);
    }

    assert.ok(!installer.includes('command discovery are planned for later phases'));
  });
});

describe('SLASH-02: docs ↔ produced-skill inventory consistency (Phase 7 Plan 03)', () => {
  // HERMES_SLASH_REFS maps each dash-form slash command asserted in
  // docs/hermes-compatibility.md § Slash Command Inventory to the source
  // command file the installer iterates in `commands/gsd/*.md`. The
  // installer produces skill directories named `gsd-<cmd>/SKILL.md` by
  // reading that source directory at runtime (see copyCommandsAsClaudeSkills
  // delegate invoked by copyCommandsAsHermesSkills); the skill names are
  // NOT hardcoded string literals in bin/install.js. Parity therefore
  // compares the inventory to the source file set rather than to literal
  // substrings in the installer JS.
  const HERMES_SLASH_REFS = [
    { slash: '/gsd-help',          sourceCommand: 'commands/gsd/help.md' },
    { slash: '/gsd-progress',      sourceCommand: 'commands/gsd/progress.md' },
    { slash: '/gsd-new-project',   sourceCommand: 'commands/gsd/new-project.md' },
    { slash: '/gsd-discuss-phase', sourceCommand: 'commands/gsd/discuss-phase.md' },
    { slash: '/gsd-plan-phase',    sourceCommand: 'commands/gsd/plan-phase.md' },
    { slash: '/gsd-execute-phase', sourceCommand: 'commands/gsd/execute-phase.md' },
  ];

  test('every slash command in docs/hermes-compatibility.md § Slash Command Inventory maps to a source file the installer converts into a Hermes skill', () => {
    // Parity check: for each slash reference asserted in the doc inventory,
    // the corresponding source command file in commands/gsd/ MUST exist.
    // bin/install.js::copyCommandsAsHermesSkills discovers commands by
    // iterating that directory, so the file's presence is a stronger
    // guarantee than checking for a literal substring in the installer.
    // Additionally, the installer MUST contain the `gsd-` prefix and the
    // Hermes entry point `copyCommandsAsHermesSkills` so the conversion
    // chain is wired up at all.
    assert.ok(installer.includes('copyCommandsAsHermesSkills'),
      'bin/install.js must define copyCommandsAsHermesSkills as the Hermes skill-generation entry point');
    assert.ok(installer.includes("'gsd-'") || installer.includes('gsd-help'),
      'bin/install.js must reference the gsd- prefix used to produce Hermes skill directories');
    for (const { slash, sourceCommand } of HERMES_SLASH_REFS) {
      if (compatibility.includes(slash)) {
        assert.ok(fs.existsSync(sourceCommand),
          `Source command file ${sourceCommand} must exist since ${slash} is listed in hermes-compatibility.md § Slash Command Inventory (the installer iterates commands/gsd/*.md to produce Hermes skills)`);
      }
    }
  });

  test('docs/hermes-compatibility.md contains § Slash Command Inventory section with all Hermes slash commands', () => {
    assert.ok(compatibility.includes('## Slash Command Inventory'),
      'hermes-compatibility.md missing Slash Command Inventory section (D-13)');
    for (const { slash } of HERMES_SLASH_REFS) {
      assert.ok(compatibility.includes(slash),
        `Slash Command Inventory missing ${slash} — every Hermes user-facing slash command must be listed`);
    }
    // Compatibility boundary rationale must be documented per D-11
    assert.ok(
      compatibility.includes('D-11') || /compatibility boundary/i.test(compatibility),
      'Slash Command Inventory must explain compatibility boundary rationale (D-11)'
    );
  });

  test('Hermes install guide references match the inventory (no orphan dash-form references)', () => {
    // Every /gsd-<cmd> in docs/hermes-install.md MUST appear in the
    // compatibility inventory (reverse direction of the first assertion —
    // prevents docs from referencing unlisted commands).
    const dashRefsInGuide = [...installGuide.matchAll(/\/gsd-[a-z-]+/g)].map(m => m[0]);
    const uniqueRefs = [...new Set(dashRefsInGuide)];
    for (const ref of uniqueRefs) {
      assert.ok(compatibility.includes(ref),
        `docs/hermes-install.md references ${ref} but it is missing from hermes-compatibility.md § Slash Command Inventory`);
    }
  });
});

describe('PROFILE-04: Runtime-Model Composition documentation (Phase 7 Plan 03)', () => {
  test('docs/hermes-compatibility.md contains § Runtime-Model Composition section with required anchors', () => {
    assert.ok(compatibility.includes('## Runtime-Model Composition'),
      'hermes-compatibility.md missing Runtime-Model Composition section (D-04)');

    // D-04 requires: 4 binding paths + Hermes-absent-from-KNOWN_RUNTIMES + SDK/CJS asymmetry
    for (const required of [
      'model_overrides',       // explicit binding path
      'inherit',               // inherit binding path
      'resolve_model_ids',     // runtime-default omission path
      'cross_ai_execution',    // HERM-04 fallback path
      'KNOWN_RUNTIMES',        // Pitfall 1 — Hermes absent from set
      'resolveTierEntry',      // upstream #2517 entry point
    ]) {
      assert.ok(compatibility.includes(required),
        `Runtime-Model Composition must reference ${required}`);
    }
  });

  test('Runtime-Model Composition section documents SDK/CJS field asymmetry (Pitfall 3)', () => {
    // SDK superset adds runtime/runtimeCapability/crossAiExecutionConfigured that CJS omits.
    // The doc must make this explicit so future contributors don't break the intersection contract.
    assert.ok(
      compatibility.includes('crossAiExecutionConfigured') ||
      compatibility.includes('superset'),
      'Runtime-Model Composition must document SDK/CJS asymmetry (runtimeCapability, crossAiExecutionConfigured, superset shape)'
    );
  });
});

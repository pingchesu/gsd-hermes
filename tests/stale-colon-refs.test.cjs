/**
 * Stale /gsd: colon reference detection test
 *
 * Guards against regression of bug #1748: after the command naming migration
 * from colon to hyphen format, no stale colon references should remain in
 * source, workflows, commands, docs, issue templates, or hooks.
 *
 * Test input strings that deliberately test colon-to-hyphen conversion are
 * allowed (they are the INPUT to a converter function). Everything else is stale.
 *
 * Uses node:test and node:assert/strict (NOT Jest).
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/**
 * Upstream-owned path prefixes per docs/fork-ownership.md Path Ownership Matrix.
 * Hermes preserves upstream's /gsd: colon-form slash syntax (post-#2543 migration)
 * in these paths while Hermes adapter-seam paths (docs/hermes-*.md, bin/install.js,
 * tests/hermes-*.test.cjs) use /gsd- dash form for discovery compatibility.
 *
 * Phase 7 D-11 dual-track coexistence decision.
 * See docs/hermes-compatibility.md §Slash Command Inventory for full rationale.
 */
const UPSTREAM_OWNED_PREFIXES = [
  'commands/gsd/',
  'agents/',
  'get-shit-done/',
  'docs/AGENTS.md',
  'docs/ARCHITECTURE.md',
  'docs/FEATURES.md',
  'docs/USER-GUIDE.md',
  'sdk/src/',
  'hooks/',
  // Upstream-carried tests asserting upstream /gsd: slash-namespace contract:
  'tests/bug-2410-stream-checkpoint-heartbeats.test.cjs',
  'tests/bug-2543-gsd-slash-namespace.test.cjs',
  'tests/bug-2630-state-frontmatter-milestone-switch.test.cjs',
  'tests/claude-md.test.cjs',
  'tests/claude-skills-migration.test.cjs',
  'tests/execute-phase-wave.test.cjs',
  'tests/gsd-settings-advanced.test.cjs',
  'tests/import-command.test.cjs',
  'tests/qwen-skills-migration.test.cjs',
  'tests/settings-integrations.test.cjs',
  'tests/ultraplan-phase.test.cjs',
  'tests/verify-work-auto-transition.test.cjs',
];

function isUpstreamOwnedPath(relPath) {
  return UPSTREAM_OWNED_PREFIXES.some(prefix =>
    relPath === prefix || relPath.startsWith(prefix)
  );
}

/**
 * Recursively collect files matching the given extensions, excluding
 * CHANGELOG.md, node_modules/, .git/, dist/, local planning overlays, and
 * root CLAUDE.md (gitignored local IDE overlay — see repo .gitignore).
 */
function collectFiles(dir, extensions, results = []) {
  const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'dist', '.claude', '.worktrees', '.planning']);
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, extensions, results);
    } else if (entry.isFile()) {
      if (entry.name === 'CLAUDE.md' && path.resolve(dir) === path.resolve(ROOT)) {
        continue;
      }
      const ext = path.extname(entry.name);
      if (extensions.has(ext) && entry.name !== 'CHANGELOG.md') {
        results.push(full);
      }
    }
  }
  return results;
}

/**
 * Determine whether a /gsd: match in a test file is a legitimate test input
 * (i.e., the input string fed to a colon-to-hyphen converter).
 */
function isTestInput(filePath, line) {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');

  // Phase 7 D-11 dual-track: upstream-owned paths keep /gsd: colon form
  // (upstream #2543 migration); Hermes-owned paths still use /gsd- dash form.
  // See docs/hermes-compatibility.md §Slash Command Inventory.
  if (isUpstreamOwnedPath(rel)) return true;

  // SDK test files (.ts) that test sanitizer stripping of /gsd: patterns
  if (rel === 'sdk/src/prompt-sanitizer.test.ts') return true;
  if (rel === 'sdk/src/init-runner.test.ts') return true;
  if (rel === 'sdk/src/phase-prompt.test.ts') return true;

  // Conversion test files: input strings to convert* functions contain /gsd:
  const conversionTestFiles = [
    'tests/windsurf-conversion.test.cjs',
    'tests/augment-conversion.test.cjs',
    'tests/cursor-conversion.test.cjs',
    'tests/antigravity-install.test.cjs',
    'tests/copilot-install.test.cjs',
    'tests/codex-config.test.cjs',
    'tests/trae-install.test.cjs',
    'tests/codebuddy-install.test.cjs',
  ];

  if (conversionTestFiles.includes(rel)) {
    const trimmed = line.trim();
    // JSDoc block-comment lines with /gsd: in description are stale
    if (/^\*/.test(trimmed)) return false;
    // Everything else in conversion test files is a test input
    return true;
  }

  return false;
}

describe('No stale /gsd: colon references (#1748)', () => {
  // Phase 7 D-11 dual-track: Hermes SKILL.md + adapter seam use /gsd-<cmd>;
  // upstream commands/gsd/, agents/, get-shit-done/, upstream docs, sdk/src/,
  // and upstream-carried tests keep /gsd:<cmd>. Exemptions via
  // UPSTREAM_OWNED_PREFIXES. See docs/hermes-compatibility.md
  // §Slash Command Inventory.
  test('all /gsd: references are hyphenated in Hermes-owned paths (upstream-owned paths keep colon form per D-11)', () => {
    const extensions = new Set(['.md', '.js', '.cjs', '.ts', '.yml', '.sh', '.svg']);
    const files = collectFiles(ROOT, extensions);

    const staleRefs = [];
    const pattern = /\/gsd:[a-z]/g;

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!pattern.test(line)) continue;
        pattern.lastIndex = 0;

        if (!isTestInput(filePath, line)) {
          const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
          staleRefs.push(`  ${rel}:${i + 1}: ${line.trim()}`);
        }
      }
    }

    if (staleRefs.length > 0) {
      assert.fail(
        `Found ${staleRefs.length} stale /gsd: colon reference(s) that should use /gsd- hyphen format:\n${staleRefs.join('\n')}`
      );
    }
  });
});

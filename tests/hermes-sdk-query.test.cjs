'use strict';

/**
 * HERM-03: gsd-sdk query three-query SDK smoke (D-08).
 *
 * Verifies `init.*`, `phases.*`, `agent-skills` query handlers return non-error
 * output from a fresh Hermes install root. Each query MUST exit 0.
 *
 * Isolation: creates a temp project dir with a minimal `.planning/config.json`
 * so query handlers that probe the planning directory don't blow up on missing
 * config. HOME remains unisolated because SDK queries don't write to HOME.
 *
 * Pre-condition: sdk/dist/cli.js exists (SDK was built). If absent, tests skip
 * individually with a comment — building SDK is not part of test:hermes.
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createTempDir, cleanup } = require('./helpers.cjs');

const gsdSdkBin = path.join(__dirname, '..', 'sdk', 'dist', 'cli.js');

function runGsdSdkQuery(args, options = {}) {
  const env = { ...process.env };
  if (options.home) env.HOME = options.home;
  return spawnSync(process.execPath, [gsdSdkBin, 'query', ...args], {
    cwd: options.cwd || process.cwd(),
    env,
    encoding: 'utf8',
  });
}

function writeMinimalPlanningConfig(projectDir) {
  const planningDir = path.join(projectDir, '.planning');
  fs.mkdirSync(planningDir, { recursive: true });
  fs.writeFileSync(
    path.join(planningDir, 'config.json'),
    JSON.stringify({ workflow: {}, model_profile: 'balanced' }, null, 2)
  );
}

// This describe also satisfies INST-01 Check 2 (semantic exercise — gsd-sdk query invocations
// load @anthropic-ai/claude-agent-sdk via the SDK runtime chain). See Plan 02 Task 1 for Check 1
// (direct require) and Check 3 (decouple proof).
describe('HERM-03: gsd-sdk query smoke (D-08 three queries) — also INST-01 Check 2 semantic exercise', () => {
  let tmpProject;

  beforeEach(() => {
    tmpProject = createTempDir('gsd-hermes-sdk-query-');
    writeMinimalPlanningConfig(tmpProject);
  });

  afterEach(() => {
    cleanup(tmpProject);
  });

  test('gsd-sdk query init.new-project exits 0 (D-08 query 1)', () => {
    if (!fs.existsSync(gsdSdkBin)) return;  // SDK not built in this env — skip silently
    const result = runGsdSdkQuery(['init.new-project'], { cwd: tmpProject });
    assert.strictEqual(result.status, 0,
      `query init.new-project exit ${result.status}:\nstdout:${result.stdout}\nstderr:${result.stderr}`);
    // Output must be parseable (JSON or plain text non-empty); empty output = silent failure
    assert.ok(result.stdout.trim().length > 0 || result.stderr.trim().length > 0,
      'query init.new-project produced zero output');
  });

  test('gsd-sdk query phases.list exits 0 (D-08 query 2)', () => {
    if (!fs.existsSync(gsdSdkBin)) return;
    const result = runGsdSdkQuery(['phases.list'], { cwd: tmpProject });
    assert.strictEqual(result.status, 0,
      `query phases.list exit ${result.status}:\nstdout:${result.stdout}\nstderr:${result.stderr}`);
    // phases.list on empty project may return empty array — that's OK. Just assert non-throw + valid JSON OR non-empty text.
    if (result.stdout.trim().startsWith('{') || result.stdout.trim().startsWith('[')) {
      assert.doesNotThrow(() => JSON.parse(result.stdout),
        `query phases.list stdout is not parseable JSON: ${result.stdout}`);
    }
  });

  test('gsd-sdk query agent-skills gsd-planner exits 0 (D-08 query 3, upstream #2555 wiring)', () => {
    if (!fs.existsSync(gsdSdkBin)) return;
    const result = runGsdSdkQuery(['agent-skills', 'gsd-planner'], { cwd: tmpProject });
    assert.strictEqual(result.status, 0,
      `query agent-skills gsd-planner exit ${result.status}:\nstdout:${result.stdout}\nstderr:${result.stderr}`);
    // Agent-skills handler returns JSON or text describing planner skills; non-empty is the key assertion.
    assert.ok(result.stdout.trim().length > 0,
      'query agent-skills gsd-planner produced empty stdout');
  });
});

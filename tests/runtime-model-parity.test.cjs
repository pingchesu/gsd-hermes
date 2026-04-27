'use strict';

const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fsNative = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { createTempProject, cleanup } = require('./helpers.cjs');
const { resolveModelBindingInternal, resolveModelInternal } = require('../get-shit-done/bin/lib/core.cjs');
const { toInitModelToken, toBindingReceipt } = require('../get-shit-done/bin/lib/model-profiles.cjs');

const PLAN_PHASE_WORKFLOW_PATH = path.join(__dirname, '..', 'get-shit-done', 'workflows', 'plan-phase.md');
const QUICK_WORKFLOW_PATH = path.join(__dirname, '..', 'get-shit-done', 'workflows', 'quick.md');
const VERIFY_WORKFLOW_PATH = path.join(__dirname, '..', 'get-shit-done', 'workflows', 'verify-work.md');
const EXECUTE_PHASE_WORKFLOW_PATH = path.join(__dirname, '..', 'get-shit-done', 'workflows', 'execute-phase.md');
const HERMES_COMPATIBILITY_DOC_PATH = path.join(__dirname, '..', 'docs', 'hermes-compatibility.md');

const SDK_RUNTIME_MODEL_CONTRACT_PATH = pathToFileURL(
  path.join(__dirname, '..', 'sdk', 'dist', 'query', 'runtime-model-contract.js')
).href;

const MATRIX = [
  {
    name: 'explicit override wins over profile and omit',
    agent: 'gsd-executor',
    config: {
      model_profile: 'inherit',
      resolve_model_ids: 'omit',
      model_overrides: { 'gsd-executor': 'openai/gpt-5.4' },
      workflow: {},
    },
    expectedLegacyToken: 'openai/gpt-5.4',
    expectedInitToken: 'openai/gpt-5.4',
  },
  {
    name: 'inherit profile remains semantic binding and init omission',
    agent: 'gsd-planner',
    config: {
      model_profile: 'inherit',
      workflow: {},
    },
    expectedLegacyToken: 'inherit',
    expectedInitToken: '',
  },
  {
    name: 'resolve_model_ids omit becomes runtime-default binding',
    agent: 'gsd-verifier',
    config: {
      model_profile: 'balanced',
      resolve_model_ids: 'omit',
      workflow: {},
    },
    expectedLegacyToken: '',
    expectedInitToken: '',
  },
  {
    name: 'resolve_model_ids true expands aliases',
    agent: 'gsd-planner',
    config: {
      model_profile: 'balanced',
      resolve_model_ids: true,
      workflow: {},
    },
    expectedLegacyToken: 'claude-opus-4-7',
    expectedInitToken: 'claude-opus-4-7',
  },
  {
    name: 'unknown agent is rejected instead of silently falling back to sonnet',
    agent: 'gsd-unknown-agent',
    config: {
      model_profile: 'balanced',
      workflow: {},
    },
    expectedLegacyToken: '',
    expectedInitToken: '',
  },
  // ─── Phase 7 Plan 01: runtime-aware + cross-AI + overrides coverage ───────
  // ARCHITECTURAL NOTE: the parity assertion (lines 197-205) enforces
  // cjsLegacyToken === sdkLegacyToken. cjsLegacyToken comes from
  // resolveModelInternal (which IS runtime-aware via resolveTierEntry at
  // step 3 of core.cjs). sdkLegacyToken comes from SDK toLegacyModelToken
  // applied to resolveAgentBinding (which is NOT runtime-aware — it is
  // profile-based and shared with the CJS resolveAgentBinding in
  // model-profiles.cjs).
  //
  // Consequence: rows whose config triggers resolveModelInternal step 3
  // (runtime && runtime !== 'claude' && profile !== 'inherit' && !override
  // && tier != null) CANNOT satisfy the parity assertion — CJS returns the
  // runtime-aware token (e.g. 'gpt-5.4') while SDK returns the profile alias
  // ('opus'). This is intentional per #2517 review finding #4 ("explicit
  // opt-in beats resolve_model_ids: omit").
  //
  // Runtime-aware CJS behavior IS covered by the existing 52-subtest suite
  // tests/issue-2517-runtime-aware-profiles.test.cjs (which asserts the CJS
  // side only, no parity). Rows below exercise PROFILE-01 + PROFILE-02 +
  // HERM-04 composition through paths that DO satisfy parity:
  //   - explicit model_override (step 1, override wins over runtime-aware)
  //   - runtime: codex + profile: inherit (step 5-inherit, returns 'inherit')
  //   - runtime: codex + omit for gsd-unknown-agent (unsupported rejects both sides)
  //   - runtime: hermes (recognized runtime without built-in profile IDs —
  //     resolveTierEntry returns null and falls through to profile lookup;
  //     CJS and SDK agree on Claude alias unless explicit overrides are set)
  //   - cross_ai_execution: true (no effect on token resolution; HERM-04 is
  //     about the flag being preserved through the binding shape)
  //   - resolve_model_ids: true + adaptive profile (alias mapping path)
  {
    name: 'runtime: codex + explicit model_override — override wins over runtime-aware resolution (shared binding agrees)',
    agent: 'gsd-executor',
    config: {
      runtime: 'codex',
      model_profile: 'quality',
      model_overrides: { 'gsd-executor': 'openai/gpt-5-pro' },
      workflow: {},
    },
    expectedLegacyToken: 'openai/gpt-5-pro',
    expectedInitToken: 'openai/gpt-5-pro',
  },
  {
    name: 'runtime: codex + inherit profile stays inherit (#2516 literal passthrough; runtime-aware bypassed)',
    agent: 'gsd-planner',
    config: { runtime: 'codex', model_profile: 'inherit', workflow: {} },
    expectedLegacyToken: 'inherit',
    expectedInitToken: '',
  },
  {
    name: 'runtime: codex + omit + unknown agent — both resolvers reject (runtime-aware path bypassed)',
    agent: 'gsd-unknown-agent-codex',
    config: { runtime: 'codex', model_profile: 'balanced', resolve_model_ids: 'omit', workflow: {} },
    expectedLegacyToken: '',
    expectedInitToken: '',
  },
  {
    name: 'runtime: hermes is recognized and falls through to Claude-safe profile alias without explicit overrides (PROFILE-01 fork-identity)',
    agent: 'gsd-planner',
    config: { runtime: 'hermes', model_profile: 'balanced', workflow: {} },
    expectedLegacyToken: 'opus',
    expectedInitToken: 'opus',
  },
  {
    name: 'cross_ai_execution: true keeps legacy/init tokens on Claude default path (HERM-04 fallback flag preserved)',
    agent: 'gsd-executor',
    config: { workflow: { cross_ai_execution: true }, model_profile: 'balanced' },
    expectedLegacyToken: 'sonnet',
    expectedInitToken: 'sonnet',
  },
  {
    name: 'resolve_model_ids: true + adaptive profile expands alias (verifies adaptive profile path)',
    agent: 'gsd-executor',
    config: { model_profile: 'adaptive', resolve_model_ids: true, workflow: {} },
    expectedLegacyToken: 'claude-sonnet-4-6',
    expectedInitToken: 'claude-sonnet-4-6',
  },
  {
    name: 'runtime: hermes + invalid explicit override preserves token for no-silent-fallback proof',
    agent: 'gsd-planner',
    config: {
      runtime: 'hermes',
      model_profile: 'balanced',
      model_overrides: { 'gsd-planner': 'definitely-not-a-real-model-gsd-binding-test' },
      workflow: {},
    },
    expectedLegacyToken: 'definitely-not-a-real-model-gsd-binding-test',
    expectedInitToken: 'definitely-not-a-real-model-gsd-binding-test',
  },
  {
    name: 'runtime: hermes + cross_ai_execution flag remains metadata, not silent fallback',
    agent: 'gsd-planner',
    config: {
      runtime: 'hermes',
      model_profile: 'balanced',
      workflow: { cross_ai_execution: true },
      model_overrides: { 'gsd-planner': 'openai/o4-mini' },
    },
    expectedLegacyToken: 'openai/o4-mini',
    expectedInitToken: 'openai/o4-mini',
  },
  {
    name: 'runtime: codex + inherit + model_profile_overrides — inherit dominates, overrides ignored by both resolvers',
    agent: 'gsd-planner',
    config: {
      runtime: 'codex',
      model_profile: 'inherit',
      model_profile_overrides: { codex: { opus: 'gpt-5-pro' } },
      workflow: {},
    },
    expectedLegacyToken: 'inherit',
    expectedInitToken: '',
  },
];

describe('runtime-model parity', () => {
  let tmpDir;
  let sdkResolveAgentBinding;
  let sdkToLegacyModelToken;
  let sdkToInitModelToken;
  let sdkToRuntimeModelReceipt;

  beforeEach(async () => {
    tmpDir = createTempProject();
    const sdkModule = await import(SDK_RUNTIME_MODEL_CONTRACT_PATH);
    sdkResolveAgentBinding = sdkModule.resolveAgentBinding;
    sdkToLegacyModelToken = sdkModule.toLegacyModelToken;
    sdkToInitModelToken = sdkModule.toInitModelToken;
    sdkToRuntimeModelReceipt = sdkModule.toRuntimeModelReceipt;
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  for (const entry of MATRIX) {
    test(entry.name, () => {
      fsNative.writeFileSync(
        path.join(tmpDir, '.planning', 'config.json'),
        JSON.stringify(entry.config, null, 2)
      );

      const sdkResolution = sdkResolveAgentBinding(entry.config, entry.agent);
      const cjsResolution = resolveModelBindingInternal(tmpDir, entry.agent);
      const cjsLegacyToken = resolveModelInternal(tmpDir, entry.agent);
      const cjsInitToken = toInitModelToken(cjsResolution);

      assert.deepStrictEqual(
        {
          kind: cjsResolution.kind,
          bindingKind: cjsResolution.bindingKind,
          source: cjsResolution.source,
          profile: cjsResolution.profile,
          configuredModel: cjsResolution.configuredModel,
          resolvedModel: cjsResolution.resolvedModel,
          rejectionReason: cjsResolution.kind === 'unsupported' ? cjsResolution.rejectionReason : null,
        },
        {
          kind: sdkResolution.kind,
          bindingKind: sdkResolution.bindingKind,
          source: sdkResolution.source,
          profile: sdkResolution.profile,
          configuredModel: sdkResolution.configuredModel,
          resolvedModel: sdkResolution.resolvedModel,
          rejectionReason: sdkResolution.kind === 'unsupported' ? sdkResolution.rejectionReason : null,
        },
        'legacy CJS semantic outcome must match SDK contract for the shared matrix'
      );

      const sdkLegacyToken = sdkToLegacyModelToken(sdkResolution, '');
      const sdkInitToken = sdkToInitModelToken(sdkResolution);

      assert.strictEqual(cjsInitToken, sdkInitToken,
        'legacy init token projection must match SDK init projection');
      if (sdkResolution.bindingKind !== 'inherit') {
        assert.strictEqual(cjsLegacyToken, sdkLegacyToken,
          'legacy CJS string adapter must match SDK legacy token projection for non-inherit bindings');
      } else {
        assert.strictEqual(cjsLegacyToken, 'inherit',
          'legacy CJS string adapter must preserve inherit as a semantic binding token');
        assert.strictEqual(sdkLegacyToken, '',
          'SDK legacy token projection intentionally omits inherit while init uses omission');
      }
      assert.strictEqual(cjsLegacyToken, entry.expectedLegacyToken);
      assert.strictEqual(cjsInitToken, entry.expectedInitToken);

      const sdkReceipt = sdkToRuntimeModelReceipt(sdkResolution, 'executor');
      const cjsReceipt = toBindingReceipt(cjsResolution, 'executor');
      assert.deepStrictEqual(
        {
          role: cjsReceipt.role,
          agent: cjsReceipt.agent,
          status: cjsReceipt.status,
          known_agent: cjsReceipt.known_agent,
          runtime: cjsReceipt.runtime,
          profile: cjsReceipt.profile,
          binding_kind: cjsReceipt.binding_kind,
          source: cjsReceipt.source,
          configured_model: cjsReceipt.configured_model,
          resolved_model: cjsReceipt.resolved_model,
          model_token: cjsReceipt.model_token,
          provider_family: cjsReceipt.provider_family,
          resolved_by_gsd: cjsReceipt.resolved_by_gsd,
          passed_to_runtime: cjsReceipt.passed_to_runtime,
          runtime_enforced: cjsReceipt.runtime_enforced,
          enforceability: cjsReceipt.enforceability,
          runtime_binding_channel: cjsReceipt.runtime_binding_channel,
          rejection_reason: cjsReceipt.rejection_reason,
        },
        {
          role: sdkReceipt.role,
          agent: sdkReceipt.agent,
          status: sdkReceipt.status,
          known_agent: sdkReceipt.known_agent,
          runtime: sdkReceipt.runtime,
          profile: sdkReceipt.profile,
          binding_kind: sdkReceipt.binding_kind,
          source: sdkReceipt.source,
          configured_model: sdkReceipt.configured_model,
          resolved_model: sdkReceipt.resolved_model,
          model_token: sdkReceipt.model_token,
          provider_family: sdkReceipt.provider_family,
          resolved_by_gsd: sdkReceipt.resolved_by_gsd,
          passed_to_runtime: sdkReceipt.passed_to_runtime,
          runtime_enforced: sdkReceipt.runtime_enforced,
          enforceability: sdkReceipt.enforceability,
          runtime_binding_channel: sdkReceipt.runtime_binding_channel,
          rejection_reason: sdkReceipt.rejection_reason,
        },
        'legacy CJS binding receipt projection must match SDK receipt projection for the shared matrix'
      );
    });
  }

  test('workflow docs align on the four runtime-model paths', () => {
    const planWorkflow = fsNative.readFileSync(PLAN_PHASE_WORKFLOW_PATH, 'utf8');
    const quickWorkflow = fsNative.readFileSync(QUICK_WORKFLOW_PATH, 'utf8');
    const verifyWorkflow = fsNative.readFileSync(VERIFY_WORKFLOW_PATH, 'utf8');
    const executeWorkflow = fsNative.readFileSync(EXECUTE_PHASE_WORKFLOW_PATH, 'utf8');
    const hermesDoc = fsNative.readFileSync(HERMES_COMPATIBILITY_DOC_PATH, 'utf8');

    assert.match(planWorkflow, /four runtime-model paths/i);
    assert.match(quickWorkflow, /four runtime-model paths/i);
    assert.match(verifyWorkflow, /four runtime-model paths/i);
    assert.match(executeWorkflow, /direct runtime support/i);

    for (const [name, text] of [
      ['plan-phase workflow', planWorkflow],
      ['execute-phase workflow', executeWorkflow],
    ]) {
      assert.match(text, /model_binding_receipts/, `${name} must parse model_binding_receipts`);
      assert.match(text, /runtime_enforced/, `${name} must display runtime_enforced`);
      assert.match(text, /resolved_by_gsd/, `${name} must display resolved_by_gsd`);
      assert.match(text, /passed_to_runtime/, `${name} must display passed_to_runtime`);
      assert.match(
        text,
        /runtime_enforced=unknown is not provider proof/i,
        `${name} must warn that unknown enforcement is not provider proof`
      );
      assert.match(text, /runtime_binding_channel/, `${name} must display the binding channel boundary`);
      assert.match(text, /child-construction/i, `${name} must distinguish child construction from provider proof`);
    }

    assert.match(hermesDoc, /resolved_by_gsd/);
    assert.match(hermesDoc, /passed_to_runtime/);
    assert.match(hermesDoc, /runtime_enforced/);
    assert.match(hermesDoc, /subagent self-report is not proof/i);
  });
});

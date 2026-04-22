'use strict';

const { describe, test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fsNative = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { createTempProject, cleanup } = require('./helpers.cjs');
const { resolveModelBindingInternal, resolveModelInternal } = require('../get-shit-done/bin/lib/core.cjs');
const { toInitModelToken } = require('../get-shit-done/bin/lib/model-profiles.cjs');

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
    expectedLegacyToken: 'claude-opus-4-6',
    expectedInitToken: 'claude-opus-4-6',
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
];

describe('runtime-model parity', () => {
  let tmpDir;
  let sdkResolveAgentBinding;
  let sdkToLegacyModelToken;
  let sdkToInitModelToken;

  beforeEach(async () => {
    tmpDir = createTempProject();
    const sdkModule = await import(SDK_RUNTIME_MODEL_CONTRACT_PATH);
    sdkResolveAgentBinding = sdkModule.resolveAgentBinding;
    sdkToLegacyModelToken = sdkModule.toLegacyModelToken;
    sdkToInitModelToken = sdkModule.toInitModelToken;
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
    });
  }
});

# Versioning & Release Strategy

`gsd-hermes` uses an independent downstream version line from upstream `get-shit-done-cc`.

- Public package: `gsd-hermes`
- Install command: `npx gsd-hermes@latest`
- Upstream source: `gsd-build/get-shit-done`
- Release target: Hermes-first GSD distribution with strict provider-routed execution

## Release tiers

| Tier | What ships | Version format | npm tag | Branch | Install |
|------|-----------|---------------|---------|--------|---------|
| Patch | Bug fixes only | `1.9.1` | `latest` | `hotfix/1.9.1` | `npx gsd-hermes@latest` |
| Minor | Upstream syncs, non-breaking features | `1.10.0` | `latest` after validation | `release/1.10.0` | `npx gsd-hermes@latest` |
| Major | Breaking config/CLI/runtime changes | `2.0.0` | `latest` after validation | `release/2.0.0` | `npx gsd-hermes@latest` |

Pre-releases, when needed, use the `next` dist-tag:

```bash
npm install gsd-hermes@next
```

## Dist-tags

| Tag | Meaning |
|-----|---------|
| `latest` | Stable downstream release. |
| `next` | Pre-release candidate or canary when intentionally published. |

Stable releases should ensure `next` does not remain pinned to an older package than `latest`.

## Downstream versioning rule

A `gsd-hermes` release may be a minor even when upstream used an RC/development version. The downstream semver communicates compatibility and risk for Hermes-first users, not upstream's package number.

Each release entry must record:

1. `gsd-hermes` package version.
2. upstream commit/base version.
3. downstream invariants preserved.
4. validation gates.

## Release workflow

1. Sync upstream on a clean branch and resolve conflicts.
2. Preserve downstream invariants:
   - package identity `gsd-hermes`;
   - CLI `npx gsd-hermes`;
   - Hermes global/project-linked install semantics;
   - `model_binding_receipts` and `agent_execution_bindings`;
   - strict provider routing (`openai/gpt-*` → Codex CLI, `anthropic/claude-*` → Claude CLI);
   - fail-fast on unsupported provider families;
   - Trusted Publishing workflow.
3. Run focused Hermes/provider-routing regressions.
4. Update README, COMMANDS, CONFIGURATION/compatibility docs as needed, CHANGELOG, and release notes.
5. Run full gates:

```bash
npm run test:hermes
npm test
npm run lint:tests
npm pack --dry-run --json
```

6. Open PR and track CI to green.
7. Merge to `main`.
8. Create GitHub Release `vX.Y.Z`.
9. Use GitHub Actions Trusted Publishing to publish to npm.
10. Verify:

```bash
npm view gsd-hermes version
npm dist-tag ls gsd-hermes
```

## Publishing commands reference

Local publishing is not the preferred path. Prefer GitHub Actions Trusted Publishing.

```bash
# Verify what npm sees
npm view gsd-hermes version
npm dist-tag ls gsd-hermes

# Dry-run package contents locally
npm pack --dry-run --json
```

Do not store npm tokens in the repository or release notes.

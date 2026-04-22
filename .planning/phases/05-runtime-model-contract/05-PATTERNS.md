# Phase 5: Runtime Model Contract - Patterns

## Target Files and Closest Analogs

| Target file / area | Role | Closest existing analog | Why it matters |
|---|---|---|---|
| `sdk/src/query/config-query.ts` | Current SDK-side model resolver | Itself | Already owns `resolveModel()` and current override/omit/profile logic; best starting seam for a structured resolver |
| `sdk/src/query/helpers.ts` | Runtime registry / detection | Itself | Already defines supported runtimes and `detectRuntime()` precedence; natural place to anchor runtime capability data |
| `sdk/src/query/init.ts` | Init payload consumer | Itself | Already consumes resolved model strings and will need adapter-aware serialization without losing binding semantics |
| `sdk/src/config.ts` | Typed config surface | Itself | Needs first-class typing for runtime/model/cross-ai fields to reduce `Record<string, unknown>` escapes |
| `sdk/src/query/config-mutation.ts` | Supported config mutation surface | Itself | Existing allowlist drift is a direct example of schema parity risk |
| `get-shit-done/bin/lib/core.cjs` | Legacy parity target | Itself | Holds `resolveModelInternal()` and current string-only legacy semantics that Phase 5 must eventually match |
| `get-shit-done/bin/lib/init.cjs` | Legacy init consumer | Itself | Shows how legacy init payloads currently flatten semantics too early |

## Established Code Patterns

### Query-handler pattern
- SDK query handlers return structured `{ data: ... }` envelopes and raise validation errors through `GSDError`.
- Phase 5 should reuse this pattern instead of inventing a parallel runtime-model API style.

### Runtime precedence pattern
- `detectRuntime()` already follows `GSD_RUNTIME -> config.runtime -> 'claude'` precedence.
- The runtime capability contract should consume this rather than redefining runtime selection.

### Incremental adapter pattern
- Existing code often keeps legacy outward shapes while changing internals.
- Phase 5 should likely follow the same pattern: add structured resolver internally, then adapt to current string-returning callers.

## Integration Points

### SDK-first implementation seam
- Introduce the canonical contract/resolver on the SDK side first.
- Update `config-query.ts` and `init.ts` to use it before touching broader workflow propagation.

### Legacy parity seam
- After SDK semantics are stable, mirror/adapt them into legacy CJS `resolveModelInternal()` and init payload generation.

### Testing seam
- Existing tests in `sdk/src/query/config-query.test.ts`, `sdk/src/query/init.test.ts`, and relevant root `tests/*.test.cjs` provide the fastest feedback path for Phase 5 changes.

## Pattern Guidance for Planning

- Prefer adding a shared runtime-model module over embedding more conditionals directly into `config-query.ts`.
- Prefer semantic adapter helpers (`toLegacyResolvedModel`, `toInitModelToken`) over spreading sentinel-string handling across init/workflow layers.
- Treat unknown-agent handling as an explicit policy surface, not an accidental fallback.

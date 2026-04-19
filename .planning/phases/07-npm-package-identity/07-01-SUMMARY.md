# Phase 7 Plan 01 Summary: Establish npm package identity

## Completed

- Renamed the package identity to `gsd-hermes` and pointed npm metadata at
  `https://github.com/pingchesu/gsd-hermes`.
- Added `gsd-hermes` as the primary executable while preserving the
  `get-shit-done-cc` compatibility executable.
- Included Hermes operator docs in npm package files so packed installs carry
  the Hermes install, compatibility, and upstream-sync guidance.
- Updated the installer help, Hermes install guide, and README primary entry
  points to use `npx gsd-hermes`.
- Added regression tests for package identity and updated Hermes lifecycle docs.

## Verification

```bash
npm run test:hermes
# tests 50
# pass 50

npm test
# tests 4203
# pass 4203

npm pack --dry-run
# filename: gsd-hermes-1.37.1.tgz
# package size: 1.3 MB
# unpacked size: 5.0 MB
# total files: 489
```

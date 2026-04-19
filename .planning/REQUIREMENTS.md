# Requirements: gsd-hermes

**Defined:** 2026-04-18  
**Core Value:** A developer can install GSD for Hermes and use the standard get-shit-done workflow inside Hermes with near-parity to the upstream experience.

## v1 Requirements

### Architecture

- [x] **ARCH-01**: Maintainer can identify which code belongs to upstream GSD, Hermes adapter logic, and local enhancements.
- [x] **ARCH-02**: Maintainer can follow a documented upstream sync routine without guessing where Hermes-specific patches should live.

### Distribution

- [x] **DIST-01**: Developer can install `gsd-hermes` via npm/npx and choose Hermes as a runtime during setup.
- [x] **DIST-02**: Developer can update an existing Hermes installation to the current `gsd-hermes` version.
- [x] **DIST-03**: Developer can uninstall Hermes-related `gsd-hermes` files without damaging unrelated Hermes configuration.
- [x] **DIST-04**: Developer can invoke the downstream package as `npx gsd-hermes` and still retain the upstream-compatible `get-shit-done-cc` executable alias after package install.

### Hermes Runtime

- [x] **HERM-01**: Developer can complete a global install that makes `/gsd-*` commands available in Hermes.
- [x] **HERM-02**: Developer can complete a project-linked install using Hermes `skills.external_dirs` and use `/gsd-*` in that project context.

### Workflow Compatibility

- [x] **FLOW-01**: Developer can run `/gsd-new-project` in Hermes and generate the standard `.planning/` project artifacts.
- [x] **FLOW-02**: Developer can use the core GSD lifecycle in Hermes: discuss, plan, execute, verify, progress, settings, and update.
- [x] **FLOW-03**: When exact Hermes parity is not yet possible, developer receives an intentional shim or documented degraded path instead of silent failure.

### Quality and Docs

- [x] **QUAL-01**: Maintainer can run Hermes-specific regression and doctor checks for install paths, command discovery, and core workflow smoke paths.
- [x] **DOCS-01**: Developer can find accurate docs for Hermes install modes, compatibility boundaries, and known parity gaps.

### Compatibility

- [x] **COMP-01**: Supported Hermes workflows behave near-parity with upstream get-shit-done.
- [x] **COMP-02**: Maintainer can sync upstream get-shit-done changes and revalidate Hermes compatibility on a regular cadence.

## v2 Requirements

### Extended Runtime Surface

- **EXT-01**: Developer can use advanced Hermes-native enhancements beyond upstream parity, such as richer project-linked tooling or deeper runtime ergonomics.
- **EXT-02**: Developer can manage optional plugin-assisted features without changing the base install path.

### Ecosystem Expansion

- **ECO-01**: Maintainer can package additional optional compatibility layers without destabilizing Hermes support.
- **ECO-02**: Developer can use richer compatibility reporting and migration helpers across upstream releases.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Replacing GSD with a new workflow system | This project exists to preserve GSD workflow value, not supersede it |
| Supporting every other unsupported runtime in v1 | Hermes support must stabilize first |
| Rewriting large parts of workflow markdown without hard runtime need | That would make upstream sync too expensive |
| Claiming Hermes has a true native local skill install mode | Hermes supports global skills plus external directory scanning, not equivalent local runtime installs |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 1 | Completed in 01-01 |
| ARCH-02 | Phase 1 | Completed in 01-02 |
| DIST-01 | Phase 2 | Completed in 02-01, 02-02, and 02-03 |
| HERM-01 | Phase 3 | Complete |
| HERM-02 | Phase 3 | Complete |
| FLOW-01 | Phase 4 | Complete |
| FLOW-02 | Phase 4 | Complete |
| FLOW-03 | Phase 4 | Complete |
| DIST-02 | Phase 5 | Complete |
| DIST-03 | Phase 5 | Complete |
| DIST-04 | Phase 7 | Complete |
| QUAL-01 | Phase 5 | Complete |
| DOCS-01 | Phase 5 | Complete |
| COMP-01 | Phase 6 | Complete |
| COMP-02 | Phase 6 | Complete |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-18*
*Last updated: 2026-04-19 after Phase 7 npm package identity verification*

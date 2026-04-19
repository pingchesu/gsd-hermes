# Features Research: gsd-hermes

**Researched:** 2026-04-18  
**Confidence:** Medium

## Table Stakes

- Hermes appears as a runtime choice during install
- Installed commands are discoverable as `/gsd-*` in Hermes
- Core GSD workflows initialize and update `.planning/` correctly
- Update and uninstall paths are explicit and safe
- Runtime-specific docs explain how Hermes install modes work

## Differentiators

- Project-linked install using Hermes `skills.external_dirs`
- Strong doctor/health diagnostics for Hermes path and config issues
- Clear compatibility matrix that explains exact parity gaps
- Faster upstream-sync discipline than ad hoc community ports

## Anti-Features

- Large workflow redesigns just to feel more Hermes-native
- Misleading "local install" terminology if Hermes does not truly support it
- Runtime-specific hacks scattered throughout workflow files
- Multi-runtime expansion before Hermes compatibility is stable

## Complexity Notes

- **Installer/runtime entry:** Medium
- **Skill/command conversion:** High
- **Core workflow parity:** High
- **Global install support:** Medium
- **Project-linked install support:** Medium to High
- **Sync discipline and regression testing:** High

## Dependencies Between Features

- Hermes installer support must exist before command discovery can be validated.
- Command discovery must exist before workflow parity can be tested.
- Project-linked install depends on a correct `external_dirs` management story.
- Doctor/update flows depend on manifest and install-path ownership rules.

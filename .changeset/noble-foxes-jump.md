---
type: Fixed
pr: 74
---
**Hermes profile installs no longer double the profile segment in path references (#72)** — a `--hermes --global` install with `HERMES_HOME` pointing at a profile (`~/.hermes/profiles/<name>`) rewrote each config-dir anchor with its own `String.replace`, so the `.hermes` rule re-expanded the prefix the `.claude` rule had just written and produced `.../profiles/<name>/profiles/<name>/...`. Every `@`-included workflow, reference and template failed to resolve as a result (104 files affected). Anchors are now expanded in a single pass, which cannot revisit its own output; plain-path installs are unchanged.

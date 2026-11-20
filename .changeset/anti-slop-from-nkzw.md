---
"@tractorbeam/oxlint-config": minor
---

Build the `anti-slop` plugin from `@nkzw/oxlint-config`'s maintained `quality` rules, since anti-slop now recommends `@cloudflare/oxlint-config` instead. The `antiSlop` preset enables the same rules as before. The plugin keeps `no-runtime-typeof`, `no-shape-in-symbol-names`, and `no-unknown-parameters`, and no longer has anti-slop's `no-module-mocking`, `require-readable-spacing`, or `require-safety-comment-for-type-assertion`, which the preset never enabled.

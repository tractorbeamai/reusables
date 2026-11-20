---
"@tractorbeam/oxlint-config": minor
---

Rename the `antiSlop` preset and its `anti-slop` plugin to `quality`, built from `@nkzw/oxlint-config`'s maintained `quality` rules, since anti-slop now recommends `@cloudflare/oxlint-config` instead. Rename `anti-slop/` rules to `quality/`, `antiSlop` to `quality`, and the `@tractorbeam/oxlint-config/anti-slop` subpath to `@tractorbeam/oxlint-config/quality`. The plugin keeps `no-runtime-typeof`, `no-shape-in-symbol-names`, and `no-unknown-parameters`, and no longer has anti-slop's `no-module-mocking`, `require-readable-spacing`, or `require-safety-comment-for-type-assertion`, which the preset never enabled.

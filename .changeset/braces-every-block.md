---
"@tractorbeam/oxlint-config": minor
---

Require braces on every block by default. `curly: ["error", "all"]` moves out of the opt-in `stylistic` option into the base config, so braceless bodies such as `if (done) return;` now fail lint in every project. The rule is autofixable: after upgrading, run `vp lint --fix` (or `oxlint --fix`) and commit the added braces. The `stylistic` option now only adds blank lines around multiline statements.

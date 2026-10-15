---
"@tractorbeam/oxlint-config": minor
---

Require braces on every block by default. `curly: ["error", "all"]` moves out of the opt-in `stylistic` option into the base config, so braceless bodies such as `if (done) return;` now fail lint in every project. The rule is autofixable: after upgrading, run `vp lint --fix` (or `oxlint --fix`), repeat it until nothing is left to fix, and commit the added braces. Braces on nested blocks are added one level per pass, so this can take two or three runs. The `stylistic` option now only adds blank lines around multiline statements.

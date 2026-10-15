---
"@tractorbeam/oxlint-config": minor
---

Stylistic rules are now on by default: braces on every block (`curly: all`) and blank lines around multiline statements. Upgrade, then repeat `vp lint --fix` (or `oxlint --fix`) until nothing is left to fix; braces on nested blocks are added one level per pass, so this can take two or three runs. Opt out with `oxlintConfig({ stylistic: false })`.

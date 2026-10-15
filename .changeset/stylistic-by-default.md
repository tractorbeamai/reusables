---
"@tractorbeam/oxlint-config": minor
---

Stylistic rules are now on by default: braces on every block (`curly: all`) and blank lines around multiline statements. Upgrade, then repeat `vp check --fix` until it passes, usually three runs: braces on nested blocks are added one level per pass, and the formatter expands one-line `{ return; }` bodies, which the blank-line rule then pads. Without Vite+, alternate `oxlint --fix` and your formatter the same way. Opt out with `oxlintConfig({ stylistic: false })`.

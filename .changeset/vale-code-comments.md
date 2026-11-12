---
"@tractorbeam/vale-config": minor
---

Lint comments in TypeScript and Rust files with the same rules as Markdown. Each comment is read as Markdown, so backtick spans are skipped, and a lint directive is skipped up to the `--` before its reason. Requires Vale 3.17 or later.

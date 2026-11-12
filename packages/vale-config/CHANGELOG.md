# @tractorbeam/vale-config

## 0.2.0

### Minor Changes

- 3c1b9ba: Lint comments in TypeScript and Rust files with the same rules as Markdown. Each comment is read as Markdown, so backtick spans are skipped, and a lint directive is skipped up to the `--` before its reason. Requires Vale 3.17 or later.

## 0.1.0

### Minor Changes

- fc242f4: Add the Vale configuration for Tractorbeam docs, extending Google, ai-tells, and GitLab styles. Install it from npm and name `node_modules/@tractorbeam/vale-config/dist/Tractorbeam` in the project's `.vale.ini` `Packages`.

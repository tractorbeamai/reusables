# @tractorbeam/oxlint-config

## 0.6.0

### Minor Changes

- 247b3cd: Turn off `max-lines` and `max-lines-per-function`, including the defaults the `pedantic` category would otherwise apply, so the shared config no longer limits file or function length.
- 02a296f: Stylistic rules are now on by default: braces on every block (`curly: all`) and blank lines around multiline statements. Upgrade, then repeat `vp check --fix` until it passes, usually three runs: braces on nested blocks are added one level per pass, and the formatter expands one-line `{ return; }` bodies, which the blank-line rule then pads. Without Vite+, alternate `oxlint --fix` and your formatter the same way. Opt out with `oxlintConfig({ stylistic: false })`.

## 0.5.0

### Minor Changes

- 61a6cab: Add an opt-in cyclomatic complexity limit to the shared Oxlint config.
- 1c0d11e: Enable `no-nested-ternary` as an error in the default Oxlint configuration.
- 05ed169: Add an opt-in `playwright: { files }` option that applies Playwright's recommended rules and stricter locator, waiting, and assertion rules to matching test files, and an opt-in `stylistic` option that requires braces on every block and blank lines around multiline statements. Raise the default `max-lines-per-function` warning threshold from 150 to 300 lines.
- 79db427: Warn when page or route implementations live in `components/` directories, and when TanStack Router routes register a component that is not a named `*Route` or `Outlet`.

### Patch Changes

- 3d1f5e6: Update dependencies: build against `@oxlint/plugins` 1.87 and `eslint-plugin-playwright` 2.12.1, and bump `postcss` to 8.5.29.

## 0.4.0

### Minor Changes

- 69bec2d: Add Oxlint UI rules for Button sizing and nested icon classes.

## 0.3.0

### Minor Changes

- de467b7: Build the anti-slop Oxlint plugin from a pinned GitHub dependency and enable all of its rules in the shared preset.

## 0.2.0

### Minor Changes

- e8e34e6: Enable type-aware linting and checking, warn on files over 1,000 lines, and leave Markdown prose unwrapped by default.

## 0.1.0

### Minor Changes

- 97ef5b8: Publish configurable shared Tractorbeam Oxlint rules and plugin presets for Vite+ projects, with React support enabled by default.

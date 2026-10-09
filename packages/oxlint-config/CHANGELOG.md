# @tractorbeam/oxlint-config

## 0.5.0

### Minor Changes

- 61a6cab: Add an opt-in cyclomatic complexity limit to the shared Oxlint config.
- 1c0d11e: Enable `no-nested-ternary` as an error in the default Oxlint configuration.
- 05ed169: Add an opt-in `playwright: { files }` option that applies Playwright's recommended rules and stricter locator, waiting, and assertion rules to matching test files, and an opt-in `stylistic` option that requires braces on every block and blank lines around multiline statements. Raise the default `max-lines-per-function` warning threshold from 150 to 300 lines.
- 79db427: Warn when page or route implementations live in `components/` directories, and when TanStack Router routes register a component that is not a named `*Route` or `Outlet`.

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

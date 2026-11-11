# @tractorbeam/pnpm-plugin-tractorbeam-defaults

## 0.2.0

### Minor Changes

- 254c259: Exempt `@tractorbeam/*`, Effect (`effect`, `@effect/*`), and Alchemy (`alchemy`, `@alchemy.run/*`) from the release-age gate, and allow `esbuild` and `sharp` to run build scripts. A project's own `allowBuilds` entries win.

## 0.1.0

### Minor Changes

- b093c3b: Publish the shared pnpm config dependency as `@tractorbeam/pnpm-plugin-tractorbeam-defaults`, which pnpm loads automatically. It replaces `@tractorbeam/pnpm-config`, whose pnpmfile each project had to list and which failed to load on a fresh checkout when pnpm switched to the project's version.

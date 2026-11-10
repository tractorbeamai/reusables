# @tractorbeam/pnpm-plugin-tractorbeam-defaults

## 0.1.0

### Minor Changes

- b093c3b: Publish the shared pnpm config dependency as `@tractorbeam/pnpm-plugin-tractorbeam-defaults`, which pnpm loads automatically. It replaces `@tractorbeam/pnpm-config`, whose pnpmfile each project had to list and which failed to load on a fresh checkout when pnpm switched to the project's version.

# @tractorbeam/typescript-config

## 0.5.0

### Minor Changes

- 2fd1853: Add `bundler` and `effect` presets for type-checking code a bundler resolves, with `effect` adding the Effect language service.
- ed7c2aa: Reorganize the presets so a package extends one base and any add-ons, and needs no compiler options of its own.

  - Base presets `bundler`, `browser`, `node-bundler`, and `cloudflare-workers` share one set of checks and one `lib`, and each declares the `types` its environment needs.
  - `effect` and the new `vitest` are add-ons that combine with any base.
  - `browser` replaces `vite` and `react`, which are removed. `cloudflare-workers` now matches the other bundler presets and includes Node types.

## 0.4.0

### Minor Changes

- bdb5046: Add `./presets` export with a map of all preset configs for programmatic access.

## 0.3.0

### Minor Changes

- ef64c60: Inline @tsconfig/bases configs to fix extends resolution issues in consuming packages

## 0.2.0

### Minor Changes

- 14b5ff6: Add Cloudflare Workers configs for ESLint and TypeScript

## 0.1.2

### Patch Changes

- 91e3bdf: resolve issues, update dependencies

## 0.1.1

### Patch Changes

- ff0f768: docs: add MIT license and metadata in package.json config

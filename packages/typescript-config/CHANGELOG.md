# @tractorbeam/typescript-config

## 0.7.2

### Patch Changes

- cd81870: The package no longer declares `vitest` as an optional peer dependency. pnpm recorded that peer in every consumer's lockfile entry for the config, so each Vitest upgrade changed the entry and invalidated build caches keyed on it. The `vitest` preset still needs `vitest` installed alongside it, as the README says.

## 0.7.1

### Patch Changes

- ac8424f: The README says the `effect` preset's settings are read by the Effect rules that Oxlint runs on the Effect-patched tsrs.

## 0.7.0

### Minor Changes

- e53c5d6: The `effect` preset configures two Effect language service settings that Oxlint's Effect rules read from the tsconfig:

  - `brandedSchemaClasses` is `Class`, `Error`, and `Opaque`, so the service and `effecttsgo/schema-class-missing-brand` ask for a brand only on untagged Schema classes: a tagged class's or tagged error's literal `_tag` already keeps its type distinct.
  - `namespaceImportPackages` is `effect`, so `effecttsgo/prefer-namespace-import` asks for `import * as Effect from "effect/Effect"` over named imports from the `"effect"` barrel, and auto-import writes that form.

  Both take effect with `@effect/tsgo` 0.64 or later.

## 0.6.0

### Minor Changes

- bb05d2d: `strictest` drops `exactOptionalPropertyTypes` and `noPropertyAccessFromIndexSignature`, and adds `verbatimModuleSyntax` and `noUncheckedSideEffectImports`. Optional properties accept an explicit `undefined` again, and index-signature properties read with dot notation. Type-only imports must use `import type`, and a side-effect import must resolve.

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

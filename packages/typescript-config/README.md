# @tractorbeam/typescript-config

Shared `tsconfig` presets for Tractorbeam projects.

## Install

```bash
pnpm add -D @tractorbeam/typescript-config
```

## Usage

In your project’s `tsconfig.json`:

```json
{
  "extends": "@tractorbeam/typescript-config/node22.json"
}
```

## Presets

- `@tractorbeam/typescript-config/node.json`
- `@tractorbeam/typescript-config/node22.json`
- `@tractorbeam/typescript-config/strictest.json`
- `@tractorbeam/typescript-config/react.json`
- `@tractorbeam/typescript-config/next.json`
- `@tractorbeam/typescript-config/tanstack-start.json`
- `@tractorbeam/typescript-config/vite.json`
- `@tractorbeam/typescript-config/cloudflare-workers.json`
- `@tractorbeam/typescript-config/bundler.json`
- `@tractorbeam/typescript-config/effect.json`

### `bundler` and `effect`

`bundler` type-checks code that a bundler resolves, such as Vite, a Cloudflare Worker build, or a Node runner that strips types. It emits nothing, preserves import syntax, allows `.ts` extensions in imports, and reports unused locals and parameters. Its `lib` covers DOM, so one config can check browser code beside its `vite.config.ts`.

`effect` is `bundler` plus the Effect language service, with its diagnostics off.

Neither sets `types`, which defaults to `[]` in TypeScript 6. Each package lists the ambient types it uses:

```json
{
  "extends": "@tractorbeam/typescript-config/effect",
  "compilerOptions": { "types": ["@cloudflare/workers-types", "vitest/importMeta"] },
  "include": ["src", "tests"]
}
```

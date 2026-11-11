# @tractorbeam/typescript-config

Shared `tsconfig` presets for Tractorbeam projects. A package's `tsconfig.json` extends one base preset, adds any add-ons, and lists only the files it checks:

```json
{
  "extends": [
    "@tractorbeam/typescript-config/cloudflare-workers",
    "@tractorbeam/typescript-config/effect",
    "@tractorbeam/typescript-config/vitest"
  ],
  "include": ["src", "tests", "vitest.config.ts"]
}
```

## Install

```bash
pnpm add -D @tractorbeam/typescript-config
```

Install the packages a preset names in `types`, such as `@types/node`, too.

## Base presets

Extend exactly one.

The four bundler presets type-check code that a bundler or a type-stripping runner resolves. They emit nothing, preserve import syntax, allow `.ts` extensions in imports, and report unused locals and parameters. They share one `lib`, ES2023 with the DOM library for web-standard APIs such as `fetch` and `URL`, and differ only in the ambient `types` each environment needs:

| Preset | For | `types` |
| --- | --- | --- |
| `bundler` | Runtime-neutral libraries | none |
| `browser` | Browser code built with Vite, with its `vite.config.ts` | `node`, `vite/client` |
| `node-bundler` | Node code that a bundler builds | `node` |
| `cloudflare-workers` | Cloudflare Workers with `nodejs_compat` | `@cloudflare/workers-types`, `node` |

The other bases keep their own conventions:

- `node` and `node22`: Node code that `tsc` resolves with `nodenext`.
- `next`: Next.js.
- `tanstack-start`: TanStack Start.

## Add-ons

Add-ons go after the base in `extends` and set nothing a base sets, so they combine freely:

- `effect`: the Effect language service, with its diagnostics off, and two settings that the Effect rules read only from the tsconfig's `@effect/language-service` plugin entry, so every tsconfig that covers Effect code extends this preset. Oxlint runs those rules, such as the ones `@tractorbeam/oxlint-config`'s `effect` option turns on, on the Effect-patched tsrs:
  - `brandedSchemaClasses` asks for a brand only on untagged Schema classes, errors, and opaque types (`Class`, `Error`, and `Opaque`), since a tagged class's or tagged error's literal `_tag` already keeps its type distinct.
  - `namespaceImportPackages` makes `effect` a namespace-import package: `effecttsgo/prefer-namespace-import` asks for `import * as Effect from "effect/Effect"` over a named import from the `"effect"` barrel, and auto-import and the import quick fixes write that form.
- `vitest`: `import.meta.vitest` for in-source tests. It loads the types from a file, because a later preset's `types` would replace the base's instead of adding to them. Install `vitest` alongside it.
- `strictest`: the strictest checking flags.

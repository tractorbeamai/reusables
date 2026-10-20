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

Each bundler preset also maps `@/*` to the package's `src/*`, resolved from the package's own `tsconfig.json` through `${configDir}`. A bundler resolves the alias at build time when it reads `tsconfig.json` paths, such as Vite with `resolve.tsconfigPaths`. A package that sets its own `paths` replaces the alias, so it lists `@/*` again if it keeps it.

The other bases keep their own conventions:

- `node` and `node22`: Node code that `tsc` resolves with `nodenext`.
- `next`: Next.js.
- `tanstack-start`: TanStack Start.

## Add-ons

Add-ons go after the base in `extends` and set nothing a base sets, so they combine freely:

- `effect`: the Effect language service, with its diagnostics off.
- `vitest`: `import.meta.vitest` for in-source tests. It loads the types from a file, because a later preset's `types` would replace the base's instead of adding to them. Install `vitest` alongside it.
- `strictest`: the strictest checking flags.

# @tractorbeam/typescript-config

Shared `tsconfig` presets for Tractorbeam projects.

## Installation

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

## Available presets

- `@tractorbeam/typescript-config/node.json`
- `@tractorbeam/typescript-config/node22.json`
- `@tractorbeam/typescript-config/strictest.json`
- `@tractorbeam/typescript-config/react.json`
- `@tractorbeam/typescript-config/next.json`
- `@tractorbeam/typescript-config/tanstack-start.json`
- `@tractorbeam/typescript-config/vite.json`

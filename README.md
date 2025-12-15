# Tractorbeam Reusables

Shared configuration packages used across Tractorbeam projects.

## Packages

- `@tractorbeam/eslint-config`: shared ESLint v9 flat config presets
- `@tractorbeam/prettier-config`: shared Prettier config
- `@tractorbeam/typescript-config`: shared `tsconfig` presets

## Requirements

- Node `>= 22`
- pnpm (see `package.json#packageManager`)

## Commands

- `pnpm lint`: run package linting via Turborepo
- `pnpm build`: build packages that require compilation (e.g. `@tractorbeam/eslint-config`)
- `pnpm format`: format repo files with Prettier

## Publishing (internal)

These packages are intended for internal consumption via npm. Releases can be driven via Changesets when you’re ready to wire up a publish workflow.

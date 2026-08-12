# Tractorbeam Reusables

Shared configuration packages used across Tractorbeam projects.

## Packages

- `@tractorbeam/eslint-config`: shared ESLint v9 flat config presets
- `@tractorbeam/oxfmt-config`: shared Oxfmt configuration
- `@tractorbeam/oxlint-config`: shared Oxlint configuration
- `@tractorbeam/prettier-config`: shared Prettier config
- `@tractorbeam/typescript-config`: shared `tsconfig` presets

## Requirements

- Node 24
- pnpm (see `package.json#packageManager`)

## Commands

- `pnpm build`: build packages that require compilation
- `pnpm check`: check formatting, linting, and types with Vite+
- `pnpm format`: format repository files with Vite+

## Publishing (internal)

These packages are intended for internal consumption via npm. Releases can be driven via Changesets when you’re ready to wire up a publish workflow.

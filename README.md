# Tractorbeam Reusables

Shared configuration packages used across Tractorbeam projects.

## Packages

- `@tractorbeam/oxfmt-config`: shared Oxfmt configuration
- `@tractorbeam/oxlint-config`: shared Oxlint configuration
- `@tractorbeam/typescript-config`: shared `tsconfig` presets
- `@tractorbeam/vale-config`: shared Vale configuration, released as a Vale package
- `@tractorbeam/vite-plugin-mcp-apps`: Vite plugin that builds filesystem-based MCP Apps

### Deprecated

- `@tractorbeam/eslint-config`: use Oxlint with `@tractorbeam/oxlint-config`
- `@tractorbeam/prettier-config`: use Oxfmt with `@tractorbeam/oxfmt-config`

Their source stays in `packages/` at the final published versions. Both are excluded from the pnpm workspace and are no longer built or released.

## Requirements

- Node 24
- pnpm (see `package.json#packageManager`)

## Commands

- `pnpm build`: build packages that require compilation
- `pnpm check`: check formatting, linting, and types with Vite+
- `pnpm format`: format repository files with Vite+

## Publishing (internal)

These packages are intended for internal consumption via npm. Releases can be driven via Changesets when you’re ready to wire up a publish workflow.

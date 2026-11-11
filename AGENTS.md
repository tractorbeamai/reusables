# Reusables

Shared configurations for Tractorbeam projects: Oxlint, Oxfmt, pnpm, TypeScript, and Vale configs, plus a Vite plugin for MCP Apps. The Vale config publishes to npm like the others, with its Vale package built into `dist/Tractorbeam`. The ESLint and Prettier configs in `packages/` are deprecated, excluded from the workspace, and no longer released.

## Checks

Run CI's checks in its order, through `pnpm exec vp`, since `vp` isn't on `PATH` outside CI:

```bash
pnpm exec vp run -r build
pnpm exec vp run check
pnpm exec vp run -r test
```

Build first: the root lint config loads `@tractorbeam/oxlint-config`'s rules from its `dist`, and lint stops before analysis without them.

Lint through `check` (`effect-tsgo --tsrs-lint vp check`), never a bare `vp check` or `vp lint`. Vite+ always sets `OXLINT_TSGOLINT_PATH`, so without the wrapper type-aware lint runs on tsgolint instead of the Effect-patched tsrs.

## Changesets

This monorepo uses [Changesets](https://github.com/changesets/changesets) for versioning and changelogs.

### Adding a Changeset (Non-Interactive)

The `changeset add` CLI requires an interactive TTY. To create changesets non-interactively (e.g., in Claude Code or CI):

1. Create an empty changeset:

   ```bash
   pnpm changeset add --empty
   ```

2. Edit the created file in `.changeset/` (it will have a random name like `funny-dogs-dance.md`):

   ```markdown
   ---
   "@tractorbeam/oxlint-config": minor
   ---

   Add ui config with no-button-height-class rule
   ```

**Bump types:**

- `major` - Breaking changes
- `minor` - New features (backwards compatible)
- `patch` - Bug fixes

### Checking Status

```bash
pnpm changeset status
```

### Publishing (CI handles this)

The GitHub Action automatically creates a "Version Packages" PR when changesets are merged to main, and publishes when that PR is merged.

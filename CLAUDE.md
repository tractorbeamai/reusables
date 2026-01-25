# Reusables

Shared configurations for Tractorbeam projects: ESLint, Prettier, and TypeScript configs.

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
   "@tractorbeam/eslint-config": minor
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

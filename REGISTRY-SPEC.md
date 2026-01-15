# Registry Spec

A codegen-based shadcn registry that inherits from upstream registries (shadcn/ui, COSS, etc.) with local overrides and on-demand sync.

## Goals

1. **Inherit from upstream** - Pull components from shadcn/ui or other registries
2. **Local overrides** - Modify components while tracking what changed
3. **On-demand sync** - Fetch upstream updates, merge intelligently
4. **Self-documenting** - Each component includes docs + implementation
5. **Redistributable** - Publish as `@tractorbeam` (or `@tb`) registry

## File Structure

```
packages/ui/
├── registry.config.ts      # Upstream sources, overrides config
├── upstream.lock.json      # Tracks upstream versions/hashes (generated)
├── registry/
│   └── default/            # Style variant (could have multiple)
│       ├── button/
│       │   ├── button.tsx          # Implementation with embedded docs
│       │   └── button.meta.json    # Generated: tracks upstream diff
│       └── card/
│           └── ...
├── dist/                   # Generated registry output
│   └── r/
│       ├── button.json
│       └── card.json
└── scripts/
    ├── sync.ts             # Fetch upstream, detect changes
    └── build.ts            # Generate final registry
```

## Configuration

```ts
// registry.config.ts
import { defineRegistry } from './scripts/types'

export default defineRegistry({
  name: 'tractorbeam',
  namespace: '@tb',          // or '@tractorbeam'
  homepage: 'https://ui.tractorbeam.io',

  // Upstream registries to inherit from (in priority order)
  upstreams: [
    {
      name: 'shadcn',
      registry: 'https://ui.shadcn.com',
      // Components to pull (empty = all, or specify list)
      include: ['button', 'card', 'input', 'dialog', ...],
    },
    {
      name: 'coss',
      registry: 'https://ui.coss.com',
      include: ['calendar', 'date-picker'],
    },
  ],

  // Override behavior for upstream items
  overrides: {
    button: {
      mode: 'replace',  // Full copy with local modifications (default)
      changes: ['added ghost-subtle variant', 'improved focus states'],
    },
    'new-york': {
      mode: 'passthrough',  // Redistribute unchanged
    },
  },

  // Output configuration
  output: {
    dir: 'dist/r',
  },
})
```

## Sync Workflow

### `pnpm registry:sync`

1. Fetch upstream registry manifests
2. For each upstream component:
   - Download current version
   - Compare hash with `upstream.lock.json`
   - If changed, show diff
3. Interactive prompt:
   - `[a]ccept` - Take upstream changes
   - `[s]kip` - Keep local version
   - `[m]erge` - Open in editor/diff tool
4. Update `upstream.lock.json`

### `pnpm registry:build`

We wrap the official `shadcn build` command, not replace it:

1. Read `registry.config.ts`
2. For each item:
   - If `mode: 'passthrough'` → copy upstream as-is
   - If `mode: 'replace'` → use local files, embed docs in code comments
   - If `mode: 'local'` → use local files directly
3. Generate `registry.json` (input for shadcn build)
4. Run `shadcn build` to generate `dist/r/*.json` files

This ensures we stay 100% compatible with the shadcn CLI and schema.

## Registry Item Types

shadcn registries support multiple item types. We need to handle all of them:

| Type | Description | Docs Embedding |
|------|-------------|----------------|
| `registry:component` | UI components | Yes |
| `registry:ui` | UI primitives, single-file components | Yes |
| `registry:block` | Complex multi-file components | Yes |
| `registry:hook` | React hooks | Yes |
| `registry:lib` | Utility libraries | Yes |
| `registry:page` | Routes and pages (requires `target`) | Yes |
| `registry:file` | Generic files (requires `target`) | No |
| `registry:style` | Design system styles | No (CSS/JSON) |
| `registry:theme` | Complete themes | No (CSS/JSON) |
| `registry:font` | Font configurations | No |
| `registry:base` | Base configuration | No |
| `registry:item` | Universal/cross-framework | Depends |

### File Target Property

For `registry:page` and `registry:file` types, the `target` property is required to specify where the file should be placed. Use `~` for project root:

```json
{
  "path": "registry/default/pages/dashboard.tsx",
  "type": "registry:page",
  "target": "app/dashboard/page.tsx"
}
```

## Item Modes

### `passthrough`

Take upstream item exactly as-is. No modifications, no docs embedding. Good for styles, themes, and items you just want to redistribute.

```ts
overrides: {
  'new-york': {
    mode: 'passthrough',  // Just redistribute the style unchanged
  },
}
```

### `replace` (default for components)

Full copy of upstream with local modifications. Tracked via git diff. Docs are embedded.

```tsx
// registry/default/button/button.tsx
// Copied from upstream, then modified locally
// Upstream: https://ui.shadcn.com/r/button.json @ abc123

// Full implementation here, with our changes inline
```

### `local`

Fully local item, no upstream. For things we create ourselves.

```ts
overrides: {
  'data-table': {
    mode: 'local',
    // No upstream, this is our own creation
  },
}
```

## Local Items (Our Own Creations)

Items we create and distribute that don't come from any upstream.

### Full Schema Reference

All fields from the [registry-item.json schema](https://ui.shadcn.com/docs/registry/registry-item-json):

```ts
// registry.config.ts
export default defineRegistry({
  // ... upstreams config ...

  // Local items we create ourselves
  local: [
    {
      // Required
      name: 'data-table',
      type: 'registry:component',

      // Metadata
      title: 'Data Table',
      description: 'A powerful data table with sorting, filtering, and pagination.',
      author: 'tractorbeam <https://tractorbeam.io>',
      docs: 'Markdown documentation for the component.',
      categories: ['tables', 'data'],
      meta: { complexity: 'advanced' },

      // Files
      files: [
        {
          path: 'registry/default/data-table/data-table.tsx',
          type: 'registry:component',
        },
        {
          path: 'registry/default/data-table/columns.tsx',
          type: 'registry:component',
        },
      ],

      // Dependencies
      dependencies: ['@tanstack/react-table'],
      devDependencies: ['@types/some-package'],
      registryDependencies: ['button', 'input', 'select'],

      // Styling
      cssVars: {
        theme: {
          'font-table': 'monospace',
        },
        light: {
          'table-header': '220 14% 96%',
        },
        dark: {
          'table-header': '220 14% 10%',
        },
      },
      css: {
        '@layer components': {
          '.data-table': {
            '@apply border rounded-lg': {},
          },
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      tailwind: {
        // Legacy, prefer cssVars for Tailwind v4
        theme: {
          extend: {
            colors: {
              table: 'hsl(var(--table-header))',
            },
          },
        },
      },

      // Environment
      envVars: {
        NEXT_PUBLIC_TABLE_PAGE_SIZE: '20',
      },
    },

    // Hook example
    {
      name: 'use-debounce',
      type: 'registry:hook',
      title: 'useDebounce',
      description: 'Debounce a value or callback.',
      files: [
        {
          path: 'registry/default/hooks/use-debounce.ts',
          type: 'registry:hook',
        },
      ],
    },

    // Style example (can use `extends`)
    {
      name: 'tractorbeam',
      type: 'registry:style',
      title: 'Tractorbeam Style',
      description: 'Our brand style with custom colors and tokens.',
      extends: 'new-york',  // Inherit from another style
      cssVars: {
        light: { primary: '220 90% 56%' },
        dark: { primary: '220 90% 66%' },
      },
    },

    // Page example (requires target)
    {
      name: 'dashboard-page',
      type: 'registry:page',
      title: 'Dashboard',
      description: 'A dashboard page template.',
      files: [
        {
          path: 'registry/default/pages/dashboard.tsx',
          type: 'registry:page',
          target: 'app/dashboard/page.tsx',
        },
      ],
      registryDependencies: ['card', 'data-table', 'chart'],
    },
  ],
})
```

### File Structure for Local Items

```
packages/ui/
├── registry/
│   └── default/
│       ├── button/              # From upstream (replace mode)
│       │   └── button.tsx
│       ├── data-table/          # Local creation
│       │   └── data-table.tsx
│       ├── hooks/               # Local hooks
│       │   └── use-debounce.ts
│       └── styles/              # Local styles
│           └── tractorbeam.css
```

## Passthrough Items (Styles, Themes)

For styles and other non-code items, we skip docs embedding and just redistribute:

```ts
upstreams: [
  {
    name: 'shadcn',
    registry: 'https://ui.shadcn.com',
    include: ['button', 'card', 'input'],
    // Styles to pass through unchanged
    passthrough: ['new-york', 'default'],
  },
]
```

The build process for passthrough items:
1. Fetch upstream registry JSON
2. Copy files as-is (no docs embedding)
3. Update registry dependencies to point to our namespace
4. Output to `dist/r/`

## Output Format

The build process generates files that conform to the shadcn registry schemas.

### registry.json (Manifest)

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "tractorbeam",
  "homepage": "https://ui.tractorbeam.io",
  "items": [
    {
      "name": "button",
      "type": "registry:component",
      "title": "Button",
      "description": "A button component with variants.",
      "registryDependencies": [],
      "dependencies": ["@radix-ui/react-slot", "class-variance-authority"],
      "files": [
        {
          "path": "registry/default/button/button.tsx",
          "type": "registry:component"
        }
      ]
    }
  ]
}
```

### Individual Item JSON (dist/r/button.json)

The `shadcn build` command generates individual JSON files with `content` populated:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "button",
  "type": "registry:component",
  "title": "Button",
  "description": "A button component with variants.",
  "registryDependencies": [],
  "dependencies": ["@radix-ui/react-slot", "class-variance-authority"],
  "files": [
    {
      "path": "components/ui/button.tsx",
      "type": "registry:component",
      "content": "/** ... embedded docs ... */\nimport * as React from \"react\"\n..."
    }
  ]
}
```

Note: The `content` field is populated by the build process - we don't write it in our config.

## Lock File

```json
// upstream.lock.json
{
  "locked": "2025-01-15T10:30:00Z",
  "upstreams": {
    "shadcn": {
      "registry": "https://ui.shadcn.com",
      "components": {
        "button": {
          "hash": "abc123def456",
          "fetchedAt": "2025-01-15T10:30:00Z",
          "files": [
            { "path": "button.tsx", "hash": "..." }
          ]
        }
      }
    }
  }
}
```

## Embedded Documentation

Two levels of documentation:

1. **Schema `docs` field**: Markdown shown during `shadcn add` (installation instructions)
2. **Code comments**: Full docs embedded in the actual component file

Both are populated from upstream docs. The code comment travels with the file into the consumer's codebase.

### Why Both?

The `docs` field is for the CLI experience. Code comments are for developers reading the source. We want both.

The build process:
1. Fetches upstream docs markdown (e.g., `https://coss.com/ui/docs/components/frame.md`)
2. Strips interactive elements (`<ComponentPreview>`, `<CodeTabs>`, etc.)
3. Embeds as a block comment at the top of the component file

### Example Output

```tsx
/**
 * @name Frame
 * @description A framed container for grouping related information.
 * @upstream https://ui.coss.com/r/frame.json
 * @docs https://coss.com/ui/docs/components/frame.md
 *
 * ## Usage
 *
 * ```tsx
 * import {
 *   Frame,
 *   FrameDescription,
 *   FrameFooter,
 *   FrameHeader,
 *   FramePanel,
 *   FrameTitle,
 * } from "@/components/ui/frame"
 * ```
 *
 * ```tsx
 * <Frame>
 *   <FrameHeader>
 *     <FrameTitle>Title</FrameTitle>
 *     <FrameDescription>Description</FrameDescription>
 *   </FrameHeader>
 *   <FramePanel>Content</FramePanel>
 *   <FrameFooter>Footer</FrameFooter>
 * </Frame>
 * ```
 *
 * ## API Reference
 *
 * ### Frame
 * The main container component.
 * | Prop        | Type     | Default |
 * | ----------- | -------- | ------- |
 * | `className` | `string` |         |
 *
 * ### FramePanel
 * A panel container for frame content.
 *
 * ### FrameHeader / FrameTitle / FrameDescription / FrameFooter
 * Header and footer sections with title and description slots.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

// ... implementation
```

### Docs URL Pattern

Configure where to fetch docs for each upstream:

```ts
upstreams: [
  {
    name: 'coss',
    registry: 'https://ui.coss.com',
    docsUrl: 'https://coss.com/ui/docs/components/{name}.md',
  },
  {
    name: 'shadcn',
    registry: 'https://ui.shadcn.com',
    docsUrl: 'https://ui.shadcn.com/docs/components/{name}.md',
  },
]
```

### Stripping Interactive Elements

The build process removes these patterns from upstream docs:
- `<ComponentPreview ... />`
- `<CodeTabs>...</CodeTabs>`
- `<ComponentSource ... />`
- Installation instructions (we replace with our own)

## Component Metadata

Each component gets a generated `.meta.json`:

```json
// registry/default/button/button.meta.json
{
  "name": "button",
  "upstream": {
    "registry": "shadcn",
    "hash": "abc123def456",
    "url": "https://ui.shadcn.com/r/button.json"
  },
  "override": {
    "mode": "replace",
    "changes": ["added ghost-subtle variant"],
    "localHash": "xyz789"
  },
  "drift": {
    "upstreamChanged": false,
    "localChanged": true,
    "lastChecked": "2025-01-15T10:30:00Z"
  }
}
```

## Open Questions

1. **Namespace**: `@tractorbeam` vs `@tb` vs something else?

2. **Style variants**: Support multiple styles (default, new-york) or just one?

3. **Where to host**:
   - Vercel (static)?
   - Bundled with docs site?
   - Standalone package?

4. **Monorepo placement**:
   - `packages/ui/` in reusables?
   - Separate repo?

## Resolved

- **Docs format**: Inline block comments in component files
- **Merge strategy**: Use `replace` mode (full copy + track drift), no fragile AST merging
- **Versioning**: Follow whatever shadcn does
- **Consumer setup**: Standard shadcn registry - no special config, just `npx shadcn add @namespace/component`
- **Multi-file components**: Blocks handle this natively in the registry spec
- **Tailwind/CSS config**: Registry handles merging natively
- **Conflict resolution**: Human resolves manually when multiple upstreams have same item
- **Registry dependencies**: Keep as-is, shadcn CLI resolves them
- **Testing**: Not needed for v1
- **Preview site**: Not needed for v1

## Commands

```bash
pnpm registry:sync           # Fetch upstream updates
pnpm registry:sync button    # Sync specific component
pnpm registry:build          # Build registry JSON
pnpm registry:dev            # Serve locally for testing
pnpm registry:diff           # Show drift from upstream
pnpm registry:add <name>     # Add new component from upstream
```

## CI/CD

Daily GitHub Action that syncs from upstream:

```yaml
# .github/workflows/registry-sync.yml
name: Registry Sync

on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6am UTC
  workflow_dispatch:      # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install

      - name: Sync upstream
        id: sync
        run: pnpm registry:sync --ci
        # --ci flag: auto-accept non-conflicting updates, skip conflicts

      - name: Build registry
        if: steps.sync.outputs.updated == 'true'
        run: pnpm registry:build

      - name: Create PR for updates
        if: steps.sync.outputs.updated == 'true'
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore(registry): sync upstream components'
          body: |
            Automated sync from upstream registries.

            ## Updated
            ${{ steps.sync.outputs.updated_items }}

            ## Skipped (needs human review)
            ${{ steps.sync.outputs.conflicts }}
          branch: registry-sync
          labels: registry, automated

      - name: Create issue for conflicts
        if: steps.sync.outputs.has_conflicts == 'true'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Registry sync: conflicts need resolution',
              body: `The following items have upstream changes that conflict with local modifications:\n\n${{ steps.sync.outputs.conflicts }}\n\nRun \`pnpm registry:sync\` locally to resolve.`,
              labels: ['registry', 'needs-review']
            })
```

### Sync Modes

The `--ci` flag enables non-interactive mode:

- **Passthrough items**: Auto-update (no local changes to conflict)
- **Replace items with no local drift**: Auto-update
- **Replace items with local modifications**: Skip, report as conflict
- **Local items**: Ignore (no upstream)

### Outputs

The sync script outputs for CI:
- `updated`: boolean, whether any items were updated
- `updated_items`: markdown list of what was updated
- `has_conflicts`: boolean, whether conflicts were skipped
- `conflicts`: markdown list of items needing human review

## Implementation Phases

### Phase 1: Basic Sync + Build
- [ ] `registry.config.ts` schema
- [ ] Fetch upstream registry JSON
- [ ] Download component files
- [ ] Generate `upstream.lock.json`
- [ ] Build registry JSON output

### Phase 2: Override Support
- [ ] `replace` mode (copy + track)
- [ ] Diff detection (local vs upstream)
- [ ] `registry:diff` command

### Phase 3: Interactive Sync
- [ ] Detect upstream changes
- [ ] Interactive merge prompts
- [ ] Conflict resolution

### Phase 4: Docs Embedding
- [ ] Fetch upstream docs markdown
- [ ] Strip interactive elements
- [ ] Embed as block comments in component files
- [ ] Local docs override support

---

## References

### shadcn Registry Docs
- [Introduction](https://ui.shadcn.com/docs/registry)
- [Getting Started](https://ui.shadcn.com/docs/registry/getting-started)
- [registry.json Schema](https://ui.shadcn.com/docs/registry/registry-json)
- [registry-item.json Schema](https://ui.shadcn.com/docs/registry/registry-item-json)
- [Namespaces](https://ui.shadcn.com/docs/registry/namespace)
- [Examples](https://ui.shadcn.com/docs/registry/examples)
- [Registry Directory](https://ui.shadcn.com/docs/directory)

### JSON Schemas
- [registry.json schema](https://ui.shadcn.com/schema/registry.json)
- [registry-item.json schema](https://ui.shadcn.com/schema/registry-item.json)

### Templates & Examples
- [Official Registry Template](https://github.com/shadcn-ui/registry-template)
- [COSS UI](https://github.com/cosscom/coss)

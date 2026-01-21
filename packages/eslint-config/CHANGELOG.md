# @tractorbeam/eslint-config

## 0.3.0

### Minor Changes

- 44c3d3e: Add zod config with eslint-plugin-zod recommended rules
- 14b5ff6: Add Cloudflare Workers configs for ESLint and TypeScript
- 52422a6: Add ui config with custom ESLint rules:
  - `no-button-height-class`: warns when Button components use Tailwind sizing classes (h-\*, w-\*, size-\*, min-h-\*, max-h-\*, min-w-\*, max-w-\*) instead of the size prop. Allowed: \*-full, min-\*-0, max-\*-none.
  - `no-icon-class-in-button`: warns when Icon components nested inside Button have className attributes. Detects icons by name (\*Icon, Icons.\*) and by type (LucideIcon from lucide-react) when type info is available.

## 0.2.1

### Patch Changes

- e65f7d8: remove postinstall script

## 0.2.0

### Minor Changes

- a8cad87: add `eslint-plugin-depend`

## 0.1.3

### Patch Changes

- 91e3bdf: resolve issues, update dependencies

## 0.1.2

### Patch Changes

- 2794e32: fix(eslint-config): disable `unicorn/no-array-sort`

## 0.1.1

### Patch Changes

- ff0f768: docs: add MIT license and metadata in package.json config

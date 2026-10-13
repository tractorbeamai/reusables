# @tractorbeam/eslint-config

## 0.4.0

### Minor Changes

- 3d1f5e6: **Deprecated.** This is the final release of `@tractorbeam/eslint-config`. Migrate to Oxlint with `@tractorbeam/oxlint-config`, and format with Oxfmt using `@tractorbeam/oxfmt-config`.

  Require ESLint `^10.4.0`, and update bundled plugins: `eslint-plugin-unicorn` 77, `eslint-plugin-regexp` 3, `eslint-plugin-zod` 4, `@eslint/js` 10, `globals` 17, and `typescript-eslint` 8.71. Unicorn 77 enables new `recommended` rules; `unicorn/no-asterisk-prefix-in-documentation-comments` stays off so conventional JSDoc blocks remain valid. Projects still on ESLint 9 must upgrade before adopting this release.

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

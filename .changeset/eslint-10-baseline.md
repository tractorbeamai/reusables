---
"@tractorbeam/eslint-config": minor
---

**Deprecated.** This is the final release of `@tractorbeam/eslint-config`. Migrate to Oxlint with `@tractorbeam/oxlint-config`, and format with Oxfmt using `@tractorbeam/oxfmt-config`.

Require ESLint `^10.4.0`, and update bundled plugins: `eslint-plugin-unicorn` 77, `eslint-plugin-regexp` 3, `eslint-plugin-zod` 4, `@eslint/js` 10, `globals` 17, and `typescript-eslint` 8.71. Unicorn 77 enables new `recommended` rules; `unicorn/no-asterisk-prefix-in-documentation-comments` stays off so conventional JSDoc blocks remain valid. Projects still on ESLint 9 must upgrade before adopting this release.

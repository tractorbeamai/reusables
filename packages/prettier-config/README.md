# @tractorbeam/prettier-config

> [!WARNING]
> **Deprecated.** This package receives no further updates. Format with [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) using [`@tractorbeam/oxfmt-config`](https://www.npmjs.com/package/@tractorbeam/oxfmt-config) instead, and lint with [Oxlint](https://oxc.rs/docs/guide/usage/linter) using [`@tractorbeam/oxlint-config`](https://www.npmjs.com/package/@tractorbeam/oxlint-config).

Shared Prettier configuration for Tractorbeam projects.

## Install

```bash
pnpm add -D @tractorbeam/prettier-config prettier
```

## Usage

### `prettier.config.js` (ESM)

```js
import config from "@tractorbeam/prettier-config";

export default config;
```

### `package.json`

```json
{
  "prettier": "@tractorbeam/prettier-config"
}
```

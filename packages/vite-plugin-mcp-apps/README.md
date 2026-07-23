# @tractorbeam/vite-plugin-mcp-apps

Build a filesystem-based collection of [MCP Apps](https://modelcontextprotocol.io/extensions/apps/build) as self-contained HTML files with Vite 8 or Vite Plus.

## Installation

```sh
pnpm add -D @tractorbeam/vite-plugin-mcp-apps vite
```

Vite 8 is a required peer dependency.

## Usage

```ts
import react from "@vitejs/plugin-react";
import { mcpApps } from "@tractorbeam/vite-plugin-mcp-apps";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [react(), mcpApps()],
});
```

Place each MCP app in a named directory under `src/mcp-apps`:

```text
src/mcp-apps/
├── weather/
│   ├── index.html
│   ├── main.ts
│   └── styles.css
└── charts/
    └── pie/
        ├── index.html
        └── main.ts
```

Running `vite build` or `vp build` produces:

```text
dist/
├── weather.html
└── charts/
    └── pie.html
```

The plugin discovers `<appsDirectory>/**/index.html`. The containing directory becomes the MCP app ID and output path. A root-level `src/mcp-apps/index.html` is invalid because every app must have a name.

## Options

```ts
import { mcpApps } from "@tractorbeam/vite-plugin-mcp-apps";

mcpApps({
  appsDirectory: "src/tools",
});
```

`appsDirectory` is project-relative and defaults to `src/mcp-apps`.

## Build constraints

The plugin owns a dedicated MCP Apps build. It creates one isolated client environment per discovered app, then builds those environments serially. Every app receives an independent dependency graph and emits exactly one HTML file containing its JavaScript, CSS, and imported assets. JavaScript and CSS inlining is delegated to [`vite-plugin-singlefile`](https://github.com/richardtallent/vite-plugin-singlefile); this plugin retains MCP app discovery, isolated builds, output naming, and strict single-file validation.

Normal Vite configuration continues to apply to every app, including plugins, `base`, `define`, resolution aliases, CSS and JSON handling, transforms, build targets, minification, and `build.outDir`. The default `base` is `./`, but an explicit project base is preserved.

Library, SSR, watch, custom builder/environment, explicit input/output, externalized modules, manifest, source-map, public-directory copying, and code-splitting configurations are incompatible with this build.

The plugin is build-only. During `vite dev` and `vp dev`, use each source `index.html` path directly. Public assets must be imported through the app graph so Vite can inline them. The build fails when a local URL remains in a standard HTML asset attribute, a configured `html.additionalAssetSources` attribute, or inline CSS.

CSP metadata and apps that require external resource, connection, or frame domains are outside the single-file build path.

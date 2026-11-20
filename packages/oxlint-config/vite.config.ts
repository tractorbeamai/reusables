import { defineConfig } from "vite-plus";

const target = "node20.19.0";

/** The JS plugins, each published on the `@tractorbeam/oxlint-config/<name>` subpath. */
const plugins = [
  "effect-style",
  "landmines-testing",
  "playwright",
  "anti-slop",
  "stylistic",
  "ui",
  "vitest-style",
];

export default defineConfig({
  pack: [
    {
      // The presets, with declarations for the configs that extend them.
      dts: true,
      entry: { index: "src/index.ts" },
      sourcemap: true,
      target,
    },
    {
      // Our own plugins bundle the rule sources they build on, so consumers
      // install none of them; `landmines-testing`, `playwright`, and
      // `stylistic` re-export a dependency, which stays external.
      deps: { onlyBundle: ["@oxlint/plugins", "@nkzw/oxlint-config", "oxlint-plugin-anti-slop"] },
      dts: false,
      entry: Object.fromEntries(plugins.map((name) => [name, `src/plugins/${name}.ts`])),
      sourcemap: true,
      target,
    },
  ],
});

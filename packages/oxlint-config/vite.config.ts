import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: [
    {
      dts: true,
      entry: "src/index.ts",
      sourcemap: true,
      target: "node20.19.0",
    },
    {
      dts: true,
      entry: "src/effect.ts",
      sourcemap: true,
      target: "node20.19.0",
    },
    {
      deps: {
        onlyBundle: ["@oxlint/plugins", "@nkzw/oxlint-config"],
      },
      dts: false,
      entry: "src/quality.ts",
      sourcemap: true,
      target: "node20.19.0",
    },
    {
      deps: {
        onlyBundle: ["@oxlint/plugins"],
      },
      dts: false,
      entry: "src/ui.ts",
      sourcemap: true,
      target: "node20.19.0",
    },
    {
      deps: {
        onlyBundle: ["@oxlint/plugins"],
      },
      dts: false,
      entry: "src/effect-style.ts",
      sourcemap: true,
      target: "node20.19.0",
    },
    {
      deps: {
        onlyBundle: ["@oxlint/plugins"],
      },
      dts: false,
      entry: "src/vitest-style.ts",
      sourcemap: true,
      target: "node20.19.0",
    },
    {
      deps: {
        onlyBundle: ["@oxlint/plugins"],
      },
      dts: false,
      entry: "src/effect-style.ts",
      sourcemap: true,
      target: "node20.19.0",
    },
    {
      deps: {
        onlyBundle: ["@oxlint/plugins"],
      },
      dts: false,
      entry: "src/vitest-style.ts",
      sourcemap: true,
      target: "node20.19.0",
    },
    {
      dts: false,
      entry: "src/landmines-testing.ts",
      sourcemap: true,
      target: "node20.19.0",
    },
    {
      dts: false,
      entry: "src/playwright.ts",
      sourcemap: true,
      target: "node20.19.0",
    },
    {
      dts: false,
      entry: "src/stylistic.ts",
      sourcemap: true,
      target: "node20.19.0",
    },
  ],
  run: {
    tasks: {
      test: {
        command: "node --test test/*.test.js",
        dependsOn: ["build"],
        cache: { output: [] },
      },
    },
  },
});

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
      deps: {
        alwaysBundle: ["oxlint-plugin-anti-slop"],
        onlyBundle: ["@oxlint/plugins", "oxlint-plugin-anti-slop"],
      },
      dts: false,
      entry: "src/anti-slop.ts",
      sourcemap: true,
      target: "node20.19.0",
    },
  ],
  run: {
    tasks: {
      test: {
        command: "node --test test/*.test.js",
        dependsOn: ["build"],
        output: [],
      },
    },
  },
});

import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: true,
    entry: ["src/index.ts"],
    format: ["esm"],
    sourcemap: true,
  },
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

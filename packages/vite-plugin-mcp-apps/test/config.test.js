import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, test } from "node:test";

import { appHtml, buildProject, cleanupProjects, createProject, listFiles } from "./helpers.js";

afterEach(cleanupProjects);

test("preserves compatible Vite configuration across every app build", async () => {
  const project = await createProject({
    "src/mcp-apps/weather/index.html": appHtml("Weather", "./main.js"),
    "src/mcp-apps/weather/main.js": `
      import { shared } from "@shared";
      document.body.dataset.config = [
        shared,
        __MCP_DEFINED__,
        import.meta.env.BASE_URL,
      ].join(":");
    `,
    "src/shared.js": `export const shared = "aliased-value";`,
  });

  const outputDirectory = await buildProject(project, {
    config: {
      base: "/embedded/",
      build: {
        minify: false,
        target: "es2022",
      },
      define: {
        __MCP_DEFINED__: JSON.stringify("defined-value"),
      },
      resolve: {
        alias: {
          "@shared": path.join(project, "src/shared.js"),
        },
      },
    },
  });
  const html = await readFile(path.join(outputDirectory, "weather.html"), "utf8");

  assert.deepEqual(await listFiles(outputDirectory), ["weather.html"]);
  assert.match(html, /aliased-value/u);
  assert.match(html, /defined-value/u);
  assert.match(html, /\/embedded\//u);
});

test("rejects incompatible dedicated-build configuration", async () => {
  const project = await createProject({
    "src/mcp-apps/weather/index.html": appHtml("Weather", "./main.js"),
    "src/mcp-apps/weather/main.js": `document.body.dataset.app = "weather";`,
  });

  await assert.rejects(
    buildProject(project, {
      config: {
        build: {
          lib: {
            entry: path.join(project, "src/mcp-apps/weather/main.js"),
          },
        },
      },
    }),
    /cannot be combined with: build\.lib/u,
  );
});

test("rejects externalized modules", async () => {
  const project = await createProject({
    "src/mcp-apps/weather/index.html": appHtml("Weather", "./main.js"),
    "src/mcp-apps/weather/main.js": `document.body.dataset.app = "weather";`,
  });

  await assert.rejects(
    buildProject(project, {
      config: {
        build: {
          rolldownOptions: {
            external: ["external-dependency"],
          },
        },
      },
    }),
    /cannot be combined with: .*external/u,
  );

  await assert.rejects(
    buildProject(project, {
      config: {
        build: {
          rollupOptions: {
            external: ["external-dependency"],
          },
        },
      },
    }),
    /cannot be combined with: .*external/u,
  );
});

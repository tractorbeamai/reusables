import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterEach, test } from "node:test";

import {
  appHtml,
  buildProject,
  cleanupProjects,
  createProject,
  listFiles,
  run,
  snapshotDirectory,
} from "./helpers.js";

afterEach(cleanupProjects);

test("builds nested filesystem entries as independently bundled HTML files", async () => {
  const project = await createProject({
    "src/mcp-apps/charts/pie/index.html": appHtml("Pie", "./main.js"),
    "src/mcp-apps/charts/pie/main.js": `
      import { shared } from "../../../shared.js";
      document.querySelector("#app").textContent = "chart:" + shared;
    `,
    "src/mcp-apps/notes.html": "<p>not an entry</p>",
    "src/mcp-apps/weather/dynamic.js": `export const forecast = "dynamic-forecast";`,
    "src/mcp-apps/weather/icon.svg": `
      <svg xmlns="http://www.w3.org/2000/svg"><text>weather-icon</text></svg>
    `,
    "src/mcp-apps/weather/index.html": appHtml("Weather", "./main.js"),
    "src/mcp-apps/weather/main.js": `
      import icon from "./icon.svg";
      import { shared } from "../../shared.js";
      import "./styles.css";
      const image = document.createElement("img");
      image.src = icon;
      document.body.append(image);
      document.querySelector("#app").textContent = "weather:" + shared;
      import("./dynamic.js").then(({ forecast }) => document.body.dataset.forecast = forecast);
    `,
    "src/mcp-apps/weather/styles.css": `
      #app { color: rgb(12 34 56); }
    `,
    "src/shared.js": `export const shared = "shared-dependency";`,
  });

  const outputDirectory = await buildProject(project);
  const files = await listFiles(outputDirectory);

  assert.deepEqual(files, ["charts/pie.html", "weather.html"]);

  const [chartsHtml, weatherHtml] = await Promise.all([
    readFile(path.join(outputDirectory, "charts/pie.html"), "utf8"),
    readFile(path.join(outputDirectory, "weather.html"), "utf8"),
  ]);

  assert.match(chartsHtml, /chart:/u);
  assert.match(chartsHtml, /shared-dependency/u);
  assert.doesNotMatch(chartsHtml, /weather:/u);
  assert.match(weatherHtml, /weather:/u);
  assert.match(weatherHtml, /shared-dependency/u);
  assert.match(weatherHtml, /dynamic-forecast/u);
  assert.match(weatherHtml, /color:#0c2238/u);
  assert.match(weatherHtml, /data:image\/svg\+xml/u);
  assert.doesNotMatch(weatherHtml, /<script[^>]+src=/u);
  assert.doesNotMatch(weatherHtml, /<link[^>]+stylesheet/u);
  assert.doesNotMatch(weatherHtml, /<link[^>]+modulepreload/u);
});

test("supports a project-relative custom appsDirectory", async () => {
  const project = await createProject({
    "features/calculator/index.html": appHtml("Calculator", "./main.js"),
    "features/calculator/main.js": `document.body.dataset.app = "calculator";`,
  });

  const outputDirectory = await buildProject(project, {
    pluginOptions: { appsDirectory: "features" },
  });

  assert.deepEqual(await listFiles(outputDirectory), ["calculator.html"]);
});

test("produces deterministic outputs when source creation order changes", async () => {
  const firstProject = await createProject({
    "src/mcp-apps/zeta/index.html": appHtml("Zeta", "./main.js"),
    "src/mcp-apps/zeta/main.js": `document.body.dataset.app = "zeta";`,
    "src/mcp-apps/alpha/index.html": appHtml("Alpha", "./main.js"),
    "src/mcp-apps/alpha/main.js": `document.body.dataset.app = "alpha";`,
  });
  const secondProject = await createProject({
    "src/mcp-apps/alpha/main.js": `document.body.dataset.app = "alpha";`,
    "src/mcp-apps/alpha/index.html": appHtml("Alpha", "./main.js"),
    "src/mcp-apps/zeta/main.js": `document.body.dataset.app = "zeta";`,
    "src/mcp-apps/zeta/index.html": appHtml("Zeta", "./main.js"),
  });

  const [firstOutput, secondOutput] = await Promise.all([
    buildProject(firstProject),
    buildProject(secondProject),
  ]);

  assert.deepEqual(await snapshotDirectory(firstOutput), await snapshotDirectory(secondOutput));
});

test("rejects a missing apps directory", async () => {
  const project = await createProject({});

  await assert.rejects(buildProject(project), /directory does not exist or is not a directory/u);
});

test("rejects an apps directory without entries", async () => {
  const project = await createProject({
    "src/mcp-apps/readme.html": "<p>No apps here</p>",
  });

  await assert.rejects(buildProject(project), /contains no app entries/u);
});

test("rejects a root-level index.html", async () => {
  const project = await createProject({
    "src/mcp-apps/index.html": appHtml("Unnamed", "./main.js"),
    "src/mcp-apps/main.js": `document.body.dataset.app = "unnamed";`,
  });

  await assert.rejects(buildProject(project), /Root-level index\.html is not an MCP app entry/u);
});

test("rejects an appsDirectory that escapes the Vite root", async () => {
  const project = await createProject({});

  await assert.rejects(
    buildProject(project, { pluginOptions: { appsDirectory: "../outside" } }),
    /must remain inside the Vite project root/u,
  );
});

test("rejects an absolute appsDirectory", async () => {
  const project = await createProject({});

  await assert.rejects(
    buildProject(project, { pluginOptions: { appsDirectory: path.join(project, "apps") } }),
    /appsDirectory must be project-relative/u,
  );
});

test("rejects case-folded output collisions on case-sensitive filesystems", async (context) => {
  const project = await createProject({
    "src/mcp-apps/Foo/index.html": appHtml("Upper", "./main.js"),
    "src/mcp-apps/Foo/main.js": `document.body.dataset.app = "upper";`,
  });
  const lowerDirectory = path.join(project, "src/mcp-apps/foo");

  try {
    await mkdir(lowerDirectory);
  } catch (error) {
    if (error?.code === "EEXIST") {
      context.skip("The test filesystem is case-insensitive.");
      return;
    }

    throw error;
  }

  await Promise.all([
    writeFile(path.join(lowerDirectory, "index.html"), appHtml("Lower", "./main.js")),
    writeFile(path.join(lowerDirectory, "main.js"), `document.body.dataset.app = "lower";`),
  ]);

  await assert.rejects(buildProject(project), /output collision/u);
});

test("fails when another plugin leaves a residual bundle asset", async () => {
  const project = await createProject({
    "src/mcp-apps/weather/index.html": appHtml("Weather", "./main.js"),
    "src/mcp-apps/weather/main.js": `document.body.dataset.app = "weather";`,
  });
  const residualPlugin = {
    name: "test:residual-asset",
    generateBundle() {
      this.emitFile({
        fileName: "residual.txt",
        source: "must not remain",
        type: "asset",
      });
    },
  };

  await assert.rejects(
    buildProject(project, { plugins: [residualPlugin] }),
    /Residual bundle assets: residual\.txt/u,
  );
});

test("fails when generated scripts are removed without being inlined", async () => {
  const project = await createProject({
    "src/mcp-apps/weather/index.html": appHtml("Weather", "./main.js"),
    "src/mcp-apps/weather/main.js": `document.body.dataset.app = "weather";`,
  });
  const incompatibleHtmlPlugin = {
    name: "test:incompatible-html",
    enforce: "post",
    generateBundle(_outputOptions, bundle) {
      for (const entry of Object.values(bundle)) {
        if (entry.type === "asset" && entry.fileName.endsWith(".html")) {
          entry.source = entry.source.replace(/\ssrc="([^"]+)"/u, " src='$1'");
        }
      }
    },
  };

  await assert.rejects(
    buildProject(project, { plugins: [incompatibleHtmlPlugin] }),
    /Unresolved local scripts or styles: script src=/u,
  );
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

test("builds the same configuration through vp build", async () => {
  const project = await createProject({
    "src/mcp-apps/weather/index.html": appHtml("Weather", "./main.js"),
    "src/mcp-apps/weather/main.js": `document.body.dataset.app = "vp-weather";`,
  });
  const pluginModule = pathToFileURL(
    fileURLToPath(new URL("../dist/index.mjs", import.meta.url)),
  ).href;
  const vitePlusModule = import.meta.resolve("vite-plus");
  const configFile = path.join(project, "vite.config.mjs");

  await writeFile(
    configFile,
    `
      import { defineConfig } from ${JSON.stringify(vitePlusModule)};
      import { mcpApps } from ${JSON.stringify(pluginModule)};

      export default defineConfig({
        plugins: [mcpApps()],
      });
    `,
  );

  const vp = fileURLToPath(new URL("../../../node_modules/.bin/vp", import.meta.url));
  const result = await run(vp, ["build", project, "--config", configFile]);

  assert.equal(result.code, 0, result.stderr || result.stdout);
  assert.deepEqual(await listFiles(path.join(project, "dist")), ["weather.html"]);
  assert.match(await readFile(path.join(project, "dist/weather.html"), "utf8"), /vp-weather/u);
});

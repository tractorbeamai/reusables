import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { appHtml, buildProject, cleanupProjects, createProject, listFiles } from "./helpers.js";

afterEach(cleanupProjects);

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
    /Unresolved local resources: script src=/u,
  );
});

test("fails when public HTML assets remain local references", async () => {
  const project = await createProject({
    "public/logo.svg": `<svg xmlns="http://www.w3.org/2000/svg"></svg>`,
    "src/mcp-apps/weather/index.html": `
      <!doctype html>
      <html>
        <body>
          <img alt="" src="/logo.svg" />
          <script type="module" src="./main.js"></script>
        </body>
      </html>
    `,
    "src/mcp-apps/weather/main.js": `document.body.dataset.app = "weather";`,
  });

  await assert.rejects(
    buildProject(project),
    /Unresolved local resources: img src="[^"]*logo\.svg"/u,
  );
});

test("fails when public assets remain in inline CSS", async () => {
  const project = await createProject({
    "public/background.svg": `<svg xmlns="http://www.w3.org/2000/svg"></svg>`,
    "src/mcp-apps/weather/index.html": appHtml("Weather", "./main.js"),
    "src/mcp-apps/weather/main.js": `
      import "./styles.css";
      document.body.dataset.app = "weather";
    `,
    "src/mcp-apps/weather/styles.css": `
      body { background-image: url("/background.svg"); }
    `,
  });

  await assert.rejects(
    buildProject(project),
    /Unresolved local resources: style url="[^"]*background\.svg"/u,
  );
});

test("honors additional HTML asset sources during single-file validation", async () => {
  const project = await createProject({
    "public/custom.svg": `<svg xmlns="http://www.w3.org/2000/svg"></svg>`,
    "src/mcp-apps/weather/index.html": `
      <!doctype html>
      <html>
        <body>
          <app-image data-src="/custom.svg"></app-image>
          <script type="module" src="./main.js"></script>
        </body>
      </html>
    `,
    "src/mcp-apps/weather/main.js": `document.body.dataset.app = "weather";`,
  });

  await assert.rejects(
    buildProject(project, {
      config: {
        html: {
          additionalAssetSources: {
            "app-image": {
              srcAttributes: ["data-src"],
            },
          },
        },
      },
    }),
    /Unresolved local resources: app-image data-src="[^"]*custom\.svg"/u,
  );
});

test("allows external resources, data URLs, and same-document fragments", async () => {
  const project = await createProject({
    "src/mcp-apps/weather/index.html": `
      <!doctype html>
      <html>
        <head>
          <link rel="stylesheet" href="//cdn.example.com/app.css" />
          <style>
            /* url("./comment-only.svg") */
            body::before { content: "url('./text-only.svg')"; }
          </style>
        </head>
        <body>
          <img alt="" src="data:image/svg+xml,%3Csvg%3E%3C/svg%3E" />
          <svg><use href="#weather-icon"></use></svg>
          <script src="https://cdn.example.com/app.js"></script>
          <script type="module" src="./main.js"></script>
        </body>
      </html>
    `,
    "src/mcp-apps/weather/main.js": `document.body.dataset.app = "weather";`,
  });

  const outputDirectory = await buildProject(project);

  assert.deepEqual(await listFiles(outputDirectory), ["weather.html"]);
});

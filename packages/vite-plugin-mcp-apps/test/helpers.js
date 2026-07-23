import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createBuilder } from "vite";

import { mcpApps } from "../dist/index.mjs";

const temporaryDirectories = [];

export function appHtml(title, source) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
      </head>
      <body>
        <main id="app"></main>
        <script type="module" src="${source}"></script>
      </body>
    </html>
  `;
}

export async function buildProject(root, { config = {}, pluginOptions, plugins = [] } = {}) {
  const outputDirectory = path.join(root, "dist");
  const builder = await createBuilder({
    ...config,
    build: {
      outDir: outputDirectory,
      ...config.build,
    },
    configFile: false,
    logLevel: "silent",
    plugins: [...plugins, mcpApps(pluginOptions)],
    root,
  });

  await builder.buildApp();

  return outputDirectory;
}

export async function cleanupProjects() {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true })),
  );
}

export async function createProject(files) {
  const root = await mkdtemp(path.join(tmpdir(), "vite-plugin-mcp-apps-"));
  temporaryDirectories.push(root);

  await Promise.all(
    Object.entries(files).map(async ([relativePath, contents]) => {
      const absolutePath = path.join(root, relativePath);
      await mkdir(path.dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, contents);
    }),
  );

  return root;
}

export async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const relativePath = path.posix.join(prefix, entry.name);

      if (entry.isDirectory()) {
        return listFiles(path.join(directory, entry.name), relativePath);
      }

      return Promise.resolve([relativePath]);
    }),
  );

  return nestedFiles.flat().sort((left, right) => left.localeCompare(right, "en"));
}

export function run(command, arguments_) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    let stdout = "";

    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => {
      resolve({ code, stderr, stdout });
    });
  });
}

export async function snapshotDirectory(directory) {
  const files = await listFiles(directory);

  return Promise.all(
    files.map(async (file) => [file, await readFile(path.join(directory, file), "utf8")]),
  );
}

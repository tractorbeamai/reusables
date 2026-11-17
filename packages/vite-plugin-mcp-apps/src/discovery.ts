import { lstat, realpath, stat } from "node:fs/promises";
import path from "node:path";

import { glob } from "tinyglobby";
import { normalizePath } from "vite";

const DEFAULT_APPS_DIRECTORY = "src/mcp-apps";

export interface DiscoveredApp {
  environmentName: string;
  id: string;
  input: string;
  output: string;
}

export async function discoverApps(
  root: string,
  appsDirectory = DEFAULT_APPS_DIRECTORY,
): Promise<DiscoveredApp[]> {
  if (path.isAbsolute(appsDirectory)) {
    throw new Error(`appsDirectory must be project-relative: ${appsDirectory}`);
  }

  const projectRoot = path.resolve(root);
  const directory = path.resolve(projectRoot, appsDirectory);

  assertWithinRoot(projectRoot, directory, "appsDirectory");

  const directoryStats = await stat(directory).catch(() => undefined);

  if (!directoryStats?.isDirectory()) {
    throw new Error(`MCP Apps directory does not exist or is not a directory: ${directory}`);
  }

  const [realProjectRoot, realDirectory] = await Promise.all([
    realpath(projectRoot),
    realpath(directory),
  ]);

  assertWithinRoot(realProjectRoot, realDirectory, "resolved appsDirectory");

  const entries = await glob("**/index.html", {
    absolute: false,
    cwd: directory,
    dot: false,
    followSymbolicLinks: false,
    onlyFiles: true,
  });

  const normalizedEntries = (
    await Promise.all(
      entries.map(async (entry) => {
        const input = path.resolve(directory, entry);
        const entryStats = await lstat(input);

        return entryStats.isSymbolicLink() ? undefined : input;
      }),
    )
  )
    .filter((entry): entry is string => entry !== undefined)
    .sort((left, right) => normalizePath(left).localeCompare(normalizePath(right), "en"));

  if (normalizedEntries.length === 0) {
    throw new Error(`MCP Apps directory contains no app entries: ${directory}`);
  }

  const apps = normalizedEntries.map((input, index) => {
    assertWithinRoot(directory, input, "MCP app entry");

    const relativeInput = normalizePath(path.relative(directory, input));

    if (relativeInput === "index.html") {
      throw new Error(
        `Root-level index.html is not an MCP app entry. Move it into a named directory under ${directory}.`,
      );
    }

    const id = path.posix.dirname(relativeInput);

    return {
      environmentName: `mcp_apps_${index}`,
      id,
      input,
      output: `${id}.html`,
    };
  });

  assertUniqueOutputs(apps);

  return apps;
}

export async function resolveApps(
  root: string,
  entries: Readonly<Record<string, string>>,
): Promise<DiscoveredApp[]> {
  const ids = Object.keys(entries).sort((left, right) => left.localeCompare(right, "en"));

  if (ids.length === 0) {
    throw new Error("apps must name at least one MCP app.");
  }

  const projectRoot = path.resolve(root);
  const realProjectRoot = await realpath(projectRoot);

  const apps = await Promise.all(
    ids.map(async (id, index) => {
      assertAppId(id);

      const entry = entries[id];

      if (path.isAbsolute(entry)) {
        throw new Error(`MCP app "${id}" entry must be project-relative: ${entry}`);
      }

      if (path.extname(entry) !== ".html") {
        throw new Error(`MCP app "${id}" entry must be an HTML file: ${entry}`);
      }

      const input = path.resolve(projectRoot, entry);

      assertWithinRoot(projectRoot, input, `MCP app "${id}" entry`);

      const entryStats = await stat(input).catch(() => undefined);

      if (!entryStats?.isFile()) {
        throw new Error(`MCP app "${id}" entry does not exist or is not a file: ${input}`);
      }

      assertWithinRoot(realProjectRoot, await realpath(input), `resolved MCP app "${id}" entry`);

      return {
        environmentName: `mcp_apps_${index}`,
        id,
        input,
        output: `${id}.html`,
      };
    }),
  );

  assertUniqueOutputs(apps);

  return apps;
}

function assertAppId(id: string): void {
  const segments = id.split("/");

  if (
    segments.some((segment) => segment === "" || segment === "." || segment === "..") ||
    id.includes("\\")
  ) {
    throw new Error(
      `MCP app ID must be a relative path of non-empty "/"-separated names without "." or "..": "${id}"`,
    );
  }
}

function assertUniqueOutputs(apps: DiscoveredApp[]): void {
  const outputOwners = new Map<string, DiscoveredApp>();

  for (const app of apps) {
    const key = app.output.toLocaleLowerCase("en-US");
    const owner = outputOwners.get(key);

    if (owner !== undefined) {
      throw new Error(
        `MCP app output collision: "${owner.id}" and "${app.id}" both map to "${app.output}" on case-insensitive filesystems.`,
      );
    }

    outputOwners.set(key, app);
  }
}

function assertWithinRoot(root: string, candidate: string, label: string): void {
  const relative = path.relative(root, candidate);

  if (relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== "..")) {
    return;
  }

  throw new Error(`${label} must remain inside the Vite project root: ${candidate}`);
}

import type { Rolldown } from "vite";

import type { DiscoveredApp } from "./discovery.js";

const LINK_TAG_PATTERN = /<link\b[^>]*>/giu;
const SCRIPT_TAG_PATTERN = /<script\b[^>]*>[\s\S]*?<\/script\s*>/giu;

export function inlineBundle(bundle: Rolldown.OutputBundle, app: DiscoveredApp): void {
  const htmlAssets = Object.values(bundle).filter(
    (entry): entry is Rolldown.OutputAsset =>
      entry.type === "asset" && entry.fileName.endsWith(".html"),
  );

  if (htmlAssets.length !== 1) {
    throw new Error(
      `MCP app "${app.id}" must produce exactly one HTML asset; received ${htmlAssets.length}.`,
    );
  }

  const htmlAsset = htmlAssets[0];
  let html = toText(htmlAsset.source);
  const inlinedBundleKeys = new Set<string>();

  for (const [bundleKey, entry] of Object.entries(bundle)) {
    if (entry.type === "chunk") {
      const result = inlineScript(html, entry);

      if (result.inlined) {
        html = result.html;
        inlinedBundleKeys.add(bundleKey);
        delete bundle[bundleKey];
      }

      continue;
    }

    if (entry !== htmlAsset && entry.fileName.endsWith(".css")) {
      const result = inlineStyle(html, entry);

      if (result.inlined) {
        html = result.html;
        inlinedBundleKeys.add(bundleKey);
        delete bundle[bundleKey];
      }
    }
  }

  htmlAsset.source = html;

  const htmlBundleKey = Object.entries(bundle).find(([, entry]) => entry === htmlAsset)?.[0];

  if (htmlBundleKey === undefined) {
    throw new Error(`MCP app "${app.id}" HTML asset disappeared while inlining its bundle.`);
  }

  const residualAssets = Object.entries(bundle)
    .filter(([bundleKey, entry]) => entry !== htmlAsset && !inlinedBundleKeys.has(bundleKey))
    .map(([, entry]) => entry.fileName)
    .sort((left, right) => left.localeCompare(right, "en"));

  if (residualAssets.length > 0) {
    throw new Error(
      `MCP app "${app.id}" could not be reduced to one HTML file. Residual bundle assets: ${residualAssets.join(", ")}.`,
    );
  }

  htmlAsset.fileName = app.output;
}

function inlineScript(
  html: string,
  chunk: Rolldown.OutputChunk,
): { html: string; inlined: boolean } {
  const tags = html
    .match(SCRIPT_TAG_PATTERN)
    ?.filter((tag) => referencesFile(attributeValue(tag, "src") ?? "", chunk.fileName));

  if (tags === undefined || tags.length === 0) {
    return { html, inlined: false };
  }

  let nextHtml = html;

  for (const tag of tags) {
    const attributes = withoutAttributes(openingTag(tag), ["crossorigin", "src"]);
    nextHtml = nextHtml.replace(tag, `${attributes}>${escapeScript(chunk.code)}</script>`);
  }

  return { html: nextHtml, inlined: true };
}

function inlineStyle(
  html: string,
  asset: Rolldown.OutputAsset,
): { html: string; inlined: boolean } {
  const css = escapeStyle(toText(asset.source).replace(/^@charset\s+["'][^"']+["'];?\s*/iu, ""));
  const tags = html.match(LINK_TAG_PATTERN)?.filter((tag) => {
    const relation = attributeValue(tag, "rel");

    return (
      relation?.toLocaleLowerCase("en-US") === "stylesheet" &&
      referencesFile(attributeValue(tag, "href") ?? "", asset.fileName)
    );
  });

  if (tags === undefined || tags.length === 0) {
    return { html, inlined: false };
  }

  let nextHtml = html;

  for (const tag of tags) {
    const styleTag = tag.slice(0, -1).replace(/^<link\b/iu, "<style");
    const attributes = withoutAttributes(styleTag, ["crossorigin", "href", "rel"]);
    nextHtml = nextHtml.replace(tag, `${attributes}>${css}</style>`);
  }

  return { html: nextHtml, inlined: true };
}

function attributeValue(tag: string, name: string): string | undefined {
  const match = tag.match(
    new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "iu"),
  );

  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function escapeScript(source: string): string {
  return source.replaceAll("<!--", "\\x3C!--").replace(/<\/script/giu, "\\x3C/script");
}

function escapeStyle(source: string): string {
  return source.replace(/<\/style/giu, "\\3C /style");
}

function openingTag(tag: string): string {
  const end = tag.indexOf(">");

  if (end === -1) {
    return tag;
  }

  return tag.slice(0, end);
}

function referencesFile(url: string, fileName: string): boolean {
  const pathName = url.split(/[?#]/u, 1)[0]?.replace(/\\/gu, "/");
  const normalizedFileName = fileName.replace(/\\/gu, "/");

  return pathName === normalizedFileName || pathName?.endsWith(`/${normalizedFileName}`) === true;
}

function toText(source: string | Uint8Array): string {
  return typeof source === "string" ? source : new TextDecoder().decode(source);
}

function withoutAttributes(tag: string, names: string[]): string {
  let result = tag;

  for (const name of names) {
    result = result.replace(
      new RegExp(`\\s${name}(?:\\s*=\\s*(?:"[^"]*"|'[^']*'|[^\\s>]+))?`, "giu"),
      "",
    );
  }

  return result.replace(/\s*\/$/u, "");
}

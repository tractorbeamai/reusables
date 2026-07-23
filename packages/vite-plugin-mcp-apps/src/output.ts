import type { Rolldown } from "vite";

import type { DiscoveredApp } from "./discovery.js";

const LINK_TAG_PATTERN = /<link\b[^>]*>/giu;
const SCRIPT_TAG_PATTERN = /<script\b[^>]*>/giu;
const URL_SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:/iu;

export function finalizeBundle(bundle: Rolldown.OutputBundle, app: DiscoveredApp): void {
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
  const residualAssets = Object.values(bundle)
    .filter((entry) => entry !== htmlAsset)
    .map((entry) => entry.fileName)
    .sort((left, right) => left.localeCompare(right, "en"));

  if (residualAssets.length > 0) {
    throw new Error(
      `MCP app "${app.id}" could not be reduced to one HTML file. Residual bundle assets: ${residualAssets.join(", ")}.`,
    );
  }

  const unresolvedReferences = findUnresolvedReferences(toText(htmlAsset.source));

  if (unresolvedReferences.length > 0) {
    throw new Error(
      `MCP app "${app.id}" could not be reduced to one HTML file. Unresolved local scripts or styles: ${unresolvedReferences.join(", ")}.`,
    );
  }

  htmlAsset.fileName = app.output;
}

function findUnresolvedReferences(html: string): string[] {
  const references: string[] = [];

  for (const tag of html.match(SCRIPT_TAG_PATTERN) ?? []) {
    const source = attributeValue(tag, "src");

    if (source !== undefined && isLocalReference(source)) {
      references.push(`script src="${source}"`);
    }
  }

  for (const tag of html.match(LINK_TAG_PATTERN) ?? []) {
    const relation = attributeValue(tag, "rel");
    const href = attributeValue(tag, "href");

    if (
      relation?.toLocaleLowerCase("en-US").split(/\s+/u).includes("stylesheet") === true &&
      href !== undefined &&
      isLocalReference(href)
    ) {
      references.push(`stylesheet href="${href}"`);
    }
  }

  return references.sort((left, right) => left.localeCompare(right, "en"));
}

function attributeValue(tag: string, name: string): string | undefined {
  const match = tag.match(
    new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "iu"),
  );

  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function isLocalReference(reference: string): boolean {
  const normalized = reference.trim();

  return (
    normalized.length > 0 && !normalized.startsWith("//") && !URL_SCHEME_PATTERN.test(normalized)
  );
}

function toText(source: string | Uint8Array): string {
  return typeof source === "string" ? source : new TextDecoder().decode(source);
}

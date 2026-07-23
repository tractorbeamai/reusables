import { parse, type DefaultTreeAdapterTypes } from "parse5";
import { parse as parseCss } from "postcss";
import valueParser from "postcss-value-parser";
import type { HtmlAssetSource } from "vite";

const ALLOWED_META_NAMES = new Set([
  "msapplication-config",
  "msapplication-square150x150logo",
  "msapplication-square310x310logo",
  "msapplication-square70x70logo",
  "msapplication-tileimage",
  "msapplication-wide310x150logo",
  "twitter:image",
]);
const ALLOWED_META_PROPERTIES = new Set([
  "og:audio",
  "og:audio:secure_url",
  "og:image",
  "og:image:secure_url",
  "og:image:url",
  "og:video",
  "og:video:secure_url",
]);
const IMAGE_CANDIDATE_PATTERN =
  /(?:^|\s|(?<=,))(?<url>[\w-]+\([^)]*\)|"[^"]*"|'[^']*'|[^,]\S*[^,])\s*(?:\s(?<descriptor>\w[^,]+))?(?:,|$)/gu;
const STANDARD_ASSET_SOURCES: Readonly<Record<string, HtmlAssetSource>> = {
  audio: { srcAttributes: ["src"] },
  embed: { srcAttributes: ["src"] },
  iframe: { srcAttributes: ["src"] },
  img: {
    srcAttributes: ["src"],
    srcsetAttributes: ["srcset"],
  },
  image: { srcAttributes: ["href", "xlink:href"] },
  input: { srcAttributes: ["src"] },
  link: {
    srcAttributes: ["href"],
    srcsetAttributes: ["imagesrcset"],
  },
  meta: {
    srcAttributes: ["content"],
    filter({ attributes }) {
      const name = attributes.name?.trim().toLocaleLowerCase("en-US");
      const property = attributes.property?.trim().toLocaleLowerCase("en-US");

      return (
        (name !== undefined && ALLOWED_META_NAMES.has(name)) ||
        (property !== undefined && ALLOWED_META_PROPERTIES.has(property))
      );
    },
  },
  object: { srcAttributes: ["data"] },
  script: { srcAttributes: ["src"] },
  source: {
    srcAttributes: ["src"],
    srcsetAttributes: ["srcset"],
  },
  track: { srcAttributes: ["src"] },
  use: { srcAttributes: ["href", "xlink:href"] },
  video: { srcAttributes: ["poster", "src"] },
};
const URL_SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:/iu;

export function findUnresolvedReferences(
  html: string,
  additionalAssetSources?: Readonly<Record<string, HtmlAssetSource>>,
): string[] {
  const references = new Set<string>();

  visitNode(parse(html), (element) => {
    const attributes = Object.fromEntries(
      element.attrs.map((attribute) => [attributeKey(attribute), attribute.value]),
    );
    const sources = [
      STANDARD_ASSET_SOURCES[element.tagName],
      additionalAssetSources?.[element.tagName],
    ];

    for (const source of sources) {
      if (source === undefined) {
        continue;
      }

      for (const key of source.srcAttributes ?? []) {
        addAttributeReference(references, element.tagName, key, attributes, source);
      }

      for (const key of source.srcsetAttributes ?? []) {
        const value = attributes[key];

        if (value === undefined || !passesFilter(source, key, value, attributes)) {
          continue;
        }

        for (const reference of parseSrcset(value)) {
          addReference(references, `${element.tagName} ${key}`, reference);
        }
      }
    }

    const inlineStyle = attributes.style;

    if (inlineStyle !== undefined) {
      addCssReferences(references, `${element.tagName} style`, inlineStyle, true);
    }

    if (element.tagName === "style") {
      addCssReferences(references, "style", textContent(element));
    }
  });

  return [...references].sort((left, right) => left.localeCompare(right, "en"));
}

function visitNode(
  node: DefaultTreeAdapterTypes.Node,
  visit: (element: DefaultTreeAdapterTypes.Element) => void,
): void {
  if ("tagName" in node) {
    visit(node);

    if (isTemplate(node)) {
      visitNode(node.content, visit);
    }
  }

  if ("childNodes" in node) {
    for (const child of node.childNodes) {
      visitNode(child, visit);
    }
  }
}

function isTemplate(
  element: DefaultTreeAdapterTypes.Element,
): element is DefaultTreeAdapterTypes.Template {
  return element.tagName === "template" && "content" in element;
}

function attributeKey(attribute: DefaultTreeAdapterTypes.Element["attrs"][number]): string {
  return attribute.prefix === undefined ? attribute.name : `${attribute.prefix}:${attribute.name}`;
}

function addAttributeReference(
  references: Set<string>,
  tagName: string,
  key: string,
  attributes: Record<string, string>,
  source: HtmlAssetSource,
): void {
  const value = attributes[key];

  if (value !== undefined && passesFilter(source, key, value, attributes)) {
    addReference(references, `${tagName} ${key}`, value);
  }
}

function passesFilter(
  source: HtmlAssetSource,
  key: string,
  value: string,
  attributes: Record<string, string>,
): boolean {
  return source.filter?.({ attributes, key, value }) ?? true;
}

function parseSrcset(value: string): string[] {
  const normalized = value
    .trim()
    .replace(/(?: |\\t|\\n|\\f|\\r)+/gu, " ")
    .replace(/\r?\n/u, "")
    .replace(/,\s+/u, ", ")
    .replaceAll(/\s+/gu, " ");

  return [...normalized.matchAll(IMAGE_CANDIDATE_PATTERN)]
    .map((match) => stripQuotes(match.groups?.url?.trim() ?? ""))
    .filter((reference) => reference.length > 0);
}

function stripQuotes(value: string): string {
  const first = value.at(0);
  const last = value.at(-1);

  return value.length >= 2 && first === last && (first === '"' || first === "'")
    ? value.slice(1, -1)
    : value;
}

function textContent(element: DefaultTreeAdapterTypes.Element): string {
  return element.childNodes
    .filter((child): child is DefaultTreeAdapterTypes.TextNode => child.nodeName === "#text")
    .map((child) => child.value)
    .join("");
}

function addCssReferences(
  references: Set<string>,
  context: string,
  css: string,
  declarationsOnly = false,
): void {
  const root = parseCss(declarationsOnly ? `mcp-app{${css}}` : css);

  root.walkDecls((declaration) => {
    addCssValueReferences(references, context, declaration.value);
  });
  root.walkAtRules(/^import$/iu, (atRule) => {
    const parsed = valueParser(atRule.params);
    const firstValue = parsed.nodes.find(
      (node) => node.type !== "comment" && node.type !== "space",
    );

    if (firstValue?.type === "string") {
      addReference(references, `${context} @import`, firstValue.value);
    } else {
      addCssValueReferences(references, `${context} @import`, atRule.params);
    }
  });
}

function addCssValueReferences(references: Set<string>, context: string, value: string): void {
  valueParser(value).walk((node) => {
    if (node.type !== "function") {
      return;
    }

    const functionName = node.value.toLocaleLowerCase("en-US");

    if (functionName === "url") {
      addReference(
        references,
        `${context} url`,
        stripQuotes(valueParser.stringify(node.nodes).trim()),
      );
      return false;
    }

    if (functionName === "image-set" || functionName === "-webkit-image-set") {
      for (const candidate of imageSetStrings(node.nodes)) {
        addReference(references, `${context} ${functionName}`, candidate);
      }
    }
  });
}

function imageSetStrings(nodes: valueParser.Node[]): string[] {
  const candidates: string[] = [];
  let atCandidateStart = true;

  for (const node of nodes) {
    if (node.type === "div" && node.value === ",") {
      atCandidateStart = true;
    } else if (node.type !== "comment" && node.type !== "space") {
      if (atCandidateStart && node.type === "string") {
        candidates.push(node.value);
      }

      atCandidateStart = false;
    }
  }

  return candidates;
}

function addReference(references: Set<string>, context: string, reference: string): void {
  const normalized = reference.trim();

  if (isLocalReference(normalized)) {
    references.add(`${context}="${normalized}"`);
  }
}

function isLocalReference(reference: string): boolean {
  const normalized = reference.trim();

  return (
    normalized.length > 0 &&
    !normalized.startsWith("#") &&
    !normalized.startsWith("//") &&
    !URL_SCHEME_PATTERN.test(normalized)
  );
}

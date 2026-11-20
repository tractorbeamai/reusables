import qualityPlugin from "@tractorbeam/oxlint-config/quality";
import { RuleTester } from "oxlint/plugins-dev";

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });

// The vendored rules' upstream cases, at the vendored revision; each block scopes its own `error`.

{
  const error = { messageId: "runtimeTypeof" };
  const allowInTypeGuards = [{ allowInTypeGuards: true }];

  tester.run("quality/no-runtime-typeof", qualityPlugin.rules["no-runtime-typeof"], {
    valid: [
      'const isServer = typeof document === "undefined";',
      'const hasStorage = typeof localStorage !== "undefined";',
      'if (typeof globalThis.crypto === "undefined") throw new Error("no crypto");',
      'const missing = "undefined" === typeof process;',
      "const value = input;",
      {
        code: 'function isString(value: unknown): value is string { return typeof value === "string"; }',
        options: allowInTypeGuards,
      },
      {
        code: 'const isString = (value: unknown): value is string => typeof value === "string";',
        options: allowInTypeGuards,
      },
      {
        code: 'function assertString(value: unknown): asserts value is string { if (typeof value !== "string") throw new Error(); }',
        options: allowInTypeGuards,
      },
    ],
    invalid: [
      { code: 'if (typeof input === "string") use(input);', errors: [error] },
      { code: "if (typeof input === undefined) use(input);", errors: [error] },
      {
        code: 'function isString(value: unknown): value is string { return typeof value === "string"; }',
        errors: [error],
      },
      {
        code: 'function parse(value: unknown): string { if (typeof value !== "string") throw new Error(); return value; }',
        options: allowInTypeGuards,
        errors: [error],
      },
      {
        code: 'function isString(value: unknown): value is string { const check = () => typeof value === "string"; return check(); }',
        options: allowInTypeGuards,
        errors: [error],
      },
    ],
  });
}

{
  const error = { messageId: "forbiddenSymbolName" };

  tester.run("quality/no-shape-in-symbol-names", qualityPlugin.rules["no-shape-in-symbol-names"], {
    valid: [
      "declare const schema: ExternalSchema; const field = schema.shape.id;",
      "declare const outer: External; const value = outer.inner.shape;",
      "declare const schema: ExternalSchema; schema.shape.id.parse('x');",
      "const owner = { id: 1 }; const value = owner.id;",
    ],
    invalid: [
      { code: "const shape = 1;", errors: [error] },
      { code: "function shapeOf() {}", errors: [error] },
      { code: "type PayloadShape = { id: string };", errors: [error] },
      { code: "type Payload = { shape: string };", errors: [error] },
      {
        code: "declare const owner: External; const shape = 'field'; const value = owner[shape];",
        errors: 2,
      },
    ],
  });
}

{
  const error = { messageId: "unknownParameter" };

  tester.run("quality/no-unknown-parameters", qualityPlugin.rules["no-unknown-parameters"], {
    valid: [
      "function enrich(cause: unknown): void {}",
      "function enrich(cause: Error | unknown): void {}",
      "function isString(value: unknown): value is string { return true; }",
      "const isString = (value: unknown): value is string => true;",
      "function assertString(value: unknown): asserts value is string {}",
      "type Guard = (value: unknown) => value is string;",
      "declare function isString(value: unknown): value is string;",
      "type Guards = { isString(value: unknown): value is string };",
      "function parse(value: string | number): void {}",
    ],
    invalid: [
      { code: "function parse(value: unknown): void {}", errors: [error] },
      { code: "function parse(value: string | unknown): void {}", errors: [error] },
      {
        code: "function parse(value: string | (number | unknown)): void {}",
        errors: [error],
      },
      {
        code: "function isString(value: unknown, context: unknown): value is string { return true; }",
        errors: [{ ...error, data: { parameter: "context" } }],
      },
      {
        code: "export function parse({ value }: unknown = {}): void {}",
        errors: [{ ...error, data: { parameter: "{ value }" } }],
      },
    ],
  });
}

import { createRequire } from "node:module";

import type {
  DummyRule,
  DummyRuleMap,
  ExternalPluginEntry,
  OxlintConfig,
  OxlintOverride,
} from "vite-plus/lint";

/** A rule map keyed by any rule name, so declarations name no rule's options type. */
type RuleMap = Record<string, DummyRule>;

export interface EffectOptions {
  /**
   * Globs for code on another platform's terms, such as React components, a
   * published SDK's plain-TypeScript API, or tool configuration. The
   * effect-native preset's rules are off there, except the `*-in-effect`
   * rules, since a native API inside Effect code is wrong anywhere.
   */
  except?: string[];
}

interface Preset {
  plugins: NonNullable<OxlintConfig["plugins"]>;
  rules: RuleMap;
}

// `@effect/tsgo` and `oxlint-plugin-effect` are optional peers, so the presets
// load only when the `effect` option asks for them, from the version the
// project installs.
const require = createRequire(import.meta.url);

function loadPreset(name: string): Preset {
  return require(`@effect/tsgo/oxlint-presets/${name}.json`) as Preset;
}

function asErrors(rules: RuleMap): RuleMap {
  return Object.fromEntries(Object.keys(rules).map((rule) => [rule, "error"]));
}

/**
 * The built-in plugins the presets' rules need, which the Effect-patched
 * type-aware linter provides.
 */
export function effectPlugins() {
  return loadPreset("strict").plugins;
}

export const effectPlugin: ExternalPluginEntry = {
  name: "effect",
  specifier: "oxlint-plugin-effect/plugin",
};

/**
 * Exceptions to the shared rules that exist only because of Effect's idioms.
 */
const effectIdiomRules = {
  // A schema and its type share a name.
  "eslint/no-redeclare": "off",
  // `.pipe(NodeRuntime.runMain)` runs a program; it is not a promise to await.
  "unicorn/prefer-top-level-await": "off",
  // `throw-new-error` would add `new` to Effect's constructors, such as
  // `Schema.TaggedError<…>()(…)`, and `no-unnecessary-type-arguments` drops
  // arguments, such as `Redacted<string>`'s, that change the type.
  "typescript/no-unnecessary-type-arguments": "off",
  "unicorn/throw-new-error": "off",
  // Effect's combinators, such as `Effect.filter(items, f)`, read as array
  // methods given a `this`; spreading into a mapped copy is the immutable
  // update Effect code writes; and they take function references, such as
  // `Effect.map(Hex.encode)`.
  "oxc/no-map-spread": "off",
  "unicorn/no-array-callback-reference": "off",
  "unicorn/no-array-method-this-argument": "off",
  // Effect's `_tag`.
  "eslint/no-underscore-dangle": ["error", { allow: ["_tag"] }],
  // Effect's modules are imported as namespaces.
  "import/no-namespace": "off",
} satisfies DummyRuleMap;

/**
 * Rules of `@effect/tsgo`'s presets that are off.
 */
const effectTsgoOffRules = {
  // TypeScript's own narrowing covers optional values in conditions.
  "effecttsgo/strict-boolean-expressions": "off",
  // A data-last overload is for a library's pipeline API, and most exported
  // functions take every argument at once.
  "effecttsgo/missing-pipeable-signature": "off",
  // Effect's unstable modules, such as HttpApi, HttpRouter, effect/cli, and
  // RPC, are fair to use.
  "effecttsgo/unstable-api-usage": "off",
  // Native Array, Object, and String methods are house style; effect/Array,
  // effect/Record, and effect/String are for what the native methods lack.
  // effect/String's functions also take their string last, so each native
  // call would become a pipe.
  "effecttsgo/prefer-effect-array": "off",
  "effecttsgo/prefer-effect-record": "off",
  "effecttsgo/prefer-effect-string": "off",
} satisfies DummyRuleMap;

const effectNativeCompanionRules = {
  // This rule mistakes effect/Array's `Arr.sort`, which copies, for
  // `Array#sort`.
  "unicorn/no-array-sort": "off",
} satisfies DummyRuleMap;

/**
 * The rules of oxlint-plugin-effect that hold Effect's conventions; the rest
 * of its preset is off.
 */
const effectPluginRules = {
  "effect/noAliasTestLayer": "error",
  "effect/noEagerAcquire": "error",
  "effect/noFixedWaitInTests": "error",
  "effect/noManagedRuntimeInEffect": "error",
  "effect/noRunCollectOnUnboundedStream": "error",
  "effect/noSequentialEffectAll": "error",
  "effect/noSilentCatchAll": "error",
  "effect/noUnboundedConcurrency": "error",
  "effect/noUnboundedRetry": "error",
  "effect/requireForceKillAfter": "error",
  "effect/requireNamedEffectFn": "error",
} satisfies DummyRuleMap;

export function effectRules() {
  return {
    ...effectIdiomRules,
    // Effect's rules report only on code that uses Effect. The strict preset
    // ships as errors, including schema-class-missing-brand, which asks a brand
    // only of the class kinds the tsconfig's `brandedSchemaClasses` lists.
    ...loadPreset("strict").rules,
    // The style and antipattern presets ship as warnings; as errors, CI fails
    // on them as it does on the strict preset. Antipattern adds
    // effect-try-without-catch and strict-effect-provide, which an
    // application's entry points, where the program is provided, turn off.
    ...asErrors(loadPreset("style").rules),
    ...asErrors(loadPreset("antipattern").rules),
    // The codebase is Effect, so native APIs that Effect provides a service
    // for, such as `fetch`, `Date`, and `process.env`, are errors everywhere.
    // The preset ships as warnings; as errors, CI fails on it.
    ...asErrors(loadPreset("effect-native").rules),
    ...effectNativeCompanionRules,
    ...effectTsgoOffRules,
    ...effectPluginRules,
  };
}

/**
 * Turns the effect-native preset's rules off for code on another platform's
 * terms, but keeps its `*-in-effect` rules: a native API inside Effect code is
 * wrong wherever that code is.
 */
export function effectExceptOverride(files: string[]): OxlintOverride {
  return {
    files,
    rules: Object.fromEntries(
      Object.keys(loadPreset("effect-native").rules)
        .filter((rule) => !rule.endsWith("-in-effect"))
        .map((rule) => [rule, "off"]),
    ),
  };
}

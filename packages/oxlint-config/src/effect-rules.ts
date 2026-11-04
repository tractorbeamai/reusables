import { createRequire } from "node:module";

import type {
  DummyRule,
  DummyRuleMap,
  ExternalPluginEntry,
  OxlintConfig,
  OxlintOverride,
} from "oxlint";

/** A rule map keyed by any rule name, so declarations name no rule's options type. */
type RuleMap = Record<string, DummyRule>;

export interface EffectOptions {
  /**
   * Apply `@effect/tsgo`'s effect-native preset, as errors, to files matching
   * these globs: native APIs that Effect provides a service for are errors
   * there even outside Effect code.
   */
  native?: { files: string[]; excludeFiles?: string[] };
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
 * The built-in plugins the presets' rules need, which tsgolint provides.
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
 * Rules `@effect/tsgo`'s presets don't set, or set differently.
 */
const effectTsgoRules = {
  // TypeScript's own narrowing covers optional values in conditions, and pipe
  // style is a choice for each call site rather than a rule.
  "effecttsgo/strict-boolean-expressions": "off",
  "effecttsgo/missing-pipeable-signature": "off",
  "effecttsgo/missed-pipeable-opportunity": "off",
  // A generic arrow-body style rule, not an Effect one; the formatter owns layout.
  "effecttsgo/unnecessary-arrow-block": "off",
  // Effect's unstable modules, such as HttpApi, HttpRouter, effect/cli, and
  // RPC, are fair to use.
  "effecttsgo/unstable-api-usage": "off",
  // An untagged Schema class needs a brand to keep its type distinct; a tagged
  // class's or error's literal `_tag` already does. The language service reads
  // which kinds need one from the tsconfig, which
  // `@tractorbeam/typescript-config/effect` sets.
  "effecttsgo/schema-class-missing-brand": "error",
  // Native APIs that Effect provides a service for are errors inside Effect code.
  "effecttsgo/abort-controller-in-effect": "error",
  "effecttsgo/crypto-random-uuid-in-effect": "error",
  "effecttsgo/global-console-in-effect": "error",
  "effecttsgo/global-date-in-effect": "error",
  "effecttsgo/global-fetch-in-effect": "error",
  "effecttsgo/global-json-in-effect": "error",
  "effecttsgo/global-random-in-effect": "error",
  "effecttsgo/global-timers-in-effect": "error",
  "effecttsgo/process-env-in-effect": "error",
  // A short-form `Effect.try` fails with Cause.UnknownError, which no caller
  // can handle by tag; the object form maps the cause to a typed error.
  "effecttsgo/effect-try-without-catch": "error",
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
    // Effect's rules report only on code that uses Effect.
    ...loadPreset("strict").rules,
    // The style preset ships as warnings; as errors, CI fails on it as it does
    // on the strict preset.
    ...asErrors(loadPreset("style").rules),
    ...effectTsgoRules,
    ...effectPluginRules,
  };
}

export function effectNativeOverride({
  files,
  excludeFiles,
}: NonNullable<EffectOptions["native"]>): OxlintOverride {
  return {
    files,
    ...(excludeFiles && { excludeFiles }),
    rules: {
      // The preset ships as warnings; as errors, CI fails on it.
      ...asErrors(loadPreset("effect-native").rules),
      // Native Array, Object, and String methods are house style; effect/Array,
      // effect/Record, and effect/String are for what the native methods lack.
      "effecttsgo/prefer-effect-array": "off",
      "effecttsgo/prefer-effect-record": "off",
      "effecttsgo/prefer-effect-string": "off",
    },
  };
}

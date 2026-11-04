import assert from "node:assert/strict";
import { test } from "node:test";

import oxlintConfig from "@tractorbeam/oxlint-config";
import uiPlugin from "@tractorbeam/oxlint-config/ui";

test("loads the UI plugin", () => {
  assert.equal(uiPlugin.meta.name, "ui");

  assert.deepEqual(Object.keys(uiPlugin.rules), [
    "no-button-height-class",
    "no-icon-class-in-button",
    "no-pages-in-components",
    "route-component-names",
  ]);
});

test("enables React linting by default with globally scoped rules first", () => {
  // Arrange
  const expectedRules = [
    "max-lines",
    "max-lines-per-function",
    "no-inline-comments",
    "no-nested-ternary",
    "no-shadow",
    "import/max-dependencies",
    "import/no-namespace",
    "import/no-unassigned-import",
    "jsx-a11y/anchor-has-content",
    "jsx-a11y/autocomplete-valid",
    "jsx-a11y/click-events-have-key-events",
    "jsx-a11y/label-has-associated-control",
    "jsx-a11y/no-autofocus",
    "jsx-a11y/no-redundant-roles",
    "jsx-a11y/prefer-tag-over-role",
    "jsx-a11y/tabindex-no-positive",
    "react/jsx-no-constructed-context-values",
    "react/no-array-index-key",
    "react/react-in-jsx-scope",
    "react-perf/jsx-no-jsx-as-prop",
    "react-perf/jsx-no-new-array-as-prop",
    "react-perf/jsx-no-new-function-as-prop",
    "react-perf/jsx-no-new-object-as-prop",
    "ui/no-button-height-class",
    "ui/no-icon-class-in-button",
    "ui/no-pages-in-components",
    "ui/route-component-names",
    "@stylistic/padding-line-between-statements",
    "curly",
  ];

  // Act
  const config = oxlintConfig();

  // Assert
  assert.deepEqual(config.jsPlugins, [
    {
      name: "anti-slop",
      specifier: "@tractorbeam/oxlint-config/anti-slop",
    },
    {
      name: "ui",
      specifier: "@tractorbeam/oxlint-config/ui",
    },
    {
      name: "@stylistic",
      specifier: "@tractorbeam/oxlint-config/stylistic",
    },
  ]);

  assert.deepEqual(config.plugins, ["import", "jsx-a11y", "promise", "react", "react-perf"]);
  const configuredRules = Object.keys(config.rules);

  const configuredAntiSlopRules = Object.entries(config.rules).filter(([rule]) =>
    rule.startsWith("anti-slop/"),
  );

  assert.ok(configuredAntiSlopRules.length > 0);

  for (const [, severity] of configuredAntiSlopRules) {
    assert.equal(severity, "error");
  }

  assert.equal(config.rules["no-nested-ternary"], "error");

  assert.deepEqual(
    configuredRules.filter((rule) => !rule.startsWith("anti-slop/")),
    expectedRules,
  );
});

test("omits React plugins and rules when React support is disabled", () => {
  // Arrange
  const reactRulePrefixes = ["jsx-a11y/", "react/", "react-perf/", "ui/"];

  // Act
  const config = oxlintConfig({ react: false });

  // Assert
  assert.deepEqual(config.plugins, ["import", "promise"]);

  assert.equal(
    Object.keys(config.rules).some((rule) =>
      reactRulePrefixes.some((prefix) => rule.startsWith(prefix)),
    ),
    false,
  );

  assert.equal(config.rules["no-shadow"], "off");

  assert.deepEqual(config.jsPlugins, [
    {
      name: "anti-slop",
      specifier: "@tractorbeam/oxlint-config/anti-slop",
    },
    {
      name: "@stylistic",
      specifier: "@tractorbeam/oxlint-config/stylistic",
    },
  ]);
});

test("omits cyclomatic complexity linting by default", () => {
  const config = oxlintConfig();

  assert.equal(config.rules.complexity, undefined);
});

test("configures a cyclomatic complexity limit", () => {
  const config = oxlintConfig({ complexity: 15 });

  assert.deepEqual(config.rules.complexity, ["warn", 15]);
});

test("requires braces and padding around multiline statements by default", () => {
  const config = oxlintConfig();

  assert.deepEqual(config.rules.curly, ["error", "all"]);
  assert.equal(config.rules["@stylistic/padding-line-between-statements"][0], "error");

  assert.deepEqual(config.jsPlugins.at(-1), {
    name: "@stylistic",
    specifier: "@tractorbeam/oxlint-config/stylistic",
  });
});

test("omits stylistic linting when stylistic is disabled", () => {
  const config = oxlintConfig({ stylistic: false });

  assert.equal(config.rules.curly, undefined);
  assert.equal(config.rules["@stylistic/padding-line-between-statements"], undefined);

  assert.equal(
    config.jsPlugins.some((plugin) => plugin.name === "@stylistic"),
    false,
  );
});

test("omits Playwright linting by default", () => {
  const config = oxlintConfig();

  assert.deepEqual(config.overrides, []);

  assert.equal(
    config.jsPlugins.some((plugin) => plugin.name === "playwright"),
    false,
  );
});

test("scopes Playwright rules to the configured test files", () => {
  // Arrange
  const files = ["e2e/**/*.ts", "tests/browser/**/*.ts"];

  // Act
  const config = oxlintConfig({ playwright: { files } });

  // Assert
  assert.deepEqual(config.jsPlugins.at(-1), {
    name: "playwright",
    specifier: "@tractorbeam/oxlint-config/playwright",
  });

  assert.equal(
    Object.keys(config.rules).some((rule) => rule.startsWith("playwright/")),
    false,
  );

  assert.equal(config.overrides.length, 1);
  assert.deepEqual(config.overrides[0].files, files);
  assert.equal(config.overrides[0].rules["playwright/no-wait-for-timeout"], "error");

  assert.deepEqual(config.overrides[0].rules["playwright/missing-playwright-await"], [
    "error",
    { includePageLocatorMethods: true },
  ]);

  assert.ok(config.overrides[0].rules["playwright/expect-expect"]);
});

test("loads the stylistic and Playwright plugins", async () => {
  const { default: stylistic } = await import("@tractorbeam/oxlint-config/stylistic");
  const { default: playwright } = await import("@tractorbeam/oxlint-config/playwright");

  assert.ok(stylistic.rules["padding-line-between-statements"]);
  assert.ok(playwright.rules["no-wait-for-timeout"]);
});

test("omits Effect linting by default", () => {
  const config = oxlintConfig();

  assert.equal(config.plugins.includes("effecttsgo"), false);

  assert.equal(
    config.jsPlugins.some((plugin) => plugin.name === "effect"),
    false,
  );

  assert.equal(
    Object.keys(config.rules).some(
      (rule) => rule.startsWith("effecttsgo/") || rule.startsWith("effect/"),
    ),
    false,
  );

  assert.equal(config.rules["import/no-namespace"], "error");
  assert.deepEqual(config.overrides, []);
});

test("enables Effect's plugins and rules as errors", () => {
  // Act
  const config = oxlintConfig({ effect: true, react: false });

  // Assert
  assert.deepEqual(config.plugins, ["import", "promise", "effecttsgo"]);

  assert.deepEqual(config.jsPlugins.at(-1), {
    name: "effect",
    specifier: "oxlint-plugin-effect/plugin",
  });

  const effectRules = Object.entries(config.rules).filter(
    ([rule, severity]) =>
      (rule.startsWith("effecttsgo/") || rule.startsWith("effect/")) && severity !== "off",
  );

  assert.ok(effectRules.length > 50);

  for (const [, severity] of effectRules) {
    assert.equal(severity, "error");
  }

  assert.equal(config.rules["effecttsgo/schema-class-missing-brand"], "error");
  assert.equal(config.rules["effecttsgo/effect-try-without-catch"], "error");
  assert.equal(config.rules["effecttsgo/global-fetch-in-effect"], "error");
  assert.equal(config.rules["effect/requireNamedEffectFn"], "error");
  assert.equal(config.rules["effecttsgo/strict-effect-provide"], "error");
  assert.equal(config.rules["effecttsgo/missed-pipeable-opportunity"], "error");
  assert.equal(config.rules["effecttsgo/unnecessary-arrow-block"], "error");
  assert.equal(config.rules["effecttsgo/prefer-namespace-import"], "error");
  assert.equal(config.rules["effecttsgo/strict-boolean-expressions"], "off");
  assert.equal(config.rules["effecttsgo/missing-pipeable-signature"], "off");
  assert.equal(config.rules["effecttsgo/unstable-api-usage"], "off");
  assert.equal(config.rules["import/no-namespace"], "off");
  assert.deepEqual(config.rules["eslint/no-underscore-dangle"], ["error", { allow: ["_tag"] }]);
  assert.equal(config.rules["effecttsgo/global-fetch"], undefined);
  assert.deepEqual(config.overrides, []);
});

test("scopes the effect-native preset to the configured files", () => {
  // Arrange
  const files = ["src/**/*.ts"];
  const excludeFiles = ["**/*.test.ts"];

  // Act
  const config = oxlintConfig({ effect: { native: { files, excludeFiles } } });

  // Assert
  assert.equal(config.overrides.length, 1);
  assert.deepEqual(config.overrides[0].files, files);
  assert.deepEqual(config.overrides[0].excludeFiles, excludeFiles);
  assert.equal(config.overrides[0].rules["effecttsgo/global-fetch"], "error");
  assert.equal(config.overrides[0].rules["effecttsgo/prefer-effect-array"], "error");
  assert.equal(config.overrides[0].rules["unicorn/no-array-sort"], "off");
  assert.equal(config.rules["effecttsgo/global-fetch"], undefined);
});

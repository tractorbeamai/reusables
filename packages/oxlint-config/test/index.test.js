import assert from "node:assert/strict";
import { test } from "node:test";

import oxlintConfig from "@tractorbeam/oxlint-config";
import uiPlugin from "@tractorbeam/oxlint-config/ui";

test("loads the UI plugin", () => {
  assert.equal(uiPlugin.meta.name, "ui");
  assert.deepEqual(Object.keys(uiPlugin.rules), [
    "no-button-height-class",
    "no-icon-class-in-button",
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

import assert from "node:assert/strict";
import { test } from "node:test";

import antiSlopPlugin from "@tractorbeam/oxlint-config/anti-slop";
import oxlintConfig from "@tractorbeam/oxlint-config";

const antiSlopRules = Object.keys(antiSlopPlugin.rules);

test("loads the anti-slop plugin dependency", () => {
  assert.equal(antiSlopPlugin.meta.name, "anti-slop");
  assert.ok(antiSlopRules.length > 0);
});

test("enables React linting by default with globally scoped rules first", () => {
  // Arrange
  const expectedRules = [
    "max-lines-per-function",
    "no-inline-comments",
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
  ];

  // Act
  const config = oxlintConfig();

  // Assert
  assert.deepEqual(config.jsPlugins, [
    {
      name: "anti-slop",
      specifier: "@tractorbeam/oxlint-config/anti-slop",
    },
  ]);
  assert.deepEqual(config.plugins, ["import", "jsx-a11y", "promise", "react", "react-perf"]);
  const configuredRules = Object.keys(config.rules);
  const configuredAntiSlopRules = configuredRules
    .filter((rule) => rule.startsWith("anti-slop/"))
    .map((rule) => rule.slice("anti-slop/".length));

  assert.deepEqual(configuredAntiSlopRules.sort(), [...antiSlopRules].sort());
  assert.deepEqual(
    configuredRules.filter((rule) => !rule.startsWith("anti-slop/")),
    expectedRules,
  );
});

test("omits React plugins and rules when React support is disabled", () => {
  // Arrange
  const reactRulePrefixes = ["jsx-a11y/", "react/", "react-perf/"];

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
});

import assert from "node:assert/strict";
import { test } from "node:test";

import antiSlopPlugin from "@tractorbeam/oxlint-config/anti-slop";
import oxlintConfig from "@tractorbeam/oxlint-config";

const antiSlopRules = [
  "no-chained-type-assertions",
  "no-conditional-empty-object-spread",
  "no-known-value-widening",
  "no-object-parameters",
  "no-runtime-typeof",
  "no-shape-in-symbol-names",
  "no-unknown-parameters",
  "no-unknown-type-aliases",
  "no-unsafe-dictionary-type",
  "no-widen-then-assert",
];

test("loads the anti-slop plugin dependency", () => {
  assert.equal(antiSlopPlugin.meta.name, "anti-slop");
  assert.deepEqual(Object.keys(antiSlopPlugin.rules).sort(), [...antiSlopRules].sort());
});

test("enables React linting by default with globally scoped rules first", () => {
  // Arrange
  const expectedRules = [
    "max-lines-per-function",
    "no-inline-comments",
    "no-shadow",
    ...antiSlopRules.map((rule) => `anti-slop/${rule}`),
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
  assert.deepEqual(Object.keys(config.rules), expectedRules);
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

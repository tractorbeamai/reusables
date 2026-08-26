import type { OxlintConfig } from "oxlint";

export interface OxlintComplexityOptions {
  /** Maximum allowed cyclomatic complexity. Defaults to 15. */
  max?: number;
  /** Use classic McCabe counting or count each switch statement once. */
  variant?: "classic" | "modified";
}

export interface OxlintConfigOptions {
  /** Enable the cyclomatic complexity preset or customize its threshold and variant. */
  complexity?: boolean | OxlintComplexityOptions;
  react?: boolean;
}

const defaultComplexityOptions = {
  max: 15,
  variant: "classic",
} as const satisfies OxlintComplexityOptions;

interface ComplexityRules {
  complexity?: ["warn", Required<OxlintComplexityOptions>];
}

const globalRules = {
  "max-lines": ["warn", { max: 1000 }],
  "max-lines-per-function": ["warn", { max: 150 }],
  "no-inline-comments": ["warn", { ignorePattern: "#__PURE__|@__PURE__" }],
  "no-shadow": "off",
} satisfies OxlintConfig["rules"];

const pluginRules = {
  "anti-slop/no-chained-type-assertions": "error",
  "anti-slop/no-conditional-empty-object-spread": "error",
  "anti-slop/no-known-value-widening": "error",
  "anti-slop/no-object-parameters": "error",
  "anti-slop/no-runtime-typeof": "error",
  "anti-slop/no-shape-in-symbol-names": "error",
  "anti-slop/no-unknown-parameters": "error",
  "anti-slop/no-unknown-type-aliases": "error",
  "anti-slop/no-unsafe-dictionary-type": "error",
  "anti-slop/no-widen-then-assert": "error",
  "import/max-dependencies": "off",
  "import/no-namespace": "error",
  "import/no-unassigned-import": "off",
} satisfies OxlintConfig["rules"];

const reactPluginRules = {
  "jsx-a11y/anchor-has-content": "warn",
  "jsx-a11y/autocomplete-valid": "warn",
  "jsx-a11y/click-events-have-key-events": "warn",
  "jsx-a11y/label-has-associated-control": "off",
  "jsx-a11y/no-autofocus": "warn",
  "jsx-a11y/no-redundant-roles": "warn",
  "jsx-a11y/prefer-tag-over-role": "warn",
  "jsx-a11y/tabindex-no-positive": "warn",
  "react/jsx-no-constructed-context-values": "warn",
  "react/no-array-index-key": "warn",
  "react/react-in-jsx-scope": "off",
  "react-perf/jsx-no-jsx-as-prop": "warn",
  "react-perf/jsx-no-new-array-as-prop": "warn",
  "react-perf/jsx-no-new-function-as-prop": "warn",
  "react-perf/jsx-no-new-object-as-prop": "warn",
  "ui/no-button-height-class": "warn",
  "ui/no-icon-class-in-button": "warn",
} satisfies OxlintConfig["rules"];

function complexityRules(complexity: OxlintConfigOptions["complexity"]): ComplexityRules {
  if (complexity === undefined || complexity === false) return {};

  const options = complexity === true ? defaultComplexityOptions : complexity;
  const configuredOptions: Required<OxlintComplexityOptions> = {
    ...defaultComplexityOptions,
    ...options,
  };

  return {
    complexity: ["warn", configuredOptions],
  } satisfies OxlintConfig["rules"];
}

export default function oxlintConfig({ complexity, react = true }: OxlintConfigOptions = {}) {
  const rules = { ...globalRules, ...pluginRules, ...complexityRules(complexity) };

  if (react) {
    Object.assign(rules, reactPluginRules);
  }

  return {
    jsPlugins: [
      {
        name: "anti-slop",
        specifier: "@tractorbeam/oxlint-config/anti-slop",
      },
      ...(react
        ? [
            {
              name: "ui",
              specifier: "@tractorbeam/oxlint-config/ui",
            },
          ]
        : []),
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    plugins: react
      ? ["import", "jsx-a11y", "promise", "react", "react-perf"]
      : ["import", "promise"],
    categories: {
      correctness: "error",
      suspicious: "error",
      perf: "error",
      pedantic: "warn",
    },
    rules,
  } satisfies OxlintConfig;
}

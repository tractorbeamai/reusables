import type { Linter } from "eslint";
import { defineConfig } from "eslint/config";

// @ts-expect-error - DefinitelyTyped types are not compatible with ESLint 9.34
import pluginJSXA11y from "eslint-plugin-jsx-a11y";
import pluginReact from "eslint-plugin-react";
import * as pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";

const pluginJSXA11yConfig = (
  pluginJSXA11y as {
    flatConfigs: { recommended: Linter.Config };
  }
).flatConfigs.recommended;

export default defineConfig([
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
  },
  pluginReact.configs.flat.recommended!,
  pluginReact.configs.flat["jsx-runtime"]!,
  pluginReactHooks.configs["recommended-latest"],
  pluginReactRefresh.configs.vite,
  pluginJSXA11yConfig,
  {
    plugins: { react: pluginReact },
    settings: { react: { version: "detect" } },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/no-unused-prop-types": "error",
      "react/no-unescaped-entities": "off",
      "react/jsx-handler-names": "error",
      "react/jsx-pascal-case": "error",
      "no-restricted-syntax": [
        "error",
        {
          message:
            "Unexpected render* function declaration. Use component instead.",
          selector: "FunctionDeclaration[name=/^render[A-Z]+/]",
        },
        {
          message:
            "Unexpected render* variable. Use meaningful component name instead.",
          selector: "VariableDeclarator[id.name=/^render[A-Z]/]",
        },
        {
          message:
            "Unexpected render* function expression. Create proper component instead.",
          selector: "FunctionExpression[id.name=/^render[A-Z]/]",
        },
        {
          message:
            "Unexpected render* arrow function. Create proper component instead.",
          selector: "ArrowFunctionExpression[parent.id.name=/^render[A-Z]/]",
        },
      ],
    },
  },
]);

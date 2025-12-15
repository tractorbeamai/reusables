import type { ESLint, Linter } from "eslint";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import pluginReact from "eslint-plugin-react";
import pluginReactCompiler from "eslint-plugin-react-compiler";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";
import globals from "globals";

export const react: Linter.Config[] = defineConfig([
  {
    files: ["**/*.tsx", "**/*.jsx"],
    extends: [
      pluginReact.configs.flat.recommended,
      pluginReact.configs.flat["jsx-runtime"],
      pluginReactHooks.configs.flat.recommended,
      pluginJsxA11y.flatConfigs.recommended,
      pluginReactCompiler.configs.recommended,
    ],
    languageOptions: {
      globals: { ...globals.browser },
    },
    plugins: {
      "react-hooks": pluginReactHooks as unknown as ESLint.Plugin,
      "react-refresh": pluginReactRefresh,
    },
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "react-refresh/only-export-components": "warn",
      "react/no-children-prop": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
]);

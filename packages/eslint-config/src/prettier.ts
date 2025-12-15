import type { Linter } from "eslint";
import prettierConfig from "eslint-config-prettier";

export const prettier: Linter.Config[] = [prettierConfig];

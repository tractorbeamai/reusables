import { defineConfig } from "eslint/config";

import pluginVitest from "@vitest/eslint-plugin";

export default defineConfig(pluginVitest.configs.all);

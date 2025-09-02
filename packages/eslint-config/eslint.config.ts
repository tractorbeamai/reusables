import baseConfig from "../../eslint.config.ts";
import { defineConfig } from "eslint/config";

export default defineConfig(baseConfig, {
  rules: {
    "import-x/no-named-as-default-member": "off",
  },
});

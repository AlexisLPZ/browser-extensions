// eslint.config.mjs

import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  // 1) Ignore non-source files (including the config itself)
  {
    ignores: ["eslint.config.*", "node_modules/**", "dist/**", "build/**"],
  },
  // 2) Base recommended rules
  js.configs.recommended,
  // 3) Project files config
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script", // plain scripts (no import/export)
      globals: {
        ...globals.browser,
        chrome: "readonly",
      },
    },
  },
  {
    name: "browser-globals",
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.browser,
        chrome: "readonly", // for extensions
      },
    },
    rules: {
      // Put custom rules here if needed
    },
  },
  // Disable rules that conflict with Prettier
  prettier,
];

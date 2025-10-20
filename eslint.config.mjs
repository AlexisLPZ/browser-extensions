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
      // Naming conventions
      camelcase: ["error", { properties: "never" }],

      // Code quality
      "no-unused-vars": "error",
      "no-undef": "error",
      "no-console": "warn", // Allow console.log for debugging extensions
      "no-debugger": "error",
      "no-alert": "warn", // You're using alert() - consider disabling

      // Best practices
      eqeqeq: ["error", "always"], // Use === instead of ==
      "no-var": "error", // Use let/const instead of var
      "prefer-const": "error", // Use const when variable isn't reassigned
      "no-duplicate-imports": "error",

      // Security
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
    },
  },
  // Disable rules that conflict with Prettier
  prettier,
];

// eslint.config.mjs

import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default [
  // Ignore non-source files (including the config itself)
  {
    ignores: ["eslint.config.*", "node_modules/**", "dist/**", "build/**"],
  },
  // Base recommended rules
  js.configs.recommended,
  // Project files config
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
        ...globals.node, // Add Node.js globals like 'module'
        chrome: "readonly", // for extensions
      },
    },
    rules: {
      // Naming conventions
      camelcase: ["error", { properties: "never" }],

      // Code quality
      "no-unused-vars": "error",
      "no-undef": "error",
      "no-console": "off", // Allow console.log for debugging extensions
      "no-debugger": "error",
      "max-len": [
        "warn",
        {
          code: 80,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignoreComments: false,
        },
      ],

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
  // Test files config
  {
    files: ["**/*.test.js", "**/*.spec.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module", // ESM for test files
      globals: {
        ...globals.browser,
        ...globals.jest, // Jest globals like describe, test, expect
        chrome: "readonly",
      },
    },
    rules: {
      // Naming conventions
      camelcase: ["error", { properties: "never" }],

      // Code quality
      "no-unused-vars": "warn",
      "no-undef": "warn",

      // Best practices
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
  // Disable rules that conflict with Prettier
  prettier,
];

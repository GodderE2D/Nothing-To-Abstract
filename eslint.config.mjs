import path from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "**/node_modules/",
      "**/dist/",
      "process/",
      "**/.env",
      "**/logs",
      "**/*.log",
      "**/npm-debug.log*",
      "**/yarn-debug.log*",
      "**/yarn-error.log*",
      "**/.yarn/",
      ".vscode/*",
      "!.vscode/extensions.json",
      "**/.DS_Store",
      "**/*.pem",
    ],
  },
  ...compat.extends("eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
      "simple-import-sort": simpleImportSort,
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },

    rules: {
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-var": "error",
      "no-console": "error",
      "no-warning-comments": "warn",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",

      "no-restricted-globals": [
        "error",
        {
          name: "Buffer",
          message: "Import Buffer from `node:buffer` instead",
        },
        {
          name: "process",
          message: "Import process from `node:process` instead",
        },
        {
          name: "setTimeout",
          message: "Import setTimeout from `node:timers` instead",
        },
        {
          name: "setInterval",
          message: "Import setInterval from `node:timers` instead",
        },
        {
          name: "setImmediate",
          message: "Import setImmediate from `node:timers` instead",
        },
        {
          name: "clearTimeout",
          message: "Import clearTimeout from `node:timers` instead",
        },
        {
          name: "clearInterval",
          message: "Import clearInterval from `node:timers` instead",
        },
      ],
    },
  },
];

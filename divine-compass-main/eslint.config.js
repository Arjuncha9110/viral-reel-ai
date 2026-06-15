import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "dist-new",
      "dist-ssr",
      "preview-*",
      ".trash",
      ".wrangler",
      ".codex-tmp-diagnose",
      "vite.config.ts.timestamp-*.mjs",
      "vite.config.ts.tmp",
      "patch*.cjs",
      "apply_split_patch*",
      "write_patch*.cjs",
      "check_*.cjs",
      "dump_lines.cjs",
      "find_lines.cjs",
      "print_page_code.cjs",
      "src/pages/diff*.txt",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "no-case-declarations": "warn",
      "no-constant-binary-expression": "warn",
      "no-dupe-else-if": "warn",
      "no-empty": "warn",
      "no-empty-pattern": "warn",
      "no-misleading-character-class": "warn",
      "prefer-const": "warn",
    },
  },
);

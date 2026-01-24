import baseConfig from "@wallet-ledger/eslint-config/base";
import nextjsConfig from "@wallet-ledger/eslint-config/next";
import reactConfig from "@wallet-ledger/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  ...baseConfig,
  ...reactConfig,
  ...nextjsConfig,
  {
    ignores: [".next/**", "!.next/types/**/*"],
    rules: {
      "@typescript-eslint/consistent-type-assertions": "off",
      "@typescript-eslint/require-await": "off",
      "import/consistent-type-specifier-style": "off"
    }
  }
];
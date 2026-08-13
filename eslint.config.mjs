import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Architecture boundary: src/core must stay framework-agnostic.
  // If this fires, the design is wrong — move the framework-touching code to infra/presentation.
  {
    files: ["src/core/**/*.ts", "src/core/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "next",
                "next/*",
                "react",
                "react/*",
                "react-dom",
                "react-dom/*",
                "pg",
                "zod",
                "jose",
                "argon2",
                "@dnd-kit/*",
                "@tanstack/*",
                "*/infra/*",
                "*/presentation/*",
                "@/infra/*",
                "@/presentation/*",
              ],
              message:
                "src/core/** must stay framework-agnostic. Define a port here and implement it in infra/.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

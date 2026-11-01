// eslint-config-next@16 ships native flat configs; spread them directly.
// (The old FlatCompat shim crashed under ESLint 9 — its legacy validator
// JSON.stringify'd eslint-plugin-react's self-referential config and threw on
// the circular structure before linting a single file.)
import next from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  ...next,
  ...nextTs,
  {
    // shared/api/generated is an auto-generated artifact (npm run gen:api);
    // it's already prettier-formatted by codegen, so keep it out of lint churn.
    ignores: [".next/**", "node_modules/**", "dist/**", "public/**", "shared/api/generated/**"],
  },
  {
    rules: {
      // The shadcn/ui kit and a couple of generic helpers lean on `any`;
      // surface it as a warning rather than failing the build.
      "@typescript-eslint/no-explicit-any": "warn",
      // Marketing copy legitimately contains quotes/apostrophes in JSX text.
      "react/no-unescaped-entities": "off",
      // A couple of client-only hooks set state in an effect to stay SSR-safe
      // (window/cookie reads can't run during render). Warn, don't fail.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // All env access is centralised in config.ts; everything else imports the
    // typed `config` object instead of reaching into process.env. config.ts is
    // the reader (config.assert.ts is its Node-only boot check); instrumentation.ts
    // needs literal NEXT_RUNTIME checks for edge dead-code elimination;
    // playwright.config.ts and its harness run under tsx outside
    // Next's alias/transpile, so they read the flake's port/CI vars directly.
    ignores: ["config.ts", "config.assert.ts", "instrumentation.ts", "playwright.config.ts", "tests/**"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message: "Read env through the typed `config` object (config.ts), not process.env.",
        },
      ],
    },
  },
];

export default eslintConfig;

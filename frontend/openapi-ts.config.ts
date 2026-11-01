import { defineConfig } from "@hey-api/openapi-ts";

// The backend (Rust/utoipa) owns the contract; `backend/openapi.json` is the
// committed source artifact. Regenerate the client from it via `npm run gen:api`.
// Output lands in shared/api/generated and is committed so the app type-checks
// and builds without the backend running.
export default defineConfig({
  input: "../backend/openapi.json",
  output: {
    path: "shared/api/generated",
    postProcess: ["prettier"],
  },
  plugins: [
    {
      name: "@hey-api/client-fetch",
      // baseUrl lives in a hand-written wrapper so the generated client stays a
      // pure artifact (see shared/api/runtime.ts).
      runtimeConfigPath: "./shared/api/runtime",
    },
  ],
});

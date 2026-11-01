// Public API of the `shared/api` slice.
//
// The backend (Rust/utoipa) is the source of truth; everything under
// `generated/` is produced by `npm run gen:api` from `backend/openapi.json`
// and must not be edited by hand. Import from `@/shared/api`, never reach
// into `generated/` directly.
export * from "./generated";
export { client } from "./generated/client.gen";
export { extractApiError } from "./error";

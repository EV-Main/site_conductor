/**
 * @module features/error-monitoring
 *
 * Error capture — thin app wiring over `@evinvest/error-monitoring`.
 *
 * **Public API**
 * - `ErrorMonitoringProvider` — mount once in the root layout; boots browser
 *   Sentry on mount (Turbopack can't inject the classic client config) and adds
 *   session replay. No-op without `NEXT_PUBLIC_SENTRY_DSN`.
 * - `ErrorBoundary` — React error boundary with the app's fallback UI; reports
 *   caught errors to Sentry.
 * - `reportError(error, context?)` — capture an unexpected error from a Client
 *   Component (e.g. `app/global-error.tsx`).
 *
 * **Rules**
 * - Never import `@sentry/*` outside this feature (and `instrumentation.ts` /
 *   `next.config.ts`, the server/build seams) — init and capture live here.
 * - Server/edge errors are captured via `instrumentation.ts` (`register` +
 *   `onRequestError`); this feature covers React client errors only.
 */
export { ErrorMonitoringProvider } from "./provider";
export { ErrorBoundary } from "./error-boundary";
export { reportError } from "./client";

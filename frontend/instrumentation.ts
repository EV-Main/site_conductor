// Server/edge Sentry bootstrap. Stays on @sentry/nextjs directly (not the
// vendor-neutral lib) so withSentryConfig's source-map frame rewriting and
// Next-aware request tracing survive.
import * as Sentry from "@sentry/nextjs";
import { defaultTracesSampleRate } from "@evinvest/error-monitoring";
import { config } from "@/config";

// Literal `process.env.NEXT_RUNTIME` checks are load-bearing: Next defines the
// var per-bundle, so the edge compile dead-code-eliminates the nodejs branch —
// including the dynamic import of config.assert.ts, whose process.exit is a
// banned API in the Edge Runtime. Routed through the `config.runtime` getter,
// the import stays in the edge bundle and the build warns on every compile.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Fail the boot, not the request: any required var missing in prod throws
    // here, before the server accepts traffic. (Node only — the edge sandbox
    // can't read dynamically-named env vars, so it would false-throw there.)
    (await import("@/config.assert")).assertConfig();
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.appEnv ?? "development",
      tracesSampleRate: defaultTracesSampleRate(config.isProduction ? "production" : undefined),
    });
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.appEnv ?? "development",
      tracesSampleRate: 0,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;

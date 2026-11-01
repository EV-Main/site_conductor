"use client";

import * as Sentry from "@sentry/nextjs";
import { ErrorMonitoringProvider as Provider } from "@evinvest/error-monitoring/react";
import type { ReactNode } from "react";

/**
 * Boots client-side Sentry on mount and renders children unchanged.
 *
 * Injects `@sentry/nextjs` into the lib's vendor-neutral provider (rather than
 * letting it lazy-load the generic `@sentry/react`) so the browser SDK keeps
 * Next.js App Router instrumentation and pairs with the build-time
 * `withSentryConfig` integration. The lib still owns the init defaults
 * (DSN ← NEXT_PUBLIC_SENTRY_DSN, env ← NEXT_PUBLIC_APP_ENV, traces 0.1 prod /
 * 1.0 else, replay 1.0 on error / 0.05 per session) and the replay integration.
 *
 * No-op without `NEXT_PUBLIC_SENTRY_DSN`. Turbopack can't inject the classic
 * `sentry.client.config`, so this explicit mount replaces it.
 */
export function ErrorMonitoringProvider({ children }: { children: ReactNode }) {
  return <Provider sentry={Sentry}>{children}</Provider>;
}

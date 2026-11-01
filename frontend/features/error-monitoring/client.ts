"use client";

import * as Sentry from "@sentry/nextjs";
import { createSentrySink } from "@evinvest/error-monitoring";

/**
 * Composition root for error reporting: pick the vendor (Sentry) once.
 *
 * `createSentrySink` adapts the Sentry SDK to the vendor-neutral `ErrorSink`
 * port, mapping `reportError(err, ctx)` → `captureException(err, { extra: ctx })`.
 * All app code reports through this `reportError` so the vendor can be swapped
 * here without touching call sites.
 *
 * No-op when `NEXT_PUBLIC_SENTRY_DSN` is unset (local dev): `Sentry.init` never
 * ran, so `captureException` has no client to send to.
 */
export const { reportError } = createSentrySink(Sentry);

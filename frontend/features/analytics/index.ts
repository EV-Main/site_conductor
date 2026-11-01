// Thin app wiring over @evinvest/analytics (client-only).
// - Never import posthog-js outside @evinvest/analytics — init/consent live there.
// - Analytics records; it never decides what to render (bucketing =
//   features/ab-variant/get-variant.ts).
export {
  PostHogProvider,
  useCapture,
  useAnalytics,
} from "@evinvest/analytics/react";
export { PostHogPageView } from "@evinvest/analytics/next/client";

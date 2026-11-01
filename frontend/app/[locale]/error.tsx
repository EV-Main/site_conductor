"use client";

import { useEffect } from "react";
import { StatusScreen, statusCtaClass } from "@evinvest/uikit";
import { reportError } from "@/features/error-monitoring";
import { useStatusCopy } from "@/shared/ui/status-copy";

// Route-segment error boundary (500). `reset` re-renders the segment; we also
// forward the error to monitoring.
//
// Next requires this file to be a Client Component, so it cannot read the locale
// the way the 404/403/401 do (`next/root-params`). Its copy is handed down by
// `StatusCopyProvider` from the server layout instead — see that module for why
// neither `useParams()` nor a second catalogue was the right trade.
//
// Imported from `shared/ui/status-copy`, never from `@/views/status`: that barrel
// reaches `messagesFor`. (Today the catalogues are already client-side for
// unrelated reasons — see the note in `shared/ui/status-copy` — so this is
// hygiene against a leak being fixed, not a saving being banked.)
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = useStatusCopy();

  useEffect(() => {
    reportError(error);
  }, [error]);

  // No provider means something failed above this boundary. Rendering the uikit's
  // English page is the honest fallback; crashing the error page is not.
  if (!copy) {
    return (
      <StatusScreen
        accent="error"
        code="500"
        eyebrow="Server error"
        headlineLead="Our systems are "
        headlineAccent="recalibrating"
        subtext="Something broke on our end — not yours. We've been alerted and are restoring service. Please try again in a moment."
        links={[{ label: "Back to home", href: "/", variant: "outline", leadingArrow: true }]}
      >
        <button type="button" className={statusCtaClass("error", "primary")} onClick={reset}>
          Try again
        </button>
      </StatusScreen>
    );
  }

  return (
    <StatusScreen
      accent="error"
      code="500"
      eyebrow={copy.eyebrow}
      headlineLead={copy.headlineLead}
      headlineAccent={copy.headlineAccent}
      subtext={copy.subtext}
      links={[
        { label: copy.backHome, href: copy.homeHref, variant: "outline", leadingArrow: true },
      ]}
    >
      <button type="button" className={statusCtaClass("error", "primary")} onClick={reset}>
        {copy.tryAgain}
      </button>
    </StatusScreen>
  );
}

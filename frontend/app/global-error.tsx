"use client";

import { useEffect } from "react";
import { reportError } from "@/features/error-monitoring";
import { ServerError } from "@evinvest/uikit";
import { fontInter, fontPlayfair } from "@/application/styles/fonts";
import "@/application/styles/globals.css";

// The last resort: `app/[locale]/error.tsx` catches anything thrown *inside* the
// document, so this only runs when the document itself failed — the root layout,
// a provider. It therefore replaces the whole `<html>` and must
// stand alone: no SiteDocument, no I18nProvider, nothing that
// could be the very thing that just threw. Fonts and the token sheet only, which
// is enough for the branded status screen to paint.
//
// (It used to render `next/error` — an unstyled white page carrying a bare "0",
// on a site with no light theme.)
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <html
      lang="en"
      className={`dark ${fontInter.variable} ${fontPlayfair.variable}`}
    >
      <body>
        {/* No `reset`: the boundary that failed is the document, so re-rendering
            it in place is the least likely thing to work. ServerError falls back
            to a full reload when `reset` is absent, which is what recovers. */}
        <ServerError />
      </body>
    </html>
  );
}

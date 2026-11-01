import { type ReactNode } from "react";
import { FileDown } from "lucide-react";
import { Container } from "@evinvest/uikit";

import { HeaderAction } from "@/shared/ui/header-actions";
import { RemoteDocument } from "@/shared/mfe";

export interface DocumentReaderProps {
  /** sr-only page heading — the doc body supplies its own visible title. */
  title: string;
  /** Same-origin path to the doc's html build, passed straight to `RemoteDocument`. */
  htmlSrc: string;
  /** Same-origin path to the doc's PDF build — the bail-out download. */
  pdfSrc: string;
  /** Forwarded to `RemoteDocument` — self-styled docs (the whitepaper) isolate in a shadow root. */
  isolate?: boolean;
  /**
   * Render the sr-only `<h1>` below. Default `true` — right for the whitepaper
   * (shadow-isolated, so this is the page's only heading). Pass `false` when the
   * caller already rendered a visible `<h1>` of its own: `/publications/[slug]`
   * does, in `PublicationArticleHeader`, and having both meant the page shipped
   * two `<h1>`s (three counting the light-DOM document's own, downgraded to
   * `<h2>` in `remote-document.tsx` for the same reason).
   */
  renderHeading?: boolean;
  /** Forwarded to `RemoteDocument` as `className` (e.g. `prose` for unstyled blog docs). */
  bodyClassName?: string;
  /** Shown in place of the doc if its build can't be loaded. Defaults to a PDF-download note. */
  fallback?: ReactNode;
  /** Tooltip on the download action. Passed in, not looked up: `shared/` has no
   * translator of its own, and the two callers already hold one. */
  downloadLabel?: string;
  /** Accessible name for the download action; `{title}` is substituted by the caller. */
  downloadAriaLabel?: string;
}

/**
 * The read/download framework for a `RemoteDocument`-backed page: the doc body
 * plus a PDF-download action mounted into the top bar for the duration of the
 * read. `/publications/whitepaper` and `/publications/[slug]` both render
 * through this so the two
 * never drift into their own copies of the same read/download interaction.
 */
export function DocumentReader({
  title,
  htmlSrc,
  pdfSrc,
  isolate = false,
  renderHeading = true,
  bodyClassName,
  fallback,
  downloadLabel,
  downloadAriaLabel,
}: DocumentReaderProps) {
  return (
    <main className="mt-24 min-h-[60vh]">
      {/* The doc supplies its own heading inside the body; this is only for the
          a11y/heading landmark on the host page — and only when the host page
          has no visible <h1> of its own (see `renderHeading`'s doc comment). */}
      {renderHeading && <h1 className="sr-only">{title}</h1>}

      <HeaderAction>
        <a
          href={pdfSrc}
          download
          aria-label={downloadAriaLabel ?? `Download ${title} as PDF`}
          title={downloadLabel ?? "Download PDF"}
          className="inline-flex shrink-0 items-center border border-primary-ink/30 p-2 text-primary-ink transition-colors hover:border-primary-ink hover:text-ink"
        >
          <FileDown className="size-4" />
        </a>
      </HeaderAction>

      <RemoteDocument
        src={htmlSrc}
        isolate={isolate}
        className={bodyClassName ?? "block"}
        fallback={
          fallback ?? (
            <Container className="py-24 text-ink/60">
              This document isn’t available right now —{" "}
              <a href={pdfSrc} className="text-primary-ink underline">
                download the PDF
              </a>
              .
            </Container>
          )
        }
      />
    </main>
  );
}

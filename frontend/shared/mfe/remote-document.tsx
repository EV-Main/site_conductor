// Public host primitive for *document* microfrontends: remotes that are a
// self-contained HTML document (the typst-built whitepaper / blog). It
// composes the document into the page natively — no iframe: the host keeps its
// chrome (Header/Footer) and scroll, and the content lives in the page.
//
// - isolate=false (default): inject the document's <body> into the LIGHT DOM so
//   host typography (prose) styles it. Any <style> the build carries (for
//   standalone viewing of the raw file) is stripped — light-DOM means
//   host-styled, and bare-tag doc CSS would reshape the whole host otherwise.
//   Pure Server Component: SSR'd, zero JS, indexable.
// - isolate=true: the document ships its own complete styles targeting bare tags —
//   mount it in a shadow root (client island) so its CSS can't leak into the host.
//
// Server Components by default; the shadow path is the only client island.

import { type ReactNode } from "react";

import { extractBodyInner } from "./doc-html";
import { loadDocHtml } from "./doc-source";
import { ShadowDocument } from "./shadow-document";

export interface RemoteDocumentProps {
  /** Document URL — site-relative (read from public/) or absolute (a doc service). */
  src: string;
  /** Shadow-isolate a self-styled doc. Default false (light DOM + host styles). */
  isolate?: boolean;
  className?: string;
  /** Shown while an isolated doc loads / if a doc can't be loaded. */
  fallback?: ReactNode;
}

export async function RemoteDocument({
  src,
  isolate = false,
  className,
  fallback = null,
}: RemoteDocumentProps) {
  if (isolate) {
    return <ShadowDocument src={src} className={className} fallback={fallback} />;
  }
  // Light DOM, SSR. Trusted operator content (see ShadowDocument trust note).
  let inner: string;
  try {
    inner = extractBodyInner(await loadDocHtml(src))
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      // The compiled document carries its own <h1> (its title, set by the typst
      // build). A light-DOM caller composes this into a page that already has
      // one — PublicationArticleHeader's — so left alone the page shipped two.
      // Downgrading to <h2> here keeps the document's own heading hierarchy
      // intact (it still reads as a heading, one level under the page title)
      // without touching the shadow-isolated path (the whitepaper), which has
      // no host <h1> to collide with.
      .replace(/<h1\b/gi, "<h2")
      .replace(/<\/h1>/gi, "</h2>");
  } catch {
    return <>{fallback}</>;
  }
  return <div className={className} dangerouslySetInnerHTML={{ __html: inner }} />;
}

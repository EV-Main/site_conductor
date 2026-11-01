"use client";

// Client island that composes a self-styled HTML document into the page inside a
// shadow root — the no-iframe way to embed a complete document whose CSS targets
// bare tags (html/body/p/…) and would otherwise reshape the whole host. The whole
// parsed document is adopted into the shadow root, so its <head> styles come
// across with the body; the shadow boundary isolates the doc's styles both ways.
// The doc is fetched lazily by URL (same network shape the old iframe had), so
// the host stays a light shell.
//
// Why client-side attachShadow, not SSR Declarative Shadow DOM: React 19 can
// emit a <template shadowrootmode> but cannot hydrate over it, and DSD never
// upgrades on App-Router soft navigation — attachShadow works on first load and
// soft-nav alike. See PATTERNS.md § microfrontends.
//
// Trust boundary: the doc HTML is operator-controlled (in-repo typst build,
// copied by the flake) — treat as code, the same boundary as a remote scriptUrl;
// no sanitization. If docs ever become user-sourced, sanitize here (DOMPurify).

import { useEffect, useRef, type ReactNode } from "react";

interface ShadowDocumentProps {
  /** URL of the document to mount (site-relative or absolute). */
  src: string;
  className?: string;
  /** Shown while loading and if the document can't be fetched. */
  fallback?: ReactNode;
}

export function ShadowDocument({ src, className, fallback = null }: ShadowDocumentProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((html) => {
        const host = hostRef.current;
        if (cancelled || !host) return;
        // Adopt the whole parsed document so its <head> styles come across with
        // the body. A shadow root's innerHTML fragment-parses and drops
        // <html>/<head>/<body>, taking the doc's inlined stylesheet with it
        // (the unstyled-dump bug). DOMParser never executes scripts and
        // parser-created scripts don't run on adoption.
        const root = host.shadowRoot ?? host.attachShadow({ mode: "open" });
        const doc = new DOMParser().parseFromString(html, "text/html");
        root.replaceChildren(doc.documentElement);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  // The fallback renders in light DOM; once a shadow root is attached the browser
  // stops rendering light children (there is no <slot>), so it disappears on
  // success and stays on loading / failure — no state needed.
  return (
    <div ref={hostRef} className={className}>
      {fallback}
    </div>
  );
}

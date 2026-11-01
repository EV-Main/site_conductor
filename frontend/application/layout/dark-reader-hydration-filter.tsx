"use client";

import { config } from "@/config";

// DarkReader (and similar restyling extensions) rewrite inline styles before
// React hydrates, so React logs an unfixable hydration mismatch for attributes
// the app never set. It's harmless — React keeps the server DOM, event handlers
// still attach, nothing behaves differently — but it trips Next's dev overlay.
//
// React's console.error message is just the generic "A tree hydrated but some
// attributes…" text (the darkreader diff is computed by the overlay, not passed
// to console.error), so we can't key off "darkreader" in the args. Instead we
// match the hydration message and gate on DarkReader actually being present in
// the DOM — a genuine hydration bug (extension off) still surfaces.
//
// Patched at module scope (not in an effect): client modules evaluate during the
// hydration bootstrap, after Next installs its own console.error hook but before
// hydrateRoot runs — so this wrapper sits outermost and intercepts first. The
// `typeof window` guard keeps it off the server; the whole thing is stripped from
// production builds.
if (!config.isProduction && typeof window !== "undefined") {
  const darkReaderActive = () =>
    !!document.querySelector(
      "style.darkreader, [data-darkreader-mode], [data-darkreader-scheme], [data-darkreader-inline-stroke], [data-darkreader-inline-bgcolor], [data-darkreader-inline-color]"
    );

  const original = console.error;
  let noted = false;
  console.error = function (this: unknown, ...args: unknown[]) {
    const text = args.map(String).join(" ");
    if (/hydrat/i.test(text) && darkReaderActive()) {
      if (!noted) {
        noted = true;
        console.info(
          "%cℹ The hydration-mismatch warnings on this page are from the DarkReader browser extension rewriting inline styles before React hydrates — harmless, not an app bug. Disable DarkReader on localhost to silence them.",
          "color:#9aa0a6"
        );
      }
      return;
    }
    return original.apply(this, args as Parameters<typeof console.error>);
  };
}

export function DarkReaderHydrationFilter() {
  return null;
}

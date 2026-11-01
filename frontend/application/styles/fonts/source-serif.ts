import localFont from "next/font/local";

// The coming-soon page's display face. A module of its own rather than a third
// export of ./index.ts: next/font preloads every face of the module a route
// imports, and index.ts is imported by the document every page renders.
//
// `variable` is the uikit's brand-scope hook, not a private name: `font-serif`
// is `@theme inline`, so its var() chain resolves on the element and the scope
// that sets `--brand-font-display` re-fonts its own subtree only.
export const fontSourceSerif = localFont({
  src: [
    {
      path: "./SourceSerif4-Variable.woff2",
      style: "normal",
      weight: "300 500",
    },
    {
      path: "./SourceSerif4-Italic-Light.woff2",
      style: "italic",
      weight: "300",
    },
  ],
  // Same trade as Playfair in ./index.ts: one committed face per page view, so
  // the 110px headline never changes shape under the reader.
  display: "optional",
  adjustFontFallback: false,
  fallback: ["Georgia", "ui-serif", "serif"],
  variable: "--brand-font-display",
});

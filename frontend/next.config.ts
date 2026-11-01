import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

import { config } from "./config";

// Restates LOCALES from @evinvest/i18n — this file loads as CJS and the
// package is ESM-only (same boundary as `unprefixed` in rewrites()).
const LOCALE_ALT = "en|ru|vi|fr|de";

// The public landing is gone from this origin and its pages answer 404 — no redirect to the new landing host, by decision (2026-10-18):
// whoever wants it knows the address. The match is the whole path, written as
// a regex fragment so the same text serves three rules:
//   - the 404 rewrites in rewrites() (bare and locale-prefixed),
//   - the lookahead that keeps the /en/* collapse off these paths in
//     redirects() — a 308 there would answer `/en/team` with a redirect
//     before the 404 rewrite is ever consulted,
//   - scripts/redirect-check.mts, through the rules' output.
// Segment-wise: each root matches itself and anything below it; the dotted
// whitepaper builds (pdf, dark/light html) and llms.txt are single files.
const RETIRED_ROOTS =
  "publications|team|hiring|contact|privacy|terms|risk|apps|blogs|whitepaper";
const RETIRED_PATH = `(?:(?:${RETIRED_ROOTS})(?:/.*)?|whitepaper\\..*|llms\\.txt)`;
// Same set as a lookahead, for sources that must leave these paths alone.
// `(?:/|$)` keeps it to the whole segment: `/en/teams` is another page and
// still collapses.
const NOT_COLLAPSED = `(?!(?:(?:${RETIRED_ROOTS})(?:/|$)|whitepaper\\.|llms\\.txt$))`;
// A destination no route owns, two segments deep so the `[locale]` dynamic
// route cannot claim it (that path 404s via NoFallbackError and re-renders,
// the shape behind the #229 loop). Next answers a real 404.
const GONE = "/_retired/gone";
const ANALYTICS = "https://estate.evinvest.ltd/analytics";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Dev-only: Next 16 blocks its dev resources (incl. the HMR socket) for any
  // origin but `localhost`, and a dead HMR socket means the client runtime
  // never boots — pages hydrate on localhost but are inert on 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1"],
  // Self-contained production server (.next/standalone) so the weak VPS runs
  // `node server.js` without an `npm install` — we can't build there.
  output: "standalone",
  // Enables the `forbidden()` / `unauthorized()` interrupts and their
  // `forbidden.tsx` / `unauthorized.tsx` file conventions (still experimental).
  experimental: {
    authInterrupts: true,
    // Enables `app/global-not-found.tsx` — the 404 for URLs that matched no
    // route. Required, not cosmetic: the root layout is `app/[locale]/layout.tsx`,
    // so an unrouted URL has no layout to render a nested `not-found.tsx` inside
    // and Next serves its built-in black 404 instead. Without this flag the file
    // is silently ignored (next-app-loader gates resolving it on the flag) and
    // the built-in page comes back.
    globalNotFound: true,
    // No `rootParams` flag: since Next 16.4 `next/root-params` is on by default
    // and the option is gone from the config type. The status pages still depend
    // on it: `not-found.tsx` / `forbidden.tsx` are handed no props by Next, so
    // without it the only way to learn the locale is `useParams()` in a Client
    // Component — which would ship all five message catalogues (~176 KB).
  },
  // The retired landing pages answer 404 from the beforeFiles rewrites in
  // rewrites().
  async redirects() {
    return [
      // The analytics dashboard lives on the estate host. `:path*` also matches
      // bare `/rea`, and Next carries the query: `/rea/?building=x` →
      // `${ANALYTICS}?building=x`.
      ...["/analytics", "/data", "/rea/:path*"].flatMap(path => [
        { source: path, destination: ANALYTICS, permanent: true },
        {
          source: `/:locale(${LOCALE_ALT})${path}`,
          destination: ANALYTICS,
          permanent: true,
        },
      ]),
      // Collapse the explicit /en/* form onto the unprefixed one so each page has
      // exactly one canonical URL. Cannot loop with the locale rewrite below:
      // this is external and matched against the incoming request, while the
      // rewrite is internal and never re-enters the redirect pipeline. Every
      // source here is itself /en-prefixed, so an unprefixed path never matches.
      //
      // Except the retired paths (see RETIRED_PATH): `/en/team` must answer 404
      // itself, not 308 to `/team` and 404 there.
      { source: "/en", destination: "/", permanent: true },
      {
        // The lookahead is on the source only; the destination is untouched.
        // `npm run redirects:check` asserts both halves against Next's own
        // matcher.
        source: `/en/:path(${NOT_COLLAPSED}.*)`,
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
  // The raw flake-built documents in public/ (whitepaper.*.html,
  // publications/*.html, *.pdf) duplicate the branded /publications routes that
  // compose them (shared/mfe RemoteDocument). Keep them fetchable — the routes
  // read/mount them — but out of the index as standalone URLs. Do NOT
  // robots.txt-Disallow instead: a noindex header only works on crawlable URLs.
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex" }];
    return [
      { source: "/whitepaper.:variant(dark|light).html", headers: noindex },
      {
        source: "/publications/:slug.:variant(dark|light).html",
        headers: noindex,
      },
      { source: "/whitepaper.pdf", headers: noindex },
      { source: "/publications/:slug.pdf", headers: noindex },
      // Section art under public/assets is served raw (the hero paints
      // quynhon_future as a CSS background, outside the next/image pipeline),
      // and Next's default for public/ is max-age=0 — a revalidation round trip
      // on every repeat visit for the largest above-the-fold byte. These
      // filenames are not content-hashed, so no `immutable`: a day of freshness
      // plus a month of stale-while-revalidate serves instantly and still picks
      // a replacement up in the background.
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=2592000",
          },
        ],
      },
      // Article covers and self-hosted footage. Unlike /assets these ARE
      // effectively immutable: a dispatch's media is written once by the blog
      // flake and a correction ships under a new slug, so a year is safe and
      // keeps the weak VPS out of the video path on repeat visits.
      {
        // `:file+`, not `:file*` — the star form makes the whole segment group
        // optional, so it also matched `/publications/<slug>` itself and pinned
        // every article page in caches for a year, immutably, defeating its
        // `dynamic = "force-dynamic"`.
        source: "/publications/:slug/:file+",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    // The VPS is weak and re-encoding is the expensive half of next/image.
    // Next's default TTL expires optimized variants within hours, so the same
    // team portraits get re-encoded all week; a month of on-disk cache means
    // each size is produced once.
    minimumCacheTTL: 2592000,
    // YouTube-backed dispatches fall back to YouTube's own thumbnail when the
    // article ships no local poster. Only the thumbnail host — the player is a
    // click-to-load iframe on youtube-nocookie.com, never an <Image>.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
  },
  async rewrites() {
    // Under a locale prefix the retired pages 404 too.
    const beforeFiles = [
      { source: `/:path(${RETIRED_PATH})`, destination: GONE },
      {
        source: `/:locale(${LOCALE_ALT})/:path(${RETIRED_PATH})`,
        destination: GONE,
      },
    ];
    // Serves the default locale at unprefixed paths, so no indexed English URL
    // moves and the site still ships no proxy.ts.
    //
    // MUST be `fallback`, and this is the one thing that is easy to get wrong
    // because the broken version half-works. Next's order is:
    //   redirects → beforeFiles → filesystem → afterFiles → DYNAMIC ROUTES → fallback
    // `afterFiles` runs before dynamic routes, and the whole app/[locale] tree IS
    // a dynamic route — so an afterFiles rule fires before [locale] is ever
    // tried, rewriting /ru/team to /en/ru/team (404) while /team still resolves
    // and hides the bug. `fallback` runs last, after dynamic routes have had
    // their chance, which is the semantics actually wanted. Verified on 16.2.9 in
    // dev and a production build.
    //
    // Inlined rather than `localeRewrites()` from @evinvest/i18n/next — same
    // reason as the Sentry exception below: this file is loaded as CJS, and the
    // package is ESM-only, so requiring the subpath dies with
    // ERR_PACKAGE_PATH_NOT_EXPORTED. The helper is still the source of truth for
    // app-side code (localeStaticParams in app/[locale]/layout.tsx); only the
    // config boundary has to restate it.
    //
    // The afterFiles rule is how English pages reach app/[locale] in ONE pass,
    // and since Next 16.4 the fallback alone is not enough. With only the
    // fallback, `/team` is first matched by the dynamic route as
    // `/[locale]` with locale "team"; `dynamicParams = false` 404s that, Next
    // bubbles a NoFallbackError and re-renders the same request as `/en/team`.
    // The first pass already validated the RSC `_rsc` hash and then deleted
    // the `Next-URL` request header (base-server `setVaryHeader`, our routes
    // are not interceptable), so the second pass recomputes the hash without
    // `Next-URL` and 307s to a hash the first pass will reject again — an
    // endless 307 loop on every English soft navigation (site_conductor#229).
    // `experimental.validateRSCRequestHeaders`, on by default since 16.4, is
    // the CDN cache-poisoning guard and stays on.
    //
    // The lookahead is what keeps this from being the broken afterFiles rule
    // described above: a locale-prefixed path never matches, so `/ru/team`
    // still reaches [locale] as itself. The other excluded roots are API space
    // and Next's own — they keep exactly the pre-16.4 path through the fallback,
    // which stays for them and for `/`. `.+` leaves `/` to the fallback too.
    // The locale list restates LOCALES from @evinvest/i18n (CJS boundary,
    // as above): a new locale must be added here or its pages 404.
    const unprefixed = [
      "en",
      "ru",
      "vi",
      "fr",
      "de",
      "api",
      "_next",
    ].join("|");
    return {
      beforeFiles,
      afterFiles: [
        {
          source: `/:path((?!(?:${unprefixed})(?:/|$)).+)`,
          destination: "/en/:path*",
        },
      ],
      fallback: [{ source: "/:path*", destination: "/en/:path*" }],
    };
  },
};

// Build-time Sentry integration (source-map upload + server instrumentation
// injection). This is the one Sentry seam that stays on `@sentry/nextjs`
// directly rather than `@evinvest/error-monitoring/next`'s `withSentry`: Next
// transpiles `next.config.ts` to CommonJS to load it, and the package is
// ESM-only (its `./next` export has no `require` condition), so a static import
// of it from the config can't resolve. `withSentry` is a 1:1 passthrough to
// `withSentryConfig`, so behaviour is identical. App/runtime code
// (`instrumentation.ts`, the providers) uses the package as ESM.
export default withSentryConfig(nextConfig, {
  org: config.sentryOrg,
  project: config.sentryProject,
  authToken: config.sentryAuthToken,
  silent: !config.isCi,
  widenClientFileUpload: true,
  sourcemaps: {
    // Delete local source maps after upload so they don't ship in the bundle.
    filesToDeleteAfterUpload: [".next/**/*.map"],
  },
});

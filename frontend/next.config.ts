import { execSync } from "node:child_process";
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

import { config } from "./config";

// The Nix/CI build injects NEXT_PUBLIC_BUILD_VERSION (the release tag). A bare
// `npm run dev` has no such env, so fall back to git so the footer still shows a
// version; "unknown" only when git is absent too (e.g. the hermetic sandbox,
// where the env var is always set anyway).
const git = (cmd: string, fallback: string) => {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch {
    return fallback;
  }
};

const buildVersion =
  config.public.buildVersion ?? git("git describe --tags --always", "unknown");
// Full SHA the footer link resolves to, kept separate from the display version.
const buildCommit = config.public.buildCommit || git("git rev-parse HEAD", "");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_VERSION: buildVersion,
    NEXT_PUBLIC_BUILD_COMMIT: buildCommit,
  },
  reactStrictMode: true,
  // The /rea zone is a Dioxus app under base_path "rea": its WebHistory strips
  // the "/rea" prefix, so `/rea/?q` → `/?q` (matches) but `/rea?q` → `?q` (route
  // parse fails). Next's default trailing-slash redirect turns `/rea/?q` into
  // `/rea?q`, breaking every deep link. Serve URLs as-is so the trailing slash
  // survives to the proxy — our own links never rely on the redirect.
  skipTrailingSlashRedirect: true,
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
  // The public landing moved to its own host (config.investOrigin); this
  // origin keeps only the coming-soon page, sign-in and the zones. Every
  // retired landing URL 301s there with its path — and its locale prefix —
  // kept, so inbound links, bookmarks and the indexed URLs carry over. 301
  // rather than `permanent` (308), as the migration plan specifies: every
  // source here is a page read with GET, so 308's method guarantee buys
  // nothing and 301 is the code every crawler and client handles the same.
  //
  // They precede the /en/* collapse so `/en/team` lands in one hop, not two.
  // The page code under app/[locale] stays in the tree and is simply never
  // reached; removing it is a separate change.
  async redirects() {
    const invest = config.investOrigin;
    // Restates LOCALES from @evinvest/i18n — same CJS boundary as `unprefixed`
    // in rewrites() below.
    const locale = "en|ru|vi|fr|de";
    const moved = [
      "publications",
      "team",
      "hiring",
      "contact",
      "privacy",
      "terms",
      "risk",
      "apps",
    ];
    const toInvest = (source: string, destination: string) => ({
      source,
      destination: `${invest}${destination}`,
      statusCode: 301 as const,
    });
    return [
      // Mails sent before concierge#150 link to `/notifications/{unsubscribe,
      // confirm}?token=…`; the account-less flow now lives under
      // `/api/auth/notifications/*` (forwarded to concierge by the rewrite
      // below). 308 keeps the method and body, so Gmail's one-click POST works;
      // Next carries the query string over. Ships only once concierge v0.17.0
      // (the target routes) is out.
      {
        source: "/notifications/:path*",
        destination: "/api/auth/notifications/:path*",
        permanent: true,
      },
      ...moved.flatMap(root => [
        toInvest(`/${root}/:path*`, `/${root}/:path*`),
        toInvest(
          `/:locale(${locale})/${root}/:path*`,
          `/:locale/${root}/:path*`
        ),
      ]),
      // The cabinet's pages move; its asset, API and MFE paths do not. The
      // account chip other surfaces mount (mfe-registry.json) and any open
      // cabinet tab keep loading through the beforeFiles rewrites until the
      // zone itself is retired from this host.
      toInvest("/cabinet", "/cabinet"),
      toInvest(
        "/cabinet/:path((?!(?:_next|api|mfe)(?:/|$)).*)",
        "/cabinet/:path*"
      ),
      toInvest(`/:locale(${locale})/cabinet/:path*`, "/:locale/cabinet/:path*"),
      // The two old shelves of /publications, and the raw whitepaper builds
      // the flake stages into public/.
      toInvest("/blogs/:path*", "/publications/:path*"),
      toInvest("/whitepaper", "/publications/whitepaper"),
      toInvest(
        "/:file(whitepaper\\.(?:pdf|dark\\.html|light\\.html))",
        "/:file"
      ),
      toInvest("/llms.txt", "/llms.txt"),
      // Collapse the explicit /en/* form onto the unprefixed one so each page has
      // exactly one canonical URL. Cannot loop with the locale rewrite below:
      // this is external and matched against the incoming request, while the
      // rewrite is internal and never re-enters the redirect pipeline. Every
      // source here is itself /en-prefixed, so an unprefixed path never matches.
      //
      // The cabinet is the one exception. The cabinet zone bounced an
      // unprefixed `/cabinet/*` to the reader's locale itself, so collapsing
      // `/en/cabinet/*` back answered that bounce with the path it just left —
      // `/cabinet/x` -> zone 307 -> `/en/cabinet/x` -> this 308 -> `/cabinet/x`
      // — an endless loop for every English reader. On this origin the
      // carve-out no longer fires: the `/:locale/cabinet/*` redirect to the
      // invest host above matches first.
      { source: "/en", destination: "/", permanent: true },
      {
        // The carve-out is a negative lookahead on the source only; the
        // destination is untouched. `(?:/|$)` keeps it to the whole segment, so
        // `/en/cabinets` — a different page — still collapses.
        // `npm run redirects:check` asserts both halves against Next's own
        // matcher.
        source: "/en/:path((?!cabinet(?:/|$)).*)",
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
      // AppShell assets are content-hashed by scripts/build-shell.mts — one
      // fetch, then cached across conductor pages and every zone.
      {
        source: "/shell/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
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
  // Multi-zone mounts (PATTERNS.md §9): asset/API traffic goes straight to the
  // zone over native rewrites; zone *HTML* goes through the shell-injecting
  // proxy route handlers (app/cabinet/…, app/rea/…) instead, which is
  // why these must be beforeFiles — a bare array is afterFiles, which would
  // shadow the catch-all handlers. Env unset ⇒ no rewrites and the handler
  // 404s, a deliberate "zone disabled" state. Cabinet *pages* never reach
  // app/cabinet any more: redirects() sends them to the invest host first.
  async rewrites() {
    const beforeFiles = [];
    const cabinet = config.cabinetZoneUrl?.replace(/\/+$/, "");
    if (cabinet) {
      beforeFiles.push(
        {
          source: "/cabinet/_next/:path*",
          destination: `${cabinet}/cabinet/_next/:path*`,
        },
        {
          source: "/cabinet/api/:path*",
          destination: `${cabinet}/cabinet/api/:path*`,
        },
        {
          source: "/cabinet/mfe/:path*",
          destination: `${cabinet}/cabinet/mfe/:path*`,
        },
        // Public contract of @evinvest/wallet: the scope hosts load
        // `/wallet/mfe/*` and open the popups at `/wallet/{pay,withdraw,move,
        // mandate}` on THIS origin. The cabinet serves them at its root (no
        // /cabinet prefix, see its own `/wallet/mfe` rewrite), so the path is
        // forwarded as-is. A rewrite keeps Origin and the CORS headers intact —
        // banking gates its money routes on `Origin == https://evinvest.ltd`.
        {
          source: "/wallet/:path*",
          destination: `${cabinet}/wallet/:path*`,
        }
      );
    }
    const rea = config.reaZoneUrl?.replace(/\/+$/, "");
    if (rea) {
      beforeFiles.push(
        {
          source: "/rea/assets/:path*",
          destination: `${rea}/rea/assets/:path*`,
        },
        {
          source: "/rea/api/:path*",
          destination: `${rea}/rea/api/:path*`,
        }
      );
    }
    // Auth is shell-owned but concierge-implemented: login/callback/session live
    // on THIS origin (cookies land first-party for every zone) and rewrite to the
    // concierge plane's auth web surface. Zones never run OAuth — they link to
    // /api/auth/login and verify the shared access-JWT cookie.
    //
    // KYC rides the SAME concierge web surface, so it reuses this one URL rather
    // than introducing a second env var for the same service. Two unlike shapes
    // pass through here:
    //   /api/kyc/start            — the browser's, carrying the shared session cookie
    //   /api/kyc/callback/:vendor — the provider's, server-to-server
    // The callback is what makes this rewrite load-bearing: the verification
    // vendor POSTs it from its own infrastructure, so it must be reachable on the
    // PUBLIC origin. Concierge authenticates that request by HMAC over the raw
    // body, never by a cookie — the absent session there is by design, not a hole.
    const auth = config.authWebUrl?.replace(/\/+$/, "");
    if (auth) {
      beforeFiles.push(
        { source: "/api/auth/:path*", destination: `${auth}/auth/:path*` },
        {
          source: "/api/callback/auth/:path*",
          destination: `${auth}/callback/auth/:path*`,
        },
        { source: "/api/kyc/:path*", destination: `${auth}/kyc/:path*` }
      );
    }
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
    // still reaches [locale] as itself. The other excluded roots are the
    // dynamic routes outside [locale] (app/cabinet, app/rea), API space and
    // Next's own — they keep exactly the pre-16.4 path through the fallback,
    // which stays for them and for `/`. `.+` leaves `/` to the fallback too.
    // The locale list restates LOCALES from @evinvest/i18n (CJS boundary,
    // as above): a new locale must be added here or its pages 404.
    const unprefixed = [
      "en",
      "ru",
      "vi",
      "fr",
      "de",
      "cabinet",
      "rea",
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

// The single point where this app reads its environment. Every other module
// imports from `config` instead of touching `process.env`, so the app's env
// surface is one typed object (and an ESLint rule bans process.env elsewhere).
//
// Access is lazy: `next build` evaluates next.config.ts (and imports its module
// graph) with the deploy env absent, so eager reads/throws would break the
// build. Each field is a getter that reads on first use, so a required var
// throws — naming itself — only when actually consumed.
//
// The client/server split is physical: NEXT_PUBLIC_* are the only vars Next
// inlines into browser bundles, so they live under `config.public` and are the
// only fields a Client Component may read. Everything else is server-only.
//
// NEXT_PUBLIC_* are read via STATIC member access on purpose: Next only inlines
// literal `process.env.NEXT_PUBLIC_X` references into the client bundle, so the
// getters below spell each name out rather than routing through a helper.

// `next build` evaluates with a deliberately partial env; only a running prod
// server must have these.
const isProdRuntime = () =>
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PHASE !== "phase-production-build";

function prodRequired(name: string): string | undefined {
  const value = process.env[name];
  if (!value && isProdRuntime()) throw new Error(`missing required env var ${name}`);
  return value || undefined;
}

function optional(value: string | undefined): string | undefined {
  return value || undefined;
}

export const config = {
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },
  get isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  },
  get isCi(): boolean {
    return !!process.env.CI;
  },
  get runtime(): string | undefined {
    return optional(process.env.NEXT_RUNTIME);
  },
  // Server-only override for Server Component fetches (internal/cluster origin).
  // Not NEXT_PUBLIC_, so never inlined into the browser bundle; the runtime
  // client falls back to the public API URL when unset — a dev-only state.
  get apiUrlInternal(): string | undefined {
    return prodRequired("API_URL_INTERNAL");
  },
  // Zone origins (multi-zone mounts; see PATTERNS.md §9). Unset ⇒ no rewrites
  // and the HTML proxy 404s instead of half-proxying — tolerable only in dev,
  // so prod asserts presence at boot.
  get cabinetZoneUrl(): string | undefined {
    return prodRequired("CABINET_ZONE_URL");
  },
  get reaZoneUrl(): string | undefined {
    return prodRequired("REA_ZONE_URL");
  },
  // The concierge plane's web surface. Auth is shell-owned: /api/auth/* and
  // /api/callback/auth/* on THIS origin rewrite there, so session cookies land
  // first-party for every zone. /api/kyc/* rewrites there too — identity
  // verification is owned by the same plane and served by the same process, so
  // it shares this URL instead of a second env var pointing at one service.
  // Unset ⇒ no rewrites ⇒ auth AND kyc disabled (dev-only). The name stayed
  // AUTH_WEB_URL: it is already deployed, and renaming it buys nothing.
  get authWebUrl(): string | undefined {
    return prodRequired("AUTH_WEB_URL");
  },
  // Where the public landing lives now that this origin only serves the
  // coming-soon page: every retired landing path 301s here with its path kept.
  // BUILD-TIME: redirects() is captured into the routes manifest, so a new
  // origin needs a rebuild. Defaulted rather than prodRequired because the
  // production value is the default — the env exists for staging and dev.
  get investOrigin(): string {
    return (
      optional(process.env.INVEST_ORIGIN) ?? "https://invest.evinvest.ltd"
    ).replace(/\/+$/, "");
  },
  // Server/edge Sentry environment tag (instrumentation.ts).
  get appEnv(): string | undefined {
    return optional(process.env.APP_ENV);
  },
  get sentryDsn(): string | undefined {
    return optional(process.env.SENTRY_DSN);
  },
  get sentryOrg(): string | undefined {
    return optional(process.env.SENTRY_ORG);
  },
  get sentryProject(): string | undefined {
    return optional(process.env.SENTRY_PROJECT);
  },
  get sentryAuthToken(): string | undefined {
    return optional(process.env.SENTRY_AUTH_TOKEN);
  },
  // Browser-visible env (NEXT_PUBLIC_*): the only fields Client Components may
  // read, inlined at build time.
  public: {
    // Public API origin. Topology owned by flake.nix, which always exports it
    // (dev run and container build alike) — a missing value is a broken launch.
    // Static member access is load-bearing here (see header): routed through a
    // `process.env[name]` helper, the browser bundle keeps the dynamic lookup,
    // finds an empty env shim, and throws on hydration.
    get apiUrl(): string {
      if (!process.env.NEXT_PUBLIC_API_URL)
        throw new Error("missing required env var NEXT_PUBLIC_API_URL");
      return process.env.NEXT_PUBLIC_API_URL;
    },
    // Canonical production origin. The dev launch omits it (metadataBase
    // tolerates a relative base); the prod server refuses to boot without it.
    get siteUrl(): string | undefined {
      if (!process.env.NEXT_PUBLIC_SITE_URL && isProdRuntime())
        throw new Error("missing required env var NEXT_PUBLIC_SITE_URL");
      return optional(process.env.NEXT_PUBLIC_SITE_URL);
    },
    // REA backend origin advertised to the MFE bundle. Same prod contract.
    get reaUrl(): string | undefined {
      if (!process.env.NEXT_PUBLIC_REA_URL && isProdRuntime())
        throw new Error("missing required env var NEXT_PUBLIC_REA_URL");
      return optional(process.env.NEXT_PUBLIC_REA_URL);
    },
    get buildVersion(): string | undefined {
      return optional(process.env.NEXT_PUBLIC_BUILD_VERSION);
    },
    get buildCommit(): string | undefined {
      return optional(process.env.NEXT_PUBLIC_BUILD_COMMIT);
    },
    get analyticsEndpoint(): string | undefined {
      return optional(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT);
    },
    get analyticsWebsiteId(): string | undefined {
      return optional(process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID);
    },
    // PostHog project key/host, passed to <PostHogProvider> as props: the lib's
    // own env fallback is a dynamic `process.env[name]` read, which the browser
    // bundle resolves to undefined — so without these getters the provider is a
    // no-op even with the key in the build env. Unset ⇒ no-op sink.
    get posthogKey(): string | undefined {
      return optional(process.env.NEXT_PUBLIC_POSTHOG_KEY);
    },
    get posthogHost(): string | undefined {
      return optional(process.env.NEXT_PUBLIC_POSTHOG_HOST);
    },
  },
} as const;

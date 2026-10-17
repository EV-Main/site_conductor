import { Suspense, type ReactNode } from "react";
import Script from "next/script";
import type { Locale } from "@evinvest/i18n";
import { I18nProvider } from "@evinvest/i18n/react";
import { messagesFor } from "@/shared/config/i18n";
import { fontInter, fontPlayfair } from "@/application/styles/fonts";
import { Providers } from "@/application/providers";
import { ErrorMonitoringProvider } from "@/features/error-monitoring";
import { PostHogProvider, PostHogPageView } from "@/features/analytics";
import { DevAbPanel } from "@/features/ab-variant";
import { config } from "@/config";
import shell from "@/public/shell/manifest.json";
import { spanEnterScript } from "@/scripts/span-enter";
import { localeCookieScript } from "@/scripts/locale-cookie";
import { Header } from "./header";
import { HeaderAccountSlot, MenuAccountSlot } from "./account-chip-remote";
import { Footer } from "./footer";
import { DarkReaderHydrationFilter } from "./dark-reader-hydration-filter";
import "@/application/styles/globals.css";
// Imported here rather than @import-ed from globals.css: Tailwind v4 owns the
// @import graph in that file and drops a plain relative sheet on the floor —
// silently, which cost an afternoon. As a module import it is Next's to bundle,
// and the same file is read verbatim by scripts/build-shell.mts for zones, so
// both hosts animate identical distances from one source.
import "@/application/styles/header-span.css";

const analyticsEndpoint = config.public.analyticsEndpoint;
const analyticsWebsiteId = config.public.analyticsWebsiteId;

// THE document. Every HTML response this app serves is this tree — the routed
// pages through `app/[locale]/layout.tsx`, and the unrouted 404 through
// `app/global-not-found.tsx`, which Next renders *instead of* the root layout
// and which therefore has to build its own `<html>`. Two callers, one shell:
// the reason the old bare-Next 404 existed at all is that the shell lived
// inline in the layout, where nothing outside the `[locale]` tree could reach
// it. Keep it that way — a page that renders chrome renders it from here.
//
// `chrome={false}` drops the landing header and footer (and the header's own
// scripts) while keeping the document, providers and analytics: the
// coming-soon origin renders no navigation, but zones keep the shell header
// the proxy injects from public/shell, which this prop does not touch.
export function SiteDocument({
  locale,
  chrome = true,
  children,
}: {
  locale: Locale;
  chrome?: boolean;
  children: ReactNode;
}) {
  return (
    <html
      lang={locale}
      className={`dark ${fontInter.variable} ${fontPlayfair.variable}`}
      suppressHydrationWarning
    >
      {/* eslint-disable-next-line @next/next/no-head-element -- `next/head` is
          Pages-Router only; in the App Router a document renders its own <head>.
          The rule exempts files under app/ by path, and this one lives in
          application/ because two routes render it. */}
      <head>
        {/* Runs before the first paint — a deferred script would land after the
            paint it exists to precede, which is precisely why the bar used to
            snap instead of narrowing on the way back from a zone. Inline and
            un-deferred for that reason alone; it reads one sessionStorage key
            and sets one attribute. */}
        {chrome && (
          <script
            dangerouslySetInnerHTML={{ __html: spanEnterScript("site") }}
          />
        )}
        {/* Mirrors this document's locale into the cookie the cabinet zone
            reads when an unprefixed /cabinet/* entry has to be resolved to a
            real /{locale}/cabinet/* URL. Pre-paint and un-deferred because the
            account chip in the header is clickable as soon as the header
            paints. See scripts/locale-cookie.ts for the cookie contract. */}
        <script
          dangerouslySetInnerHTML={{ __html: localeCookieScript(locale) }}
        />
        {/* Replays the last confirmed session state onto the header root
            before the first paint, so a signed-in reader does not see the
            signed-out pair while /api/auth/session is in flight. The same
            bytes the zone proxy loads by URL — inlined here because this
            document has no nonce CSP to satisfy and the file is a few hundred
            bytes on the critical path. See scripts/session-stamp.ts. */}
        {chrome && (
          <script dangerouslySetInnerHTML={{ __html: shell.sessionInline }} />
        )}
      </head>
      <body>
        {/* The header's one behavior implementation — the same content-hashed
            script the zone proxy injects (BrandHeader ships no React state). */}
        {chrome && <Script defer src={shell.js} strategy="afterInteractive" />}
        <DarkReaderHydrationFilter />
        <ErrorMonitoringProvider>
          {/* English is authored inline at each call site, so an `en` reader
              needs no catalogue serialised into the RSC payload at all. */}
          <I18nProvider
            locale={locale}
            messages={locale === "en" ? {} : messagesFor(locale)}
          >
            <Providers>
              {/* capturePageview=false: PostHogPageView owns every $pageview
                (initial + App Router soft navigations), so the provider must not
                also fire the initial one. Suspense is required by
                useSearchParams. Key/host are passed explicitly: the lib's env
                fallback is a dynamic process.env read that the browser bundle
                cannot resolve (config.ts header). */}
              <PostHogProvider
                capturePageview={false}
                apiKey={config.public.posthogKey}
                host={config.public.posthogHost}
              >
                <Suspense fallback={null}>
                  <PostHogPageView />
                </Suspense>
                {chrome && (
                  <Header
                    locale={locale}
                    accountSlot={<HeaderAccountSlot locale={locale} />}
                    mobileAccountSlot={<MenuAccountSlot locale={locale} />}
                  />
                )}
                {children}
                {chrome && <Footer />}
              </PostHogProvider>
              <DevAbPanel />
            </Providers>
          </I18nProvider>
        </ErrorMonitoringProvider>
        {analyticsEndpoint && analyticsWebsiteId && (
          <Script
            defer
            src={`${analyticsEndpoint}/umami`}
            data-website-id={analyticsWebsiteId}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}

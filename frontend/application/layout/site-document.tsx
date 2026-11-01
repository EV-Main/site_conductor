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
import { DarkReaderHydrationFilter } from "./dark-reader-hydration-filter";
import "@/application/styles/globals.css";

const analyticsEndpoint = config.public.analyticsEndpoint;
const analyticsWebsiteId = config.public.analyticsWebsiteId;

// THE document. Every HTML response this app serves is this tree — the routed
// pages through `app/[locale]/layout.tsx`, and the unrouted 404 through
// `app/global-not-found.tsx`, which Next renders *instead of* the root layout
// and which therefore has to build its own `<html>`. Two callers, one shell:
// the reason the old bare-Next 404 existed at all is that the shell lived
// inline in the layout, where nothing outside the `[locale]` tree could reach
// it.
export function SiteDocument({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <html
      lang={locale}
      className={`dark ${fontInter.variable} ${fontPlayfair.variable}`}
      suppressHydrationWarning
    >
      <body>
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
                {children}
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

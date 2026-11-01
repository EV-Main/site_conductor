import type { ComponentType } from "react";
import type { Locale } from "@evinvest/i18n";
import { localeMetadata } from "@/shared/seo/locale-metadata";
import type { MetaNamespace } from "@/shared/seo/locale-metadata";
import { LEGAL_CONTENT_LOCALES } from "@/shared/config/site";

// The three legal routes (/terms, /privacy, /risk) are pure Next.js ceremony
// around one View each: resolve the route locale, render the View, and expose a
// generateMetadata whose canonical carries the locale prefix while the
// alternates stay pinned to LEGAL_CONTENT_LOCALES (the body is English-only).
// Only the namespace and the View differ, so the ceremony lives here once
// rather than as three copies that drift — and qlty stops flagging the routes
// as duplicated. Each page.tsx re-exports the two members App Router requires as
// its own module exports.

type LegalView = ComponentType<{ locale: Locale }>;

// The namespace doubles as the locale-free path: /terms, /privacy, /risk.
export function legalRoute(
  ns: Extract<MetaNamespace, "terms" | "privacy" | "risk">,
  View: LegalView
) {
  const generateMetadata = localeMetadata(ns, `/${ns}`, LEGAL_CONTENT_LOCALES);

  async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return <View locale={locale as Locale} />;
  }

  return { generateMetadata, Page };
}

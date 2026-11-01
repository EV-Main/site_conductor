import type { Locale } from "@evinvest/i18n";
import { ContactView } from "@/views/contact";
import { localeMetadata } from "@/shared/seo/locale-metadata";

// generateMetadata only so the canonical carries the locale prefix — see
// app/[locale]/team/page.tsx.
export const generateMetadata = localeMetadata("contact", "/contact");

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ContactView locale={locale as Locale} />;
}

import type { Locale } from "@evinvest/i18n";
import { TeamPageView } from "@/views/team";
import { localeMetadata } from "@/shared/seo/locale-metadata";

// generateMetadata, not a static `metadata`, only so the canonical can carry the
// locale prefix — the page itself still takes no request data and prerenders for
// every locale via the layout's generateStaticParams.
export const generateMetadata = localeMetadata("team", "/team");

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <TeamPageView locale={locale as Locale} />;
}

import { DEFAULT_LOCALE, isLocale } from "@evinvest/i18n";
import { translate } from "@/shared/config/i18n";
import { Container } from "@evinvest/uikit";

import { DocumentReader } from "@/shared/ui/document-reader";
import { metadataFor } from "@/shared/seo/locale-metadata";
import { PageGraph } from "@/shared/seo/page-graph";

// Not `localeMetadata` like the other static pages: this one overrides
// `robots`, so it needs the Metadata itself rather than the bare shape the
// factory returns.
//
// The page was shipping `robots: index, follow` with a self-canonical while
// being excluded from the sitemap AND from ROUTES for the opposite reason (see
// shared/config/site.ts): its body mounts client-side in a shadow root, so
// there is no text in the SSR HTML for a crawler to index — a thin page
// advertised as indexable. `noindex` makes the metadata agree with the
// sitemap/ROUTES exclusion instead of contradicting it; `follow` stays true so
// its outbound links (the PDF download, the way back to /publications) still
// pass link equity.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = metadataFor(locale, "whitepaper", "/publications/whitepaper");
  return { ...base, robots: { index: false, follow: true } };
}

// Filed under /publications with the research it underpins, but it is not a
// blog-flake article: it has its own flake and lands at public/whitepaper.*, so
// it keeps a static route of its own rather than resolving through [slug].
//
// It ships complete styles (bare-tag selectors, its own fonts), so it mounts
// isolated in a shadow root (`isolate`) instead of taking the host's prose.
// That is also why it stays out of the sitemap — see shared/config/site.ts.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const t = translate(resolved);
  return (
    <>
      {/* The body is shadow-mounted and so unreadable to a crawler (which is
          why this URL stays out of the sitemap), but the page still exists and
          is linked — the graph at least gives it an identity and a trail rather
          than leaving a blank in the site's structure. */}
      <PageGraph
        path="/publications/whitepaper"
        name={t("whitepaper.name", "Whitepaper")}
        description={t(
          "meta.whitepaper.description",
          "EV Investment whitepaper — our institutional thesis on coastal real estate in Quy Nhơn, Vietnam."
        )}
        trail={[
          {
            name: t("nav.publications", "Publications"),
            path: "/publications",
          },
          {
            name: t("whitepaper.name", "Whitepaper"),
            path: "/publications/whitepaper",
          },
        ]}
      />
      <DocumentReader
        title={t("whitepaper.title", "EV Investment Whitepaper")}
        downloadLabel={t("publications.downloadPdf", "download the PDF")}
        downloadAriaLabel={t(
          "document.downloadAria",
          "Download {title} as PDF",
          {
            title: t("whitepaper.title", "EV Investment Whitepaper"),
          }
        )}
        htmlSrc="/whitepaper.dark.html"
        pdfSrc="/whitepaper.pdf"
        isolate
        fallback={
          <Container className="py-24 text-ink/60">
            {t(
              "whitepaper.loading",
              "Loading the whitepaper… if it doesn't appear,"
            )}{" "}
            <a href="/whitepaper.pdf" className="text-primary-ink underline">
              {t("publications.downloadPdf", "download the PDF")}
            </a>
            .
          </Container>
        }
      />
    </>
  );
}

import { Container } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";

import {
  hasTranslatedDocument,
  toPlateCover,
  type Publication,
} from "@/entities/publication";
import { DocumentReader } from "@/shared/ui/document-reader";
import { MediaPlate } from "@/shared/ui/media-plate";
import { translate } from "@/shared/config/i18n";

import { pdfHref } from "../model/presentation";
import { PublicationArticleHeader } from "./publication-article-header";
import { PublicationStructuredData } from "./publication-structured-data";

/**
 * An article is a header, at most one cover, and the compiled document.
 *
 * The cover is a property of the publication, declared in its manifest — it is
 * deliberately NOT embedded in the typst source. That is what keeps the whole
 * document pipeline (lib.typ, RemoteDocument, the PDF) untouched by media: the
 * document below never contains a `<figure>` we have to parse or hydrate.
 */
export function PublicationArticleView({
  publication,
  locale,
}: {
  publication: Publication;
  locale: Locale;
}) {
  const t = translate(locale);
  const cover = toPlateCover(publication);

  return (
    <main className="min-h-screen bg-background pt-32 text-ink">
      <PublicationStructuredData publication={publication} />
      <Container>
        <PublicationArticleHeader publication={publication} locale={locale} />

        {cover && (
          <div className="mt-12">
            <MediaPlate
              cover={cover}
              size="wide"
              caption={publication.cover?.caption}
              plateLabel={t("publications.plate", "Plate {n}", { n: "01" })}
              className="mx-auto"
            />
          </div>
        )}
      </Container>

      {/* Sits exactly at the seam: everything above is translated card copy,
          everything below is the compiled report, which is English. Saying so
          here is what keeps the translated heading from implying a translated
          document — and it disappears on its own once the blog build publishes
          a translated document and declares it in `locales`. */}
      {!hasTranslatedDocument(publication, locale) && (
        <Container>
          <p
            role="note"
            className="mx-auto mt-12 max-w-3xl border-t border-ink/12 pt-5 text-xs text-ink/55"
          >
            {t(
              "publications.documentInEnglish",
              "This summary is translated; the report itself is in English."
            )}
          </p>
        </Container>
      )}

      <DocumentReader
        title={publication.title}
        // PublicationArticleHeader above already rendered the page's visible
        // <h1> (the title) — the reader's own sr-only one would be a second.
        renderHeading={false}
        downloadLabel={t("publications.downloadPdf", "download the PDF")}
        downloadAriaLabel={t(
          "document.downloadAria",
          "Download {title} as PDF",
          {
            title: publication.title,
          }
        )}
        htmlSrc={`/publications/${publication.slug}.dark.html`}
        pdfSrc={pdfHref(publication)}
        bodyClassName="prose prose-invert mx-auto max-w-3xl px-6 py-16 prose-headings:font-serif-display prose-headings:text-white prose-a:text-primary-ink prose-strong:text-ink"
        fallback={
          <p className="mx-auto max-w-3xl px-6 py-16 text-ink/60">
            {t(
              "publications.unavailable",
              "This publication isn’t available right now —"
            )}{" "}
            <a
              href={pdfHref(publication)}
              className="text-primary-ink underline"
            >
              {t("publications.downloadPdf", "download the PDF")}
            </a>
            .
          </p>
        }
      />
    </main>
  );
}

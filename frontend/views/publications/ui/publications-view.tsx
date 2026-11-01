import { Container } from "@evinvest/uikit";
import type { Locale } from "@evinvest/i18n";

import { publicationsFor, type Publication } from "@/entities/publication";

import { Masthead } from "./masthead";
import { PublicationIndex } from "./publication-index";
import { PublicationsStructuredData } from "./publications-structured-data";

/// Full article bodies are the search corpus, and the search runs in the
/// browser — so the whole corpus crosses the wire. Capped per entry: a few
/// hundred words carry the terms anyone actually searches for, while an
/// uncapped catalogue of 60-page reports would be a multi-megabyte payload on a
/// marketing page. Raise this only with a measurement to justify it.
const SEARCH_TEXT_BUDGET = 4_000;

function forClient(publication: Publication): Publication {
  const text = publication.text;
  if (text === undefined || text.length <= SEARCH_TEXT_BUDGET) {
    return publication;
  }
  return { ...publication, text: text.slice(0, SEARCH_TEXT_BUDGET) };
}

export function PublicationsView({ locale }: { locale: Locale }) {
  const publications = publicationsFor(locale);
  const counts = {
    fieldNote: publications.filter(p => p.kind === "field-note").length,
    research: publications.filter(p => p.kind === "research").length,
    whitepaper: publications.filter(p => p.kind === "whitepaper").length,
  };

  return (
    <main className="min-h-screen bg-background pt-32 pb-28 text-ink">
      <PublicationsStructuredData />
      <Container>
        <Masthead
          locale={locale}
          fieldNoteCount={counts.fieldNote}
          researchCount={counts.research}
          whitepaperCount={counts.whitepaper}
          updatedAt={publications[0]?.date}
        />
        <div className="mt-10">
          <PublicationIndex
            publications={publications.map(forClient)}
            locale={locale}
          />
        </div>
      </Container>
    </main>
  );
}

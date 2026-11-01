import {
  coverStill,
  type Publication,
  type PublicationKind,
} from "@/entities/publication";
import { PageGraph } from "@/shared/seo/page-graph";
import {
  ldAbs,
  ldCompact,
  ORG_ID,
  type JsonLdNode,
} from "@/shared/seo/json-ld";

// Per-article graph: the Article itself, the WebPage it sits on, and the
// breadcrumb trail that replaces the raw URL in a result. The organization is
// referenced by @id (never restated) so Google folds every article under the
// one publisher entity built on the homepage.

// A research report is a Report; a field note is reportage. Both are Articles,
// and the narrower @type is what earns the richer treatment.
const ARTICLE_TYPE: Record<PublicationKind, string> = {
  research: "Report",
  "field-note": "Article",
  whitepaper: "Report",
};

function articleNode(publication: Publication): JsonLdNode {
  const path = `/publications/${publication.slug}`;
  const still = coverStill(publication);

  return ldCompact({
    "@type": ARTICLE_TYPE[publication.kind],
    "@id": `${ldAbs(path)}#article`,
    headline: publication.title,
    description: publication.dek,
    // The catalogue carries one real date. `dateModified` is deliberately
    // absent rather than mirrored from it: a corrected article ships under a
    // new slug here, so a modified stamp would always be a restatement.
    datePublished: publication.date,
    articleSection: publication.category,
    // Only ever a real name — an absent author stays absent, never "EV Staff".
    author: publication.author
      ? ldCompact({
          "@type": "Person",
          name: publication.author,
          jobTitle: publication.role,
        })
      : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    image: still ? ldAbs(still.url) : undefined,
    // Reading time is editorial metadata the catalogue already tracks.
    timeRequired: publication.readingMinutes
      ? `PT${publication.readingMinutes}M`
      : undefined,
    // No paywall, no registration — say so explicitly; it is a ranking-relevant
    // fact for research content and cheap to state truthfully.
    isAccessibleForFree: true,
    inLanguage: "en",
    mainEntityOfPage: { "@id": ldAbs(path) },
  });
}

export function PublicationStructuredData({
  publication,
}: {
  publication: Publication;
}) {
  const path = `/publications/${publication.slug}`;

  // PageGraph carries the Organization node the Article's `publisher` (and, for
  // an unbylined piece, its `author`) resolves against — without it in this
  // same document the reference dangles and Google drops the Article result.
  return (
    <PageGraph
      path={path}
      name={publication.title}
      description={publication.dek}
      trail={[
        { name: "Publications", path: "/publications" },
        { name: publication.title, path },
      ]}
      nodes={[articleNode(publication)]}
    />
  );
}

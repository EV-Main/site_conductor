import { allPublications } from "@/entities/publication";
import { PageGraph } from "@/shared/seo/page-graph";
import { ldAbs, ORG_ID } from "@/shared/seo/json-ld";

const PATH = "/publications";
const NAME = "Field Notes & Research";
const DESCRIPTION =
  "EV Investment publications — field notes filmed in Quy Nhơn and institutional research on Vietnam coastal real estate.";

// The hub as a CollectionPage over an ItemList of the articles, newest first
// (PUBLICATIONS is date-descending — see entities/publication/model/catalogue).
// The list carries only positions, URLs and titles: each article's own page
// holds the full Article node, and restating it here would duplicate it.
//
// The whitepaper is excluded to match the sitemap and ROUTES: its body mounts
// in a shadow root, so there is no indexable text behind that URL to list.
export function PublicationsStructuredData() {
  const entries = allPublications().filter(
    publication => publication.kind !== "whitepaper"
  );

  return (
    <PageGraph
      path={PATH}
      name={NAME}
      description={DESCRIPTION}
      type="CollectionPage"
      trail={[{ name: "Publications", path: PATH }]}
      webPageExtras={{
        about: { "@id": ORG_ID },
        mainEntity: {
          "@type": "ItemList",
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: entries.length,
          itemListElement: entries.map((publication, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: ldAbs(`/publications/${publication.slug}`),
            name: publication.title,
          })),
        },
      }}
    />
  );
}

import type { VacancySummary } from "@/entities/vacancy";
import { PageGraph } from "@/shared/seo/page-graph";
import { ldAbs, ORG_ID } from "@/shared/seo/json-ld";

const PATH = "/hiring";
const NAME = "Hiring";
const DESCRIPTION =
  "Open roles at EV Investment across investment, development, client advisory and operations.";

// The board as a CollectionPage over an ItemList pointing at each role page.
// Deliberately NOT a list of JobPosting nodes: Google wants exactly one
// JobPosting per URL, on the role's own page (see vacancy-structured-data), and
// repeating them here would be a duplicate posting for every role.
export function HiringStructuredData({
  vacancies,
}: {
  vacancies: VacancySummary[];
}) {
  return (
    <PageGraph
      path={PATH}
      name={NAME}
      description={DESCRIPTION}
      type="CollectionPage"
      trail={[{ name: NAME, path: PATH }]}
      webPageExtras={{
        about: { "@id": ORG_ID },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: vacancies.length,
          itemListElement: vacancies.map((vacancy, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: ldAbs(`/hiring/${vacancy.slug}`),
            name: vacancy.title,
          })),
        },
      }}
    />
  );
}

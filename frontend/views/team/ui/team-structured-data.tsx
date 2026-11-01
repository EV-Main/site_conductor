import type { Locale } from "@evinvest/i18n";

import { teamPersonNodes } from "@/entities/team";
import { PageGraph } from "@/shared/seo/page-graph";
import { ORG_ID } from "@/shared/seo/json-ld";

const PATH = "/team";
const NAME = "Team";
const DESCRIPTION =
  "The cross-border investment, risk and development team behind EV Investment.";

// /team is the canonical page for the people entities the homepage also lists —
// same Person @ids (see entities/team/seo), so the two pages reinforce one set
// of entities instead of competing. AboutPage (not a bare WebPage) is what tells
// Google the page is *about* the organization rather than merely mentioning it.
export function TeamStructuredData({ locale }: { locale: Locale }) {
  const people = teamPersonNodes(locale);
  const refs = people.map(person => ({ "@id": person["@id"] }));

  return (
    <PageGraph
      path={PATH}
      name={NAME}
      description={DESCRIPTION}
      type="AboutPage"
      trail={[{ name: NAME, path: PATH }]}
      webPageExtras={{ about: { "@id": ORG_ID }, mainEntity: refs }}
      organizationExtras={{ employee: refs }}
      nodes={people}
    />
  );
}

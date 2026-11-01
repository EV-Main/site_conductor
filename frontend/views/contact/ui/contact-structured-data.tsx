import { OFFICES } from "@/shared/config/site";
import { officeNode } from "@/shared/seo/office";
import { PageGraph } from "@/shared/seo/page-graph";
import { ORG_ID } from "@/shared/seo/json-ld";

const PATH = "/contact";
const NAME = "Contact";
const DESCRIPTION =
  "Reach EV Investment — Quy Nhơn head office and Ho Chi Minh City representative office.";

// ContactPage carrying both LocalBusiness offices. These are the same office
// @ids the homepage emits (shared/seo/office), so the addresses reinforce one
// pair of locations rather than reading as four. Phone numbers and geo
// coordinates flow in automatically once OFFICES carries them — until then
// ldCompact omits the fields instead of shipping blanks.
export function ContactStructuredData() {
  const offices = OFFICES.map(officeNode);

  return (
    <PageGraph
      path={PATH}
      name={NAME}
      description={DESCRIPTION}
      type="ContactPage"
      trail={[{ name: NAME, path: PATH }]}
      webPageExtras={{ about: { "@id": ORG_ID } }}
      organizationExtras={{
        subOrganization: offices.map(office => ({ "@id": office["@id"] })),
      }}
      nodes={offices}
    />
  );
}

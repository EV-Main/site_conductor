import { SITE, type Office } from "@/shared/config/site";
import { ldCompact, ldId, LOGO_ID, ORG_ID, type JsonLdNode } from "./json-ld";

// Office nodes, shared by the homepage graph and /contact. Both pages list the
// same two locations, so they must emit the same @ids and byte-identical
// addresses — inconsistent NAP (name/address/phone) across a site is a
// well-known local-SEO penalty, and duplicating the builder is how it starts.

export const officeId = (office: Office) => ldId(`#office-${office.id}`);

export function postalAddressNode(office: Office): JsonLdNode {
  return ldCompact({
    "@type": "PostalAddress",
    streetAddress: office.streetAddress,
    addressLocality: office.addressLocality,
    addressRegion: office.addressRegion,
    postalCode: office.postalCode,
    addressCountry: office.addressCountry,
  });
}

export function officeNode(office: Office): JsonLdNode {
  return ldCompact({
    "@type": "LocalBusiness",
    "@id": officeId(office),
    name: `${SITE.name} — ${office.name}`,
    parentOrganization: { "@id": ORG_ID },
    url: `${SITE.url}/`,
    image: { "@id": LOGO_ID },
    address: postalAddressNode(office),
    telephone: office.telephone,
    geo: office.geo
      ? {
          "@type": "GeoCoordinates",
          latitude: office.geo.lat,
          longitude: office.geo.lng,
        }
      : undefined,
  });
}

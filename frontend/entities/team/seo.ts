import { DEFAULT_LOCALE, type Locale } from "@evinvest/i18n";

import { ldAbs, ldCompact, ldId, ORG_ID } from "@/shared/seo/json-ld";
import type { JsonLdNode } from "@/shared/seo/json-ld";
import { translate } from "@/shared/config/i18n";

import { team } from "./model";

// Person nodes, shared by the homepage graph and /team.
//
// Both pages must emit the *same* @ids: two pages describing the same people
// under different identifiers is how one person becomes two entities in
// Google's index. Deriving the id here — rather than in each view — is what
// guarantees they match.

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const personId = (name: string) => ldId(`#person-${slug(name)}`);

/// Placeholder rows (names still marked TODO) are excluded: a half-filled
/// Person node is a worse signal than no node at all.
///
/// `locale` decides the language of `jobTitle`/`description` only — the @ids are
/// derived from the (untranslated) name, so every locale's graph describes the
/// same entities rather than minting a new person per language.
export function teamPersonNodes(locale: Locale = DEFAULT_LOCALE): JsonLdNode[] {
  return team(translate(locale))
    .filter(member => !/\btodo\b/i.test(member.name))
    .map(member =>
      ldCompact({
        "@type": "Person",
        "@id": personId(member.name),
        name: member.name,
        jobTitle: member.role,
        description: member.bio,
        image: ldAbs(member.photo),
        worksFor: { "@id": ORG_ID },
        // The team page is where each person is described in full, so it is the
        // canonical page for the entity even though the homepage also lists them.
        // A plain URL, not a {"@id"} reference: these nodes also render on the
        // homepage, where no /team WebPage node exists for a reference to resolve
        // against. mainEntityOfPage accepts a URL, so this is valid on both.
        mainEntityOfPage: ldAbs("/team"),
      })
    );
}

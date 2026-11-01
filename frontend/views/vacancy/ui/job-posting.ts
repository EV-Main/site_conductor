import type { Locale } from "@evinvest/i18n";

import { translate } from "@/shared/config/i18n";
import { OFFICES } from "@/shared/config/site";
import { type VacancyDetail, teamLabels } from "@/entities/vacancy";
import {
  ldAbs,
  ldCompact,
  ORG_ID,
  type JsonLdNode,
} from "@/shared/seo/json-ld";

// JobPosting — the one schema on this site that unlocks a *distribution
// channel* rather than a nicer snippet: valid postings become eligible for the
// jobs experience in Search, which surfaces roles to people who never visit the
// site. Everything below comes from VacancyDetail; nothing is invented.

// schema.org's employmentType is a fixed vocabulary, and the backend sends a
// human label ("Full-time"). Normalise rather than pass the label through — an
// unrecognised value is worse than an omitted one, so no match ⇒ omitted.
const EMPLOYMENT_TYPES: Array<[RegExp, string]> = [
  [/full[\s-]?time/i, "FULL_TIME"],
  [/part[\s-]?time/i, "PART_TIME"],
  [/contract|freelance/i, "CONTRACTOR"],
  [/tempor/i, "TEMPORARY"],
  [/intern/i, "INTERN"],
  [/volunteer/i, "VOLUNTEER"],
];

function employmentType(label: string): string | undefined {
  return EMPLOYMENT_TYPES.find(([pattern]) => pattern.test(label))?.[1];
}

// The backend sends free text ("Quy Nhơn, Vietnam"). When it names one of our
// real offices, use that office's full postal address — a complete address is
// what makes a posting eligible for location-filtered job search. Otherwise
// carry the text through as the locality alone and let the country stay absent
// rather than guessing "VN" for what might be a remote role.
function jobLocation(location: string): JsonLdNode {
  const office = OFFICES.find(candidate =>
    location.toLowerCase().includes(candidate.addressLocality.toLowerCase())
  );
  return {
    "@type": "Place",
    address: office
      ? ldCompact({
          "@type": "PostalAddress",
          streetAddress: office.streetAddress,
          addressLocality: office.addressLocality,
          addressRegion: office.addressRegion,
          postalCode: office.postalCode,
          addressCountry: office.addressCountry,
        })
      : { "@type": "PostalAddress", addressLocality: location },
  };
}

// Google wants the *complete* posting as `description`, and accepts HTML. The
// page already renders these sections; this assembles the same content into the
// single field the schema expects.
function description(vacancy: VacancyDetail): string {
  const section = (heading: string, items: string[]) =>
    items.length
      ? `<h3>${heading}</h3><ul>${items.map(item => `<li>${item}</li>`).join("")}</ul>`
      : "";

  return [
    `<p>${vacancy.summary}</p>`,
    vacancy.about ? `<p>${vacancy.about}</p>` : "",
    section("Responsibilities", vacancy.responsibilities),
    section("Requirements", vacancy.requirements),
    section("Nice to have", vacancy.nice_to_have),
    section("What we offer", vacancy.offer),
  ].join("");
}

export function jobPostingNode(
  vacancy: VacancyDetail,
  locale: Locale
): JsonLdNode {
  const t = translate(locale);
  const path = `/hiring/${vacancy.slug}`;
  return ldCompact({
    "@type": "JobPosting",
    "@id": `${ldAbs(path)}#jobposting`,
    title: vacancy.title,
    description: description(vacancy),
    datePosted: vacancy.created_at,
    // No `validThrough`: the backend has no expiry date and a guessed one would
    // either retire a live role early or keep a dead one listed.
    employmentType: employmentType(vacancy.employment_type),
    hiringOrganization: { "@id": ORG_ID },
    jobLocation: jobLocation(vacancy.location),
    occupationalCategory:
      teamLabels(t)[vacancy.category] ?? vacancy.category_label,
    identifier: {
      "@type": "PropertyValue",
      name: "EV Investment",
      value: vacancy.id,
    },
    // `compensation` is always the literal "Negotiable" (see VacancyDetail), so
    // there is no figure to publish — `baseSalary` stays out rather than
    // shipping a placeholder Google would flag as invalid.
    // Applications are submitted on this page's own form, which is exactly what
    // directApply asserts.
    directApply: true,
    mainEntityOfPage: { "@id": ldAbs(path) },
  });
}

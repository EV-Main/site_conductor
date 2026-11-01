import { SITE } from "@/shared/config/site";

// App-agnostic JSON-LD primitives. The domain-specific graph (which reads team
// entities) is composed one layer up, in the home view — `shared` must not
// depend on `entities`.
export type JsonLdNode = Record<string, unknown>;

// Build a node @id from a fragment, e.g. ldId("#organization").
export const ldId = (hash: string) => `${SITE.url}/${hash}`;

// The three cross-page node @ids. Every page's graph points its `publisher` /
// `hiringOrganization` / `isPartOf` at these instead of restating the
// organization, so Google folds the whole site into one entity rather than
// treating each page's copy as a separate business.
export const ORG_ID = ldId("#organization");
export const LOGO_ID = ldId("#logo");
export const WEBSITE_ID = ldId("#website");

// Resolve a path to an absolute URL (schema.org URLs must be absolute).
export const ldAbs = (src: string) =>
  src.startsWith("http") ? src : new URL(src, SITE.url).toString();

// Drop undefined / empty-string / empty-array values so optional owner facts
// (foundingDate, sameAs, phones…) never emit blank schema fields. Shallow by
// design — call it on each node as you build it.
export function ldCompact<T extends JsonLdNode>(node: T): T {
  const out: JsonLdNode = {};
  for (const [key, value] of Object.entries(node)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out as T;
}

// A minimal, self-contained Organization node carrying the canonical @id.
//
// Pages other than the homepage need this: a bare `{"@id": …}` reference is
// only resolvable if a node with that @id exists in the *same* document, and
// Google's JobPosting/Article validators reject a `hiringOrganization` /
// `publisher` that resolves to nothing. Restating name+url+logo under the same
// @id keeps each page independently valid while still collapsing into one
// entity — the homepage's fuller FinancialService node is the same subject.
export function organizationRefNode(): JsonLdNode {
  return ldCompact({
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    alternateName: SITE.alternateName,
    url: `${SITE.url}/`,
    logo: ldCompact({
      "@type": "ImageObject",
      "@id": LOGO_ID,
      url: ldAbs("/assets/logo.svg"),
      width: 387,
      height: 335,
      caption: SITE.name,
    }),
    sameAs: SITE.sameAs,
  });
}

// The matching minimal WebSite node, for the same reason: every page's WebPage
// node declares `isPartOf: WEBSITE_ID`, and that reference has to resolve
// inside its own document.
export function webSiteRefNode(): JsonLdNode {
  return ldCompact({
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE.name,
    alternateName: SITE.alternateName,
    url: `${SITE.url}/`,
    inLanguage: SITE.defaultLocale,
    publisher: { "@id": ORG_ID },
  });
}

// Renders a JSON-LD graph as a <script>. Server Component (no "use client").
export function JsonLd({ data }: { data: JsonLdNode }) {
  return (
    <script
      type="application/ld+json"
      // Escape "<" so no string value can break out of the <script> element —
      // the documented Next.js JSON-LD pattern.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

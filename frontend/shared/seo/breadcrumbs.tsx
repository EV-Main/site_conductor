import { SITE } from "@/shared/config/site";
import { JsonLd, ldAbs, ldId, WEBSITE_ID, type JsonLdNode } from "./json-ld";

// BreadcrumbList — the trail Google renders in place of the raw URL under a
// result. Only worth emitting on nested pages: a one-item trail (the homepage
// itself) describes no hierarchy, so `breadcrumbGraph` refuses to build one and
// the component renders nothing. Home is prepended here, so callers pass only
// the trail *below* it.
export type Crumb = { name: string; path: string };

export function breadcrumbNode(trail: Crumb[]): JsonLdNode | undefined {
  const crumbs: Crumb[] = [{ name: "Home", path: "/" }, ...trail];
  if (crumbs.length < 2) return undefined;
  return {
    "@type": "BreadcrumbList",
    // Path-derived so two pages never collide on one @id.
    "@id": ldId(`#breadcrumb-${crumbs[crumbs.length - 1]!.path}`),
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      // The last crumb is the current page: schema.org wants `item` omitted
      // there, since it is the URL the crumb is already attached to.
      ...(index < crumbs.length - 1 ? { item: ldAbs(crumb.path) } : {}),
    })),
  };
}

// A WebPage node anchoring a page into the site graph. `@id` is the page URL
// itself (the schema.org convention), which lets per-page nodes below it point
// back with `mainEntityOfPage`.
export function webPageNode({
  path,
  name,
  description,
  type = "WebPage",
  breadcrumb,
}: {
  path: string;
  name: string;
  description: string;
  type?: string;
  breadcrumb?: JsonLdNode;
}): JsonLdNode {
  return {
    "@type": type,
    "@id": ldAbs(path),
    url: ldAbs(path),
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: SITE.defaultLocale,
    ...(breadcrumb ? { breadcrumb: { "@id": breadcrumb["@id"] } } : {}),
  };
}

// Convenience for pages whose only structured data is the trail.
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  const node = breadcrumbNode(trail);
  if (!node) return null;
  return <JsonLd data={{ "@context": "https://schema.org", ...node }} />;
}

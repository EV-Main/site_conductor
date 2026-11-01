import {
  JsonLd,
  organizationRefNode,
  webSiteRefNode,
  type JsonLdNode,
} from "./json-ld";
import { breadcrumbNode, webPageNode, type Crumb } from "./breadcrumbs";

// One assembler for every non-home page's structured data.
//
// It exists to make a specific failure impossible by construction. JSON-LD
// references are per-document: a `{"@id": …}` pointing at a node that is not in
// the same <script> resolves to nothing, and Google reads that as a missing
// required field (a JobPosting with an unresolvable hiringOrganization, an
// Article with no publisher.name) and silently drops the rich result. Every
// WebPage declares `isPartOf` the WebSite and `about`/`publisher` the
// Organization, so those two nodes must ride along on every single page — which
// is exactly the kind of thing that gets forgotten one page at a time.
//
// Callers describe only what is specific to their page; the WebPage, the
// WebSite, the Organization and the breadcrumb trail are always included.
export function PageGraph({
  path,
  name,
  description,
  type = "WebPage",
  trail,
  webPageExtras,
  organizationExtras,
  nodes = [],
}: {
  path: string;
  name: string;
  description: string;
  /// WebPage subtype — AboutPage, ContactPage, CollectionPage…
  type?: string;
  /// The trail *below* Home, which is prepended for you.
  trail: Crumb[];
  /// Extra fields merged onto the WebPage node (about, mainEntity…).
  webPageExtras?: JsonLdNode;
  /// Extra fields merged onto the Organization node (employee, subOrganization…).
  organizationExtras?: JsonLdNode;
  /// The page's own subject nodes — the JobPosting, the Article, the People.
  nodes?: JsonLdNode[];
}) {
  const breadcrumb = breadcrumbNode(trail);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            ...webPageNode({ path, name, description, type, breadcrumb }),
            ...webPageExtras,
          },
          ...nodes,
          { ...organizationRefNode(), ...organizationExtras },
          webSiteRefNode(),
          ...(breadcrumb ? [breadcrumb] : []),
        ],
      }}
    />
  );
}

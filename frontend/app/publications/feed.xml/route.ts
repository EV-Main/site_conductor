import { allPublications, coverStill } from "@/entities/publication";
import { SITE } from "@/shared/config/site";

// RSS 2.0 for the publications hub.
//
// Not a ranking signal in itself — the value is distribution: research
// aggregators, newsreaders and the "follow" affordance in Chrome and several
// AI crawlers all discover new dispatches from a feed without waiting for a
// recrawl. Static, because the catalogue is a build artefact.
export const dynamic = "force-static";

const abs = (path: string) => new URL(path, SITE.url).toString();

// The five characters that are not legal in XML character data / attributes.
const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

// RFC 822, which RSS requires — the catalogue stores ISO 8601 calendar dates.
const rfc822 = (iso: string) => new Date(`${iso}T00:00:00Z`).toUTCString();

// <enclosure> requires a type, and covers are whatever the blog flake emitted.
// Read it off the extension rather than assuming JPEG; an unknown extension
// means no enclosure at all, since a wrong MIME type is worse than none.
const IMAGE_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
};

const imageType = (url: string) =>
  IMAGE_TYPES[url.split("?")[0]!.split(".").pop()?.toLowerCase() ?? ""];

export function GET() {
  // The whitepaper is excluded to match the sitemap and the CollectionPage: its
  // body mounts in a shadow root, so there is no article text behind that URL.
  const entries = allPublications().filter(
    publication => publication.kind !== "whitepaper"
  );

  const items = entries
    .map(publication => {
      const url = abs(`/publications/${publication.slug}`);
      const still = coverStill(publication);
      const stillType = still ? imageType(still.url) : undefined;
      return [
        "    <item>",
        `      <title>${escapeXml(publication.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        // Permanent, opaque item identity — the URL is stable, so it doubles as
        // the guid and readers never re-announce an article as new.
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${rfc822(publication.date)}</pubDate>`,
        `      <description>${escapeXml(publication.dek)}</description>`,
        publication.author
          ? `      <dc:creator>${escapeXml(publication.author)}</dc:creator>`
          : "",
        publication.category
          ? `      <category>${escapeXml(publication.category)}</category>`
          : "",
        still && stillType
          ? `      <enclosure url="${escapeXml(abs(still.url))}" type="${stillType}" />`
          : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${SITE.name} — Field Notes & Research`)}</title>
    <link>${escapeXml(abs("/publications"))}</link>
    <description>${escapeXml("Field notes filmed in Quy Nhơn and institutional research on Vietnam coastal real estate.")}</description>
    <language>${SITE.defaultLocale}</language>
    <atom:link href="${escapeXml(abs("/publications/feed.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}

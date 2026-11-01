// The catalogue is a BUILD ARTEFACT: `catalogue.json` is produced by the blog
// flake — the same build that ships the publication documents and their media —
// and the image build overwrites this file wholesale before `next build`. Hand
// edits are lost; change the publication sources, not the JSON.
//
// It lives inside the slice rather than in `public/` on purpose. `public/` is
// gitignored (it is entirely generated), so a seed there could not be committed
// and a clone without the blog input would fail at this static import. Here the
// seed is tracked, so `npm run dev` works on a fresh checkout with no flake.
//
// The seed mirrors real published articles ONLY. It is the fallback the image
// build uses whenever the blog input carries no catalogue, so anything invented
// here ships to production: a placeholder entry becomes a live card linking to a
// page with no document behind it, and a placeholder `videoId` becomes a real
// third-party video embedded on the fund's site. Add an article to the blog
// repo instead.
//
// Because the file arrives from a build, it is parsed defensively: a bad
// artefact must degrade, never take the site down. Unusable entries are
// dropped, an unusable cover demotes its entry to a text entry, and nothing
// throws at module load.
import index from "./catalogue.json";
import type { Cover, Publication, PublicationKind } from "./types";
import { WHITEPAPER } from "./whitepaper";

// Keyed by the union, so adding a kind is a compile error here rather than a
// build artefact whose new entries are silently dropped at parse time.
const KIND_SET: Record<PublicationKind, true> = {
  "field-note": true,
  research: true,
  whitepaper: true,
};
const isKind = (value: string): value is PublicationKind => value in KIND_SET;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function count(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function fields(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function parseCover(value: unknown): Cover | undefined {
  const c = fields(value);
  const alt = c && text(c.alt);
  if (!c || !alt) return undefined;
  const caption = text(c.caption);
  const duration = text(c.duration);

  if (c.type === "video") {
    const src = text(c.src);
    const poster = text(c.poster);
    if (!src || !poster) return undefined;
    return { type: "video", src, poster, duration, caption, alt };
  }
  if (c.type === "youtube") {
    const videoId = text(c.videoId);
    if (!videoId) return undefined;
    const poster = text(c.poster);
    return { type: "youtube", videoId, poster, duration, caption, alt };
  }
  if (c.type === "image") {
    const src = text(c.src);
    if (!src) return undefined;
    return { type: "image", src, caption, alt };
  }
  return undefined;
}

function parsePublication(value: unknown): Publication | undefined {
  const p = fields(value);
  if (!p) return undefined;
  const slug = text(p.slug);
  const title = text(p.title);
  const date = text(p.date);
  const kind = text(p.kind);
  const dek = text(p.dek);
  if (!slug || !title || !dek) return undefined;
  if (!date || !ISO_DATE.test(date)) return undefined;
  if (!kind || !isKind(kind)) return undefined;

  return {
    slug,
    title,
    date,
    kind,
    author: text(p.author),
    role: text(p.role),
    dek,
    quote: text(p.quote),
    category: text(p.category),
    cover: parseCover(p.cover),
    pages: count(p.pages),
    readingMinutes: count(p.readingMinutes),
    frames: count(p.frames),
    text: text(p.text),
  };
}

/// Date-descending, so `latestPublications` is a plain prefix and no caller has
/// to re-sort. ISO dates compare correctly as strings.
export const PUBLICATIONS: readonly Publication[] = [
  ...(Array.isArray(index) ? (index as unknown[]) : [])
    .map(parsePublication)
    .filter((p): p is Publication => p !== undefined),
  // Not blog-produced — see ./whitepaper. Appended rather than seeded so a real
  // build cannot drop it.
  WHITEPAPER,
].sort((a, b) => b.date.localeCompare(a.date));

import type { Publication } from "./types";

/**
 * The whitepaper is a publication, but it is not a blog-flake article: it has
 * its own flake and lands at `public/whitepaper.*`, with a static route of its
 * own rather than resolving through `[slug]`.
 *
 * So it is declared here rather than in `catalogue.json`. That file is rewritten
 * wholesale by the blog build, which globs `publish/<slug>/meta.toml` and has no
 * idea the whitepaper exists — leaving it in the seed would mean the whitepaper
 * silently vanished from the index, the filter chips and the masthead counts the
 * first time anyone ran a real build.
 *
 * Kept in sync by hand, which is the honest cost of a second document pipeline.
 */
export const WHITEPAPER: Publication = {
  slug: "whitepaper",
  title: "EV Investment — Fund Whitepaper",
  date: "2026-02-01",
  kind: "whitepaper",
  category: "Fund",
  dek: "Mandate, structure, fee terms and the underwriting standard applied to every asset in the Quy Nhơn coastal programme.",
  quote:
    "The fund buys land and operating estates in one district and states its assumptions in full, including the ones we expect to be wrong.",
  pages: 48,
  readingMinutes: 26,
};

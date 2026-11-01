/**
 * Relevance scoring for the publication search.
 *
 * A faithful port of `score_post` from the Rust/Leptos original
 * (valeratrades/site, `src/blog/mod.rs`) so results rank identically. Pure and
 * dependency-free — no React, no DOM — which keeps it trivially unit-testable.
 *
 * Weights are checked in a strict `exact → prefix → substring` chain: the first
 * one that matches wins (the original is an `else if` ladder, not a sum).
 */

/** Title matches carry 10x the weight of body matches. */
const TITLE = { exact: 100, prefix: 50, substring: 20 } as const;
const BODY = { exact: 10, prefix: 5, substring: 2 } as const;

/** Bonus when the raw (lowercased) field contains the token verbatim. */
const TITLE_PHRASE = 10;
const BODY_PHRASE = 1;

type Weights = { exact: number; prefix: number; substring: number };

/**
 * Lowercase, split on whitespace, drop empties — the JS equivalent of Rust's
 * `to_lowercase().split_whitespace()`.
 */
export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/\s+/)
    .filter(token => token.length > 0);
}

function tokenScore(token: string, query: string, weights: Weights): number {
  if (token === query) return weights.exact;
  if (token.startsWith(query)) return weights.prefix;
  if (token.includes(query)) return weights.substring;
  return 0;
}

/**
 * Score one haystack against a query. Higher is better; `0` means "no match"
 * and callers filter it out. An empty (or whitespace-only) query scores `0`.
 *
 * The total is normalised by the query token count, so a two-word query that
 * matches both words does not automatically outrank a one-word query.
 */
export function score(
  haystack: { title: string; text: string },
  query: string
): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const titleTokens = tokenize(haystack.title);
  const textTokens = tokenize(haystack.text);
  const titleLower = haystack.title.toLowerCase();
  const textLower = haystack.text.toLowerCase();

  let total = 0;
  for (const queryToken of queryTokens) {
    let term = 0;
    for (const token of titleTokens)
      term += tokenScore(token, queryToken, TITLE);
    for (const token of textTokens) term += tokenScore(token, queryToken, BODY);
    if (titleLower.includes(queryToken)) term += TITLE_PHRASE;
    if (textLower.includes(queryToken)) term += BODY_PHRASE;
    total += term;
  }

  return total / queryTokens.length;
}

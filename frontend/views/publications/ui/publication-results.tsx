"use client";

import type { Locale } from "@evinvest/i18n";
import { useT } from "@evinvest/i18n/react";

import type { Publication } from "@/entities/publication";
import { cn } from "@/shared/lib/utils";

import { EntryCard } from "./entry-card";
import { LeadEntry } from "./lead-entry";
import { rowId } from "./publication-index-shared";

// Keyboard selection is a roving highlight, not a listbox: the cards stay
// ordinary links with several interactive descendants each, which `role=option`
// forbids. So the highlight is styling plus a live region — no ARIA widget
// semantics we cannot honour.
const SELECTED = "outline-2 outline-offset-8 outline-ring";

/**
 * What the index has to show for the current query: the empty note, or the
 * lead entry (when it has earned its room) above the grid of the rest.
 */
export function PublicationResults({
  results,
  query,
  showLead,
  selectedIndex,
  locale,
}: {
  results: Publication[];
  query: string;
  showLead: boolean;
  selectedIndex: number | null;
  locale: Locale;
}) {
  const t = useT();
  const grid = showLead ? results.slice(1) : results;
  const gridOffset = showLead ? 1 : 0;

  return results.length === 0 ? (
    <p className="font-light text-ink/55" role="status">
      {query === ""
        ? t(
            "publications.empty.filter",
            "Nothing published under this filter yet."
          )
        : t(
            "publications.empty.search",
            "Nothing matches “{query}”. Clear the search with Esc, or try a place name — most dispatches are titled after one.",
            { query }
          )}
    </p>
  ) : (
    <>
      {showLead && (
        <LeadEntry
          publication={results[0]}
          locale={locale}
          id={rowId(results[0].slug)}
          className={cn(selectedIndex === 0 && SELECTED)}
        />
      )}
      <div
        className={cn(
          "grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3",
          showLead && "mt-16"
        )}
      >
        {grid.map((publication, index) => (
          <EntryCard
            locale={locale}
            key={publication.slug}
            publication={publication}
            id={rowId(publication.slug)}
            className={cn(selectedIndex === index + gridOffset && SELECTED)}
          />
        ))}
      </div>
    </>
  );
}

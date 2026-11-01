"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@evinvest/i18n";
import { useT } from "@evinvest/i18n/react";

import type { Publication } from "@/entities/publication";
import {
  ResultCount,
  SearchField,
  ShortcutsDialog,
  usePublicationSearch,
} from "@/features/publication-search";

import { FilterChips, type KindFilter } from "./filter-chips";
import {
  RESULTS_ID,
  countsByKind,
  getHref,
  getText,
  getTitle,
  rowId,
} from "./publication-index-shared";
import { PublicationResults } from "./publication-results";

export function PublicationIndex({
  publications,
  locale,
}: {
  publications: Publication[];
  locale: Locale;
}) {
  const t = useT();
  const [kind, setKind] = useState<KindFilter>("all");

  const counts = useMemo(() => countsByKind(publications), [publications]);

  const items = useMemo(
    () =>
      kind === "all" ? publications : publications.filter(p => p.kind === kind),
    [kind, publications]
  );

  const {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    helpOpen,
    setHelpOpen,
    inputRef,
  } = usePublicationSearch({ items, getTitle, getText, getHref });

  const selected = selectedIndex === null ? undefined : results[selectedIndex];

  // Arrowing past the fold would otherwise move an off-screen highlight.
  useEffect(() => {
    if (!selected) return;
    document
      .getElementById(rowId(selected.slug))
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

  // The lead only earns its extra room in the resting state: once someone is
  // searching or filtering, every result deserves equal weight.
  const showLead = query === "" && kind === "all" && results.length > 0;

  return (
    <>
      <SearchField
        value={query}
        onChange={setQuery}
        inputRef={inputRef}
        controlsId={RESULTS_ID}
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <FilterChips
          value={kind}
          onChange={next => {
            // The old index would point into a list that no longer exists.
            setSelectedIndex(null);
            setKind(next);
          }}
          counts={counts}
        />
        <ResultCount shown={results.length} total={items.length} />
      </div>

      {/* The highlight drives Enter, so it has to be announced to anyone who
          cannot see it. */}
      <p aria-live="polite" className="sr-only">
        {selected
          ? t("publications.announce", "{title} — {position} of {total}", {
              title: selected.title,
              position: (selectedIndex ?? 0) + 1,
              total: results.length,
            })
          : ""}
      </p>

      <div id={RESULTS_ID} className="mt-14">
        <PublicationResults
          results={results}
          query={query}
          showLead={showLead}
          selectedIndex={selectedIndex}
          locale={locale}
        />
      </div>

      <ShortcutsDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}

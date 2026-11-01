"use client";

/** Default id — `SearchField` points `aria-describedby` here. */
import { useT } from "@evinvest/i18n/react";

export const RESULT_COUNT_ID = "publication-search-count";

export interface ResultCountProps {
  /** Number of results currently rendered. */
  shown: number;
  /** Size of the unfiltered collection. */
  total: number;
  id?: string;
}

/**
 * The quiet mono "SHOWING 1–7 OF 18" line. Dumb on purpose: it counts, it does
 * not know what a publication or a query is.
 */
export function ResultCount({
  shown,
  total,
  id = RESULT_COUNT_ID,
}: ResultCountProps) {
  const t = useT();
  return (
    <p
      id={id}
      aria-live="polite"
      className="font-mono-tech text-[10px] uppercase tracking-[0.18em] text-ink/40"
    >
      {shown === 0
        ? t("publications.results.none", "No matches")
        : t("publications.results.showing", "Showing 1–{shown} of {total}", {
            shown,
            total,
          })}
    </p>
  );
}

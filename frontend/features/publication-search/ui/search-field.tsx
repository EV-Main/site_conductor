"use client";

import type { RefObject } from "react";
import { useT } from "@evinvest/i18n/react";
import { Kbd, KbdCaption } from "./kbd";
import { RESULT_COUNT_ID } from "./result-count";

export const SEARCH_INPUT_ID = "publication-search-input";

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  /** id of the `<ResultCount>` node — announced via `aria-describedby`. */
  describedBy?: string;
  /**
   * id of the caller-rendered result row at `selectedIndex`. `aria-activedescendant`
   * has to sit on the focusable element, so the caller hands it down here.
   */
  activeDescendantId?: string;
  /** id of the caller-rendered results list, for `aria-controls`. */
  controlsId?: string;
  id?: string;
  label?: string;
}

/** The bordered search field: glyph, input, and the right-aligned key hints. */
export function SearchField({
  value,
  onChange,
  inputRef,
  describedBy = RESULT_COUNT_ID,
  activeDescendantId,
  controlsId,
  id = SEARCH_INPUT_ID,
  label,
}: SearchFieldProps) {
  const t = useT();
  return (
    <div className="flex items-center gap-3 border border-ink/18 bg-background/60 px-4 py-3">
      <span
        aria-hidden="true"
        className="text-base leading-none text-primary-ink"
      >
        ⌕
      </span>
      <label htmlFor={id} className="sr-only">
        {label ?? t("publications.search.label", "Search publications")}
      </label>
      <input
        id={id}
        ref={inputRef}
        type="search"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={t(
          "publications.search.placeholder",
          "Search titles and full text…"
        )}
        autoComplete="off"
        spellCheck={false}
        aria-describedby={describedBy}
        aria-controls={controlsId}
        aria-activedescendant={activeDescendantId}
        // text-base on phones: under 16px iOS zooms the viewport on focus
        // (see shared/ui/control.ts). sm: keeps the 14px design.
        className="min-w-0 flex-1 bg-transparent text-base sm:text-sm text-ink outline-none placeholder:text-ink/40"
      />
      <div
        aria-hidden="true"
        className="hidden shrink-0 items-center gap-1.5 sm:flex"
      >
        <Kbd>S</Kbd>
        <Kbd>/</Kbd>
        <KbdCaption>to focus</KbdCaption>
        <span className="mx-1 h-3 w-px bg-ink/15" />
        <Kbd>?</Kbd>
        <KbdCaption>shortcuts</KbdCaption>
      </div>
    </div>
  );
}

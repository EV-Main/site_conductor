"use client";

import { useRouter } from "next/navigation";
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { score, tokenize } from "./score";
import { useSearchKeys } from "./use-search-keys";

const DEFAULT_BASE_PATH = "/publications";

export interface PublicationSearchOptions<T> {
  items: readonly T[];
  getTitle: (item: T) => string;
  getText: (item: T) => string;
  getHref: (item: T) => string;
  /** Route the query is pushed onto. Defaults to `/publications`. */
  basePath?: string;
}

export interface PublicationSearch<T> {
  query: string;
  /** Setting the query always resets the selection. */
  setQuery: (value: string) => void;
  results: T[];
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
  helpOpen: boolean;
  setHelpOpen: (open: boolean) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}

/**
 * Keyboard-first client-side search over an arbitrary item type — generic over
 * `T` so the feature never has to import `entities/publication` for its types.
 *
 * The results list belongs to the **caller**, so the caller owns its ARIA: give
 * every row a stable `id`, mark the row at `selectedIndex` with
 * `aria-selected`, and pass that row's id back as `activeDescendantId` on
 * `<SearchField>` (which puts it on the input, where `aria-activedescendant`
 * has to live).
 *
 * The accessors are memo dependencies, so hoist them to module scope (or wrap
 * them in `useCallback`) — inline lambdas re-score the whole list every render.
 */
export function usePublicationSearch<T>({
  items,
  getTitle,
  getText,
  getHref,
  basePath = DEFAULT_BASE_PATH,
}: PublicationSearchOptions<T>): PublicationSearch<T> {
  const router = useRouter();
  const [query, setQueryState] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    setSelectedIndex(null);
  }, []);

  const results = useMemo(() => {
    if (tokenize(query).length === 0) return [...items];
    return items
      .map(item => ({
        item,
        rank: score({ title: getTitle(item), text: getText(item) }, query),
      }))
      .filter(scored => scored.rank > 0)
      .sort((a, b) => b.rank - a.rank)
      .map(scored => scored.item);
  }, [items, query, getTitle, getText]);

  // Seed from `?s=` so a shared search URL survives a reload. Has to be an
  // effect, not a lazy initialiser: `window` doesn't exist during SSR and a
  // client-only initial value would hydrate-mismatch.
  useEffect(() => {
    const seed = new URLSearchParams(window.location.search).get("s");
    if (seed) setQuery(seed);
  }, [setQuery]);

  useSearchKeys({
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    helpOpen,
    setHelpOpen,
    hrefs: results.map(item => getHref(item)),
    input: inputRef,
    navigate: href => router.push(href),
    pushUrl: value => {
      const url = value
        ? `${basePath}?s=${encodeURIComponent(value)}`
        : basePath;
      window.history.pushState(null, "", url);
    },
  });

  return {
    query,
    setQuery,
    results,
    selectedIndex,
    setSelectedIndex,
    helpOpen,
    setHelpOpen,
    inputRef,
  };
}

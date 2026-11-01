"use client";

import {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

// The top-bar extension point: any mounted `HeaderAction` shows up in the bar
// (left of the Investor Portal CTA) for exactly as long as its owner is
// mounted, so per-route chrome comes and goes with App Router navigation.
// Ordering is first-mounted-first (stable across re-registers of the same
// instance).
type Entry = { order: number; node: ReactNode };

// Two contexts on purpose: registrants subscribe only to the (stable) upsert
// fn, so the outlet re-rendering on entry changes never re-renders pages.
const UpsertContext = createContext<
  ((id: string, node: ReactNode | null) => void) | null
>(null);
const EntriesContext = createContext<ReadonlyMap<string, Entry>>(new Map());

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ReadonlyMap<string, Entry>>(
    new Map(),
  );
  const nextOrder = useRef(0);
  const upsert = useCallback((id: string, node: ReactNode | null) => {
    setEntries((prev) => {
      const next = new Map(prev);
      if (node === null) next.delete(id);
      else
        next.set(id, {
          order: prev.get(id)?.order ?? nextOrder.current++,
          node,
        });
      return next;
    });
  }, []);
  return (
    <UpsertContext.Provider value={upsert}>
      <EntriesContext.Provider value={entries}>
        {children}
      </EntriesContext.Provider>
    </UpsertContext.Provider>
  );
}

/** The bar-side outlet — rendered once, inside the header's CTA cluster. */
export function HeaderActions() {
  const entries = useContext(EntriesContext);
  return [...entries]
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([id, { node }]) => <Fragment key={id}>{node}</Fragment>);
}

/** Mounts its children into the top bar for the caller's lifetime. */
export function HeaderAction({ children }: { children: ReactNode }) {
  const upsert = useContext(UpsertContext);
  const id = useId();
  useEffect(() => {
    if (!upsert) throw new Error("HeaderAction outside HeaderActionsProvider");
    upsert(id, children);
    return () => upsert(id, null);
  }, [upsert, id, children]);
  return null;
}

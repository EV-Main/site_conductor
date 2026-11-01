"use client";

import { type RefObject, useEffect, useRef } from "react";
import { handleSearchKey, type SearchKeyContext } from "./search-keys";

export type SearchKeyBindings = Omit<SearchKeyContext, "input"> & {
  input: RefObject<HTMLInputElement | null>;
};

/**
 * Registers the one global `keydown` listener and — unlike the Rust original,
 * which `forget()`s its closure — removes it again on unmount.
 *
 * State is read through a ref so the listener is attached exactly once instead
 * of being torn down and re-attached on every keystroke.
 */
export function useSearchKeys(bindings: SearchKeyBindings): void {
  const latest = useRef(bindings);
  useEffect(() => {
    latest.current = bindings;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const current = latest.current;
      handleSearchKey(event, { ...current, input: current.input.current });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

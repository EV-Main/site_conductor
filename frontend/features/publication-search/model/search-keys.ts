/**
 * The keyboard contract, ported from the Rust/Leptos original. Kept out of the
 * hook so the hook stays small and this stays directly testable: it is a plain
 * function over a `KeyboardEvent` plus an explicit context of current state and
 * callbacks — no React, no closures over signals.
 *
 * Order matters and mirrors the original:
 *   1. help dialog open → swallow everything, close on Escape / `?`
 *   2. arrows + Enter → ONLY while the field has focus (see below)
 *   3. focus inside an editable → only Escape (clear + blur) is meaningful
 *   4. otherwise the bare shortcuts: `s` `S` `/` focus, `?` help, Escape deselect
 *
 * Divergence from the original, and the important one: it handled the arrows and
 * Enter on `window` regardless of focus. On a page whose results are ordinary
 * links — with a CTA, a PDF download and a play button inside every card — that
 * makes Enter dead on every control and kills arrow-key scrolling outright. Both
 * are ours only while the search input itself holds focus; anywhere else the key
 * belongs to whatever the user actually focused.
 */
export interface SearchKeyContext {
  helpOpen: boolean;
  setHelpOpen: (open: boolean) => void;
  query: string;
  setQuery: (value: string) => void;
  selectedIndex: number | null;
  setSelectedIndex: (index: number | null) => void;
  /** Hrefs of the currently visible results, in display order. */
  hrefs: string[];
  input: HTMLInputElement | null;
  navigate: (href: string) => void;
  /** Pushes the query into the address bar (linkable search). */
  pushUrl: (query: string) => void;
}

function isEditing(): boolean {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return false;
  if (active.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName);
}

function hasSearchFocus(ctx: SearchKeyContext): boolean {
  return ctx.input !== null && document.activeElement === ctx.input;
}

/** ArrowUp/ArrowDown: clamp at both ends, never wrap. No selection → index 0. */
function moveSelection(event: KeyboardEvent, ctx: SearchKeyContext): boolean {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return false;
  if (!hasSearchFocus(ctx)) return false;
  const last = ctx.hrefs.length - 1;
  // Nothing to move through: let the keypress scroll the page as usual.
  if (last < 0) return false;
  event.preventDefault();
  const current = ctx.selectedIndex;
  if (current === null) ctx.setSelectedIndex(0);
  else if (event.key === "ArrowDown")
    ctx.setSelectedIndex(Math.min(current + 1, last));
  else ctx.setSelectedIndex(Math.max(current - 1, 0));
  return true;
}

/** Enter: record the query in the URL, then open the selected (or only) result. */
function confirmSelection(
  event: KeyboardEvent,
  ctx: SearchKeyContext
): boolean {
  if (event.key !== "Enter") return false;
  if (!hasSearchFocus(ctx)) return false;
  event.preventDefault();
  ctx.pushUrl(ctx.query);
  const { hrefs, selectedIndex } = ctx;
  const href =
    selectedIndex !== null
      ? hrefs[selectedIndex]
      : hrefs.length === 1
        ? hrefs[0]
        : undefined;
  if (href) ctx.navigate(href);
  return true;
}

export function handleSearchKey(
  event: KeyboardEvent,
  ctx: SearchKeyContext
): void {
  if (ctx.helpOpen) {
    if (event.key === "Escape" || event.key === "?") {
      event.preventDefault();
      ctx.setHelpOpen(false);
    }
    return;
  }

  // Deliberate divergence from the original, which swallows Ctrl/Cmd+S and
  // friends: never steal a modified chord from the browser.
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  if (moveSelection(event, ctx)) return;
  if (confirmSelection(event, ctx)) return;

  if (isEditing()) {
    if (event.key === "Escape") {
      event.preventDefault();
      ctx.setQuery("");
      ctx.setSelectedIndex(null);
      ctx.input?.blur();
    }
    return;
  }

  switch (event.key) {
    case "s":
    case "S":
    case "/":
      event.preventDefault();
      ctx.input?.focus();
      break;
    case "?":
      event.preventDefault();
      ctx.setHelpOpen(true);
      break;
    case "Escape":
      ctx.setSelectedIndex(null);
      break;
  }
}

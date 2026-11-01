"use client";

import { useEffect, useRef } from "react";
import { useT } from "@evinvest/i18n/react";
import type { Translate } from "@evinvest/i18n";
import { Kbd } from "./kbd";

const TITLE_ID = "publication-search-shortcuts-title";

// The key caps are literal keyboard legends, not prose — they do not translate.
const bindings = (t: Translate) => [
  {
    keys: ["S", "/"],
    description: t("publications.shortcut.focus", "Focus the search field"),
  },
  {
    keys: ["↑", "↓"],
    description: t("publications.shortcut.move", "Move through the results"),
  },
  {
    keys: ["Enter"],
    description: t("publications.shortcut.open", "Open the selected result"),
  },
  {
    keys: ["Esc"],
    description: t(
      "publications.shortcut.clear",
      "Clear the search and unfocus"
    ),
  },
  {
    keys: ["?"],
    description: t("publications.shortcut.toggle", "Toggle this dialog"),
  },
];

export interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Keyboard help, on the native `<dialog>` so the browser owns modality, focus
 * containment and the Escape gesture. Also dismissible by backdrop click.
 */
export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={TITLE_ID}
      onClose={onClose}
      onClick={event => {
        if (event.target === ref.current) onClose();
      }}
      className="m-auto w-[min(28rem,calc(100vw-2rem))] border border-ink/10 bg-card p-0 text-ink backdrop:bg-background/70"
    >
      <div className="p-6">
        <h2
          id={TITLE_ID}
          className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-primary-ink"
        >
          {t("publications.shortcuts.title", "Keyboard shortcuts")}
        </h2>
        <dl className="mt-4 space-y-3">
          {bindings(t).map(binding => (
            <div
              key={binding.description}
              className="flex items-center justify-between gap-4"
            >
              <dt className="flex shrink-0 items-center gap-1.5">
                {binding.keys.map(key => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </dt>
              <dd className="text-right text-sm text-ink/70">
                {binding.description}
              </dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full border border-ink/10 px-4 py-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-ink/50 transition-colors hover:text-ink"
        >
          Close
        </button>
      </div>
    </dialog>
  );
}

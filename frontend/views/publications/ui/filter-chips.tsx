"use client";

import { FileText, LayoutGrid, LineChart, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PublicationKind } from "@/entities/publication";
import { cn } from "@/shared/lib/utils";
import { useT } from "@evinvest/i18n/react";
import type { Translate } from "@evinvest/i18n";

export type KindFilter = PublicationKind | "all";

// The icon restates the kind the label already names, so it is decorative and
// stays out of the accessible name.
const chips = (
  t: Translate
): { value: KindFilter; label: string; icon: LucideIcon }[] => [
  {
    value: "all",
    label: t("publications.filter.all", "ALL"),
    icon: LayoutGrid,
  },
  {
    value: "field-note",
    label: t("publications.kind.fieldNotes", "FIELD NOTES"),
    icon: MapPin,
  },
  {
    value: "research",
    label: t("publications.kind.research", "RESEARCH"),
    icon: LineChart,
  },
  {
    value: "whitepaper",
    label: t("publications.kind.whitepaper", "WHITEPAPER"),
    icon: FileText,
  },
];

export function FilterChips({
  value,
  onChange,
  counts,
}: {
  value: KindFilter;
  onChange: (next: KindFilter) => void;
  counts: Record<KindFilter, number>;
}) {
  const t = useT();
  return (
    <div
      role="group"
      aria-label={t("publications.filter.aria", "Filter publications by kind")}
      className="flex flex-wrap gap-2"
    >
      {chips(t).map(chip => {
        const Icon = chip.icon;
        const on = chip.value === value;
        // A kind nobody has published yet is a dead control, not a filter.
        const empty = counts[chip.value] === 0;
        return (
          <button
            key={chip.value}
            type="button"
            aria-pressed={on}
            disabled={empty}
            onClick={() => onChange(chip.value)}
            className={cn(
              "inline-flex items-center gap-2 border px-4 py-2.5 font-mono-tech text-[11px] tracking-[0.15em] transition-colors",
              on
                ? "border-primary bg-primary text-on-primary"
                : "border-ink/16 text-ink/55",
              // Withheld rather than overridden: a dead control brightening
              // under the cursor invites the click it is refusing.
              !on && !empty && "hover:border-ink/40 hover:text-ink",
              empty && "cursor-not-allowed opacity-35"
            )}
          >
            <Icon aria-hidden className="size-3.5" />
            {chip.label}
          </button>
        );
      })}
    </div>
  );
}

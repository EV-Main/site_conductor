import { ChevronRight } from "lucide-react";

/**
 * Teal-chevron bullet list — the role page's list motif.
 *
 * A neutral chevron, not a check: the same list renders responsibilities and
 * requirements, and a tick would read as "you already meet this".
 */
export function DashList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map(item => (
        <li
          key={item}
          className="flex gap-2 text-sm leading-relaxed text-ink/65"
        >
          <ChevronRight
            aria-hidden
            className="mt-1 size-3.5 shrink-0 text-primary-ink"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

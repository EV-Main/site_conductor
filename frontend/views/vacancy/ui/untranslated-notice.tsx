import { Languages } from "lucide-react";
import type { Locale } from "@evinvest/i18n";

import { translate } from "@/shared/config/i18n";

/**
 * Says plainly that this role is being served in English.
 *
 * Vacancies take rule 1.3's `fallback` rather than `hide` — the deliberate
 * exception recorded in `docs/i18n-persisted-content.md`, because hiding an open
 * role from someone who reads English perfectly well costs a candidate, and
 * every one of these roles expects working English anyway.
 *
 * The price of that choice is that a reader can meet English prose under
 * localised chrome, which is exactly what rule 1.3 exists to prevent elsewhere.
 * Saying so is what makes the trade honest instead of sloppy: the reader learns
 * the page is not broken and the site is not pretending. Without this the
 * fallback is indistinguishable from a translation nobody finished.
 *
 * Driven by the backend's `translated` flag, which is false both when no
 * translation exists and when the one that does is stale (its `source_digest`
 * no longer matches the English row). The two are not distinguished on purpose —
 * they mean the same thing to a reader. A request for English is `true`: English
 * readers are not told that English is missing.
 *
 * Rendered INSIDE the hero's container, not as a band above it. The header is
 * `fixed` and takes no layout space, so anything the page puts at the very top
 * of the document paints underneath it; the hero's `pt-32` is what clears the
 * bar, and this note has to sit behind that padding to be visible at all. It
 * reads better there too — an aside attached to the role, in the same column as
 * the title it qualifies, rather than a system bar bolted to the viewport.
 */
export function UntranslatedNotice({ locale }: { locale: Locale }) {
  const t = translate(locale);
  return (
    <p
      role="note"
      className="mt-7 flex max-w-xl items-start gap-2.5 rounded-lg border border-white/10 bg-card/40 px-3.5 py-2.5 text-xs leading-relaxed text-ink/60"
    >
      <Languages
        aria-hidden
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-ink"
      />
      <span>
        {t(
          "vacancy.untranslated",
          "Shown in English — this role hasn't been translated into your language yet."
        )}
      </span>
    </p>
  );
}

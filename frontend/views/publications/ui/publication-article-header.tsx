import Link from "next/link";
import { localePath, type Locale } from "@evinvest/i18n";

import {
  formatPublicationDate,
  type Publication,
} from "@/entities/publication";
import { translate } from "@/shared/config/i18n";

import { kindLabel } from "../model/presentation";

/**
 * The article's masthead: the way back, the kind, the dateline, and the byline
 * around the title. All of it is manifest copy, and all of it is translated —
 * which is exactly what the document below it is not.
 */
export function PublicationArticleHeader({
  publication,
  locale,
}: {
  publication: Publication;
  locale: Locale;
}) {
  const t = translate(locale);

  return (
    <header className="mx-auto max-w-3xl">
      <Link
        href={localePath(locale, "/publications")}
        className="font-mono-tech text-[11px] tracking-[0.15em] text-ink/45 transition-colors hover:text-ink"
      >
        ← {t("publications.allPublications", "All publications")}
      </Link>
      <div className="mt-8 flex items-center justify-between gap-4 font-mono-tech text-[11px] tracking-[0.19em]">
        <span className="flex items-center gap-2.5 text-primary-ink">
          <span aria-hidden className="size-[7px] bg-primary-ink" />
          {kindLabel(publication.kind, t)}
        </span>
        {/* <time> so the dateline is machine-readable on its own, not only
            inside the JSON-LD block. */}
        <time dateTime={publication.date} className="text-ink/40">
          {formatPublicationDate(publication.date, "long", locale)}
        </time>
      </div>
      <h1 className="mt-5 font-serif-display text-4xl leading-tight font-bold text-white sm:text-5xl">
        {publication.title}
      </h1>
      <p className="mt-5 font-serif-display text-lg leading-relaxed text-ink/90 italic">
        {publication.dek}
      </p>
      {publication.author && (
        <p className="mt-7 border-t border-ink/12 pt-5 font-mono-tech text-[11px] tracking-[0.14em] text-ink/50 uppercase">
          {publication.author}
          {publication.role ? ` · ${publication.role}` : ""}
        </p>
      )}
    </header>
  );
}

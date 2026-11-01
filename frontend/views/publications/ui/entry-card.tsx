import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { localePath, type Locale } from "@evinvest/i18n";

import {
  formatPublicationDate,
  toPlateCover,
  type Publication,
} from "@/entities/publication";
import { cn } from "@/shared/lib/utils";
import { DocumentCard } from "@/shared/ui/document-card";
import { MediaPlate } from "@/shared/ui/media-plate";
import { translate } from "@/shared/config/i18n";

import { ctaFor, href, kindLabel, pdfHref } from "../model/presentation";

/**
 * One entry in the index, in whichever of the two card species fits it.
 *
 * A publication with no cover is NOT a media card that failed to load one — it
 * is a document, and it gets a filled page with no picture-shaped hole in it.
 * That distinction is the whole reason `DocumentCard` exists; do not "unify"
 * these two branches behind a placeholder image.
 */
export function EntryCard({
  publication,
  className,
  id,
  locale,
}: {
  publication: Publication;
  className?: string;
  id?: string;
  locale: Locale;
}) {
  const t = translate(locale);
  const cover = toPlateCover(publication);
  const date = formatPublicationDate(publication.date, "short", locale);

  if (!cover) {
    return (
      <DocumentCard
        kind={kindLabel(publication.kind, t)}
        date={date}
        title={publication.title}
        quote={publication.quote}
        excerpt={publication.dek}
        pages={publication.pages}
        readingMinutes={publication.readingMinutes}
        href={localePath(locale, href(publication))}
        pdfHref={pdfHref(publication)}
        cta={ctaFor(publication, t)}
        className={cn("h-full", className)}
        id={id}
      />
    );
  }

  return (
    <article id={id} className={cn("flex h-full flex-col", className)}>
      <MediaPlate cover={cover} caption={publication.cover?.caption} />
      <div className="mt-5 flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-4 font-mono-tech text-[10px] tracking-[0.17em]">
          <span className="text-primary-ink">
            {kindLabel(publication.kind, t)}
          </span>
          <span className="text-ink/40">{date}</span>
        </div>
        <h3 className="mt-3 font-serif-display text-xl font-bold text-white">
          {publication.title}
        </h3>
        <p className="mt-2.5 flex-1 text-sm leading-relaxed font-light text-ink/65">
          {publication.dek}
        </p>
        <div className="mt-4 border-t border-ink/10 pt-4">
          <Link
            href={localePath(locale, href(publication))}
            className="inline-flex items-center gap-2 font-mono-tech text-[10px] tracking-[0.15em] text-primary-ink transition-colors hover:text-ink"
          >
            {ctaFor(publication, t)}
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

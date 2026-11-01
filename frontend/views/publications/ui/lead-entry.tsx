import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { localePath, type Locale } from "@evinvest/i18n";

import {
  formatPublicationDate,
  toPlateCover,
  type Publication,
} from "@/entities/publication";
import { cn } from "@/shared/lib/utils";
import { MediaPlate } from "@/shared/ui/media-plate";
import { translate } from "@/shared/config/i18n";

import { ctaFor, href, kindLabel } from "../model/presentation";
import { EntryCard } from "./entry-card";

/**
 * The newest entry, given the room to be read rather than scanned. Falls back
 * to the ordinary card when the lead has no cover — a document lead in a
 * two-column media layout would leave exactly the picture-shaped hole the card
 * species split exists to avoid.
 */
export function LeadEntry({
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
  if (!cover) {
    return (
      <EntryCard
        publication={publication}
        className={className}
        id={id}
        locale={locale}
      />
    );
  }

  return (
    <article
      id={id}
      className={cn("grid gap-8 lg:grid-cols-12 lg:gap-10", className)}
    >
      <div className="lg:col-span-7">
        <MediaPlate
          cover={cover}
          size="wide"
          caption={publication.cover?.caption}
          plateLabel={t("publications.plate", "Plate {n}", { n: "01" })}
        />
      </div>
      <div className="flex flex-col lg:col-span-5">
        <div className="flex items-center justify-between gap-4 font-mono-tech text-[11px] tracking-[0.19em]">
          <span className="flex items-center gap-2.5 text-primary-ink">
            <span aria-hidden className="size-[7px] bg-primary-ink" />
            {t("publications.latestDispatch", "LATEST DISPATCH")}
          </span>
          <span className="text-ink/40">
            {formatPublicationDate(publication.date, "long", locale)}
          </span>
        </div>
        <h2 className="mt-5 font-serif-display text-3xl leading-tight font-bold text-white sm:text-4xl">
          {publication.title}
        </h2>
        <p className="mt-4 flex-1 leading-relaxed font-light text-ink/70">
          {publication.dek}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-5">
          {publication.author && (
            <span className="font-mono-tech text-[10px] tracking-[0.14em] text-ink/45 uppercase">
              {publication.author}
              {publication.role ? ` · ${publication.role}` : ""}
            </span>
          )}
          <Link
            href={localePath(locale, href(publication))}
            className="inline-flex items-center gap-2 bg-primary px-5 py-3 font-mono-tech text-[11px] tracking-[0.15em] text-on-primary transition-colors hover:bg-ink hover:text-brand"
          >
            {ctaFor(publication, t)}
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </div>
        <span className="sr-only">{kindLabel(publication.kind, t)}</span>
      </div>
    </article>
  );
}

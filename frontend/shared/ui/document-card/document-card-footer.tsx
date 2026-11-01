import Link from "next/link";
import { ArrowRight, Clock, File, FileDown, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface DocumentCardFooterProps {
  pages?: number;
  readingMinutes?: number;
  href: string;
  pdfHref?: string;
  cta: string;
  /** Used for the download link's accessible name. */
  title: string;
}

/**
 * The format label states what the document IS — page count, read time, file
 * kind. It must never phrase an absence ("no video", "text only"): the whole
 * point of this card is that a text dispatch is a complete object, not a media
 * card with a hole in it.
 */
function formatTerms({
  pages,
  readingMinutes,
  pdfHref,
}: DocumentCardFooterProps): { icon: LucideIcon; text: string }[] {
  const terms = [
    pages ? { icon: FileText, text: `${pages} PP` } : null,
    readingMinutes ? { icon: Clock, text: `${readingMinutes} MIN READ` } : null,
    pdfHref ? { icon: File, text: "PDF" } : null,
  ].filter(term => term !== null);
  return terms.length ? terms : [{ icon: FileText, text: "FULL REPORT" }];
}

export function DocumentCardFooter(props: DocumentCardFooterProps) {
  const { href, pdfHref, cta, title } = props;
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-ink/10 pt-5">
      <span className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-ink/40">
        {formatTerms(props).map(({ icon: Icon, text }) => (
          <span key={text} className="flex items-center gap-1.5">
            {/* Decorative: the term beside it already states the fact. */}
            <Icon aria-hidden className="size-3" />
            {text}
          </span>
        ))}
      </span>
      <div className="flex items-center gap-4">
        {pdfHref ? (
          <a
            href={pdfHref}
            download
            aria-label={`Download ${title} as PDF`}
            className="relative z-10 inline-flex items-center gap-1.5 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-ink/45 motion-safe:transition-colors hover:text-primary-ink"
          >
            <FileDown className="size-3.5" />
            PDF
          </a>
        ) : null}
        {/* Stretched link: the pseudo-element makes the whole card the hit area,
            so the card needs no nested/duplicate anchor around its title. */}
        <Link
          href={href}
          className="inline-flex items-center gap-2 font-mono-tech text-[10px] uppercase tracking-[0.2em] text-primary-ink motion-safe:transition-colors hover:text-ink after:absolute after:inset-0 after:content-['']"
        >
          {cta}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

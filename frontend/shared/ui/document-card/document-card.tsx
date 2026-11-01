import { cn } from "@/shared/lib/utils";
import { DocumentCardFooter } from "./document-card-footer";
import type { DocumentCardProps } from "./types";

/**
 * A written dispatch, drawn as a visibly different KIND of object from a media
 * plate — never a plate with a hole in it. There is no 16:9 stage and no
 * aspect-ratio box anywhere, so nothing on this card can look like an image that
 * failed to load. It is a filled page instead: a teal spine on the left edge,
 * and the space a plate spends on a photograph spent on type — kind/date, a
 * Playfair title, a pull-quote, and a longer excerpt than a media card carries.
 *
 * `h-full` is safe: the excerpt grows, so the footer pins to the bottom and the
 * card lines up with media cards sharing its grid row.
 */
export function DocumentCard({
  kind,
  date,
  title,
  quote,
  excerpt,
  pages,
  readingMinutes,
  href,
  pdfHref,
  cta = "READ THE REPORT",
  className,
}: DocumentCardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-none p-6 sm:p-8",
        "border border-ink/12 border-l-2 border-l-primary-ink bg-card/55",
        // Background only on hover — a `hover:border-*` would repaint the teal
        // spine along with the other three edges, and the spine is the identity.
        "motion-safe:transition-colors motion-safe:duration-300",
        "hover:bg-card/75",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 font-mono-tech text-[10px] uppercase tracking-[0.22em]">
        <span className="truncate text-primary-ink">{kind}</span>
        <span className="shrink-0 text-ink/40">{date}</span>
      </div>

      <h3 className="mt-4 font-serif-display text-xl font-bold leading-snug text-white sm:text-2xl">
        {title}
      </h3>

      {quote ? (
        <p className="mt-5 border-l border-primary-ink/30 pl-4 font-serif-display text-base italic leading-relaxed text-ink/90">
          {quote}
        </p>
      ) : null}

      {/* Grows so the footer sits on the bottom edge regardless of copy length. */}
      <p className="mt-5 flex-1 text-sm font-light leading-relaxed text-ink/65">
        {excerpt}
      </p>

      <DocumentCardFooter
        pages={pages}
        readingMinutes={readingMinutes}
        href={href}
        pdfHref={pdfHref}
        cta={cta}
        title={title}
      />
    </article>
  );
}

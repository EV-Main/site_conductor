export interface DocumentCardProps {
  /** Category slug shown in the header row, e.g. `Macroeconomics`. */
  kind: string;
  /** Already formatted for display, e.g. `May 2026`. */
  date: string;
  title: string;
  /** Optional Playfair-italic pull-quote — the card's one typographic accent. */
  quote?: string;
  /** Runs longer than a media card's: this card's job is to give space to text. */
  excerpt: string;
  /** Page count, rendered as `24 PP`. */
  pages?: number;
  /** Rendered as `12 MIN READ`. */
  readingMinutes?: number;
  /** Where the CTA (and the whole card surface) leads. */
  href: string;
  /** Present ⇒ a `PDF` download link and a `PDF` term in the format label. */
  pdfHref?: string;
  /** Defaults to `READ THE REPORT`. */
  cta?: string;
  className?: string;
  /** Anchor for the index's keyboard-selection scroll target. */
  id?: string;
}

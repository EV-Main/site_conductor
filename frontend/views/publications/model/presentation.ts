import type { Publication, PublicationKind } from "@/entities/publication";
import type { Translate } from "@evinvest/i18n";

export function kindLabel(kind: PublicationKind, t: Translate): string {
  const label: Record<PublicationKind, string> = {
    "field-note": t("publications.kind.fieldNote", "FIELD NOTE"),
    research: t("publications.kind.research", "RESEARCH"),
    whitepaper: t("publications.kind.whitepaper", "WHITEPAPER"),
  };
  return label[kind];
}

/// The verb states the format. A dispatch you watch and a report you read are
/// different things, and the label should not pretend otherwise.
export function ctaFor(publication: Publication, t: Translate): string {
  switch (publication.cover?.type) {
    case "video":
    case "youtube":
      return t("publications.cta.watchNote", "WATCH THE NOTE");
    case "image":
      return t("publications.cta.readNote", "READ THE NOTE");
    case undefined:
      return publication.kind === "whitepaper"
        ? t("publications.cta.readWhitepaper", "READ THE WHITEPAPER")
        : t("publications.cta.readReport", "READ THE REPORT");
  }
}

export function href(publication: Publication): string {
  return `/publications/${publication.slug}`;
}

// The whitepaper has its own flake and lands at public/whitepaper.pdf, not
// alongside the blog-built documents — next.config's noindex rules encode the
// same split.
export function pdfHref(publication: Publication): string {
  return publication.kind === "whitepaper"
    ? "/whitepaper.pdf"
    : `/publications/${publication.slug}.pdf`;
}

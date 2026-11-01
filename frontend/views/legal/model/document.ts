// The shape every legal document renders through. Section titles come from
// the catalogue (they are short and translate cheaply); the binding prose is
// English-only until counsel has signed the English off — translating a draft
// is work that gets thrown away with the draft.
export interface LegalSection {
  title: string;
  paragraphs: readonly string[];
  /** Rendered as a list after the paragraphs. */
  bullets?: readonly string[];
}

/**
 * Where a document sits in its lifecycle. "draft" makes the page render a
 * visible "pending legal review" banner and marks the text non-binding;
 * "final" is set only once counsel has signed it off. Grep `status: "draft"`
 * to find every document still awaiting review (site_conductor #204).
 */
export type LegalStatus = "draft" | "final";

export interface LegalDocument {
  status: LegalStatus;
  title: string;
  /** The one-line summary under the title. */
  lede: string;
  sections: readonly LegalSection[];
}

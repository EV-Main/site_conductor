import {
  Alert,
  AlertDescription,
  AlertTitle,
  Container,
} from "@evinvest/uikit";
import Link from "next/link";
import { localePath, type Locale, type Translate } from "@evinvest/i18n";

import { translate } from "@/shared/config/i18n";

import type { LegalDocument } from "../model/document";

// One frame for every legal document: eyebrow, title, lede, the effective
// date, then numbered sections. Plain elements rather than the shared/ui
// typography bricks: those pin `text-ink/70` and `cn` refuses an override.
// Static and server-rendered — there is nothing to hydrate on a page of prose.
export function LegalPage({
  locale,
  document,
}: {
  locale: Locale;
  document: (t: Translate) => LegalDocument;
}) {
  const t = translate(locale);
  const { status, title, lede, sections } = document(t);
  return (
    <main className="min-h-screen bg-background pt-32 pb-24 text-ink">
      <Container>
        <article className="mx-auto max-w-3xl">
          {/* Non-final documents carry a visible, machine-greppable
              (status === "draft") banner so a reader never mistakes the
              placeholder text for binding terms; it drops out on its own once
              the model sets status: "final". */}
          {status === "draft" && (
            <Alert variant="info" className="mb-10">
              <AlertTitle>
                {t("legal.draft.title", "Draft — pending legal review")}
              </AlertTitle>
              <AlertDescription>
                {t(
                  "legal.draft.body",
                  "This document is a working draft and is not yet legally binding. It will be replaced with counsel-reviewed text before it takes effect."
                )}
              </AlertDescription>
            </Alert>
          )}
          <header className="space-y-5">
            <span className="block font-mono-tech text-xs uppercase tracking-[0.3em] text-primary-ink">
              {t("legal.eyebrow", "Legal")}
            </span>
            <h1 className="font-serif-display text-4xl font-light leading-[1.12] text-white sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-ink-mid sm:text-lg">
              {lede}
            </p>
            <p className="font-mono-tech text-xs uppercase tracking-[0.2em] text-ink-soft">
              {t("legal.effectiveDate", "Effective date")}: [EFFECTIVE DATE]
            </p>
          </header>

          {/* The headings are catalogue strings; the binding text is English
              until counsel signs it off (see views/legal/model). Saying so on
              the localised page keeps a translated heading from implying a
              translated document — the same seam note the publications carry. */}
          {locale !== "en" && (
            <p
              role="note"
              className="mt-10 border-t border-border pt-5 text-xs text-ink-soft"
            >
              {t(
                "legal.documentInEnglish",
                "The headings are translated; the binding text of this document is in English."
              )}
            </p>
          )}

          {sections.map((section, index) => (
            <section key={section.title}>
              <h2 className="mt-12 mb-4 font-serif-display text-2xl leading-snug text-white sm:text-3xl">
                <span className="mr-3 font-mono-tech text-sm text-primary-ink">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {section.title}
              </h2>
              <div className="space-y-4 text-sm font-light leading-relaxed text-ink-mid sm:text-base">
                {section.paragraphs.map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.bullets.map(bullet => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          <footer className="mt-16 border-t border-border pt-6 text-sm text-ink-soft">
            {t("legal.questions", "Questions about this document?")}{" "}
            <Link
              href={localePath(locale, "/contact")}
              className="text-primary-ink underline outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t("legal.contactUs", "Contact us")}
            </Link>
          </footer>
        </article>
      </Container>
    </main>
  );
}

import type { Locale } from "@evinvest/i18n";
import { Logo } from "@evinvest/uikit";
import { translate } from "@/shared/config/i18n";
import { Headline } from "./headline";
import { TerrainHero } from "./terrain-hero";

const CONTAINER = "mx-auto w-full max-w-(--page-max) px-(--cs-gutter)";

/**
 * evinvest.ltd while the landing lives on its own host: the terrain, one line
 * of display copy and the way into the admin. No site chrome — the page is the
 * whole document.
 *
 * `fontClassName` carries the display face's CSS variable: the font is
 * declared by the route (app/), which is the only layer allowed to reach the
 * app shell's font files.
 */
export function ComingSoonView({
  locale,
  fontClassName,
}: {
  locale: Locale;
  fontClassName: string;
}) {
  const t = translate(locale);
  return (
    <div
      data-surface="coming-soon"
      className={`${fontClassName} flex min-h-svh flex-col`}
    >
      <TerrainHero
        containerClassName={CONTAINER}
        label={
          <>
            <span className="font-serif text-xl leading-none font-light italic">
              E[V]
            </span>
            <span className="font-sans text-(length:--cs-ev-note-size) leading-none tracking-(--cs-ev-note-tracking) text-ink-soft">
              {t("comingSoon.evNote", "expected value")}
            </span>
          </>
        }
      >
        <header className="flex h-(--cs-bar-h) shrink-0 items-start pt-(--cs-bar-pt) text-ink">
          <Logo className="cs-logo-full" />
          <Logo className="cs-logo-compact" />
          <span className="sr-only">Expected Value Investment</span>
        </header>
        <main className="grid grid-cols-(--cs-copy-cols) items-end gap-(--cs-copy-gap) pt-(--band-py)">
          <Headline
            first={
              <>
                <b className="font-medium">Expected</b> value,
              </>
            }
            second="arriving soon..."
          />
          <div>
            {/* A plain <a>, not next/link: /admin is served by the admin
                service through a Traefik route on the same host (devops), not
                by this app, so the hop is a full document load. The rule
                below reads `/admin` as one of our pages only because
                app/[locale] matches any first segment. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- /admin is routed to a separate service, not this app */}
            <a
              href="/admin"
              className="inline-flex items-center gap-2.5 border-b border-primary-ink pb-1.5 font-sans text-(length:--cs-link-size) leading-(--cs-link-leading) font-normal text-ink transition-colors hover:border-ink focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              {t("comingSoon.admin", "Admin")}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </main>
      </TerrainHero>
      <footer className={CONTAINER}>
        <p className="m-0 border-t border-border pt-4 pb-(--cs-caption-pb) font-sans text-(length:--cs-caption-size) leading-normal text-ink-soft">
          {t(
            "comingSoon.caption",
            "Illustrative — a simulated probability surface, not fund performance."
          )}
        </p>
      </footer>
    </div>
  );
}

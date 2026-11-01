import { StatusScreen } from "@evinvest/uikit";
import { localePath, type Locale } from "@evinvest/i18n";

import type { Translate } from "@evinvest/i18n";
import { translate } from "@/shared/config/i18n";

/**
 * The 404 / 403 / 401 surfaces, in the reader's language.
 *
 * The uikit's ready-made `NotFound` / `Forbidden` / `ServerError` bake their copy
 * in, which is why these pages were English under Russian chrome — a reader who
 * had navigated the whole site in their own language met an English apology at
 * the one moment the site was already failing them. `StatusScreen` is the same
 * component underneath and takes every string as a prop, so this needs no uikit
 * release.
 *
 * 401 has no uikit page at all: `authInterrupts` gives Next both `forbidden()`
 * and `unauthorized()`, and only the former had a file. An `unauthorized()` call
 * would have fallen through to the generic error boundary.
 *
 * Server-rendered on purpose. The catalogues are ~176 KB across five locales;
 * reading the locale on the client would ship all of them to render a page
 * nobody wants to be on. The 500 cannot use this — Next requires `error.tsx` to
 * be a Client Component — and takes its copy from `StatusCopyProvider` instead.
 */
type StatusKind = "notFound" | "forbidden" | "unauthorized";

const ACCENT = {
  notFound: "info",
  forbidden: "warn",
  unauthorized: "warn",
} as const;
const CODE = {
  notFound: "404",
  forbidden: "403",
  unauthorized: "401",
} as const;

// The trailing space on each `headlineLead` is load-bearing: StatusScreen
// concatenates lead and accent into one line.
const COPY = (t: Translate): Record<StatusKind, Record<string, string>> => ({
  notFound: {
    eyebrow: t("status.notFound.eyebrow", "Page not found"),
    headlineLead: t("status.notFound.headlineLead", "You've reached "),
    headlineAccent: t("status.notFound.headlineAccent", "open water"),
    subtext: t(
      "status.notFound.subtext",
      "The page you're looking for has drifted off our coastline — moved, renamed, or never charted. Let's get you back to shore."
    ),
  },
  forbidden: {
    eyebrow: t("status.forbidden.eyebrow", "Access forbidden"),
    headlineLead: t("status.forbidden.headlineLead", "This harbour is "),
    headlineAccent: t("status.forbidden.headlineAccent", "private"),
    subtext: t(
      "status.forbidden.subtext",
      "You don't have the credentials to view this page. If you believe you should, our team can open the right doors."
    ),
  },
  unauthorized: {
    eyebrow: t("status.unauthorized.eyebrow", "Sign-in required"),
    headlineLead: t("status.unauthorized.headlineLead", "This deck is "),
    headlineAccent: t("status.unauthorized.headlineAccent", "crew only"),
    subtext: t(
      "status.unauthorized.subtext",
      "You need to be signed in to view this page. Sign in and we'll bring you right back."
    ),
  },
});

/** Shell-owned auth entry point; not a `[locale]` route, so no `localePath`. */
const SIGN_IN_HREF = "/api/auth/login";

export function LocalisedStatus({
  kind,
  locale,
}: {
  kind: StatusKind;
  locale: Locale;
}) {
  const t = translate(locale);
  const copy = COPY(t)[kind];
  const secondary =
    kind === "unauthorized"
      ? { label: t("status.signIn", "Sign in"), href: SIGN_IN_HREF }
      : {
          label:
            kind === "forbidden"
              ? t("status.requestAccess", "Request access")
              : t("status.contactTeam", "Contact the team"),
          href: localePath(locale, "/contact"),
        };
  return (
    <StatusScreen
      accent={ACCENT[kind]}
      code={CODE[kind]}
      eyebrow={copy.eyebrow}
      headlineLead={copy.headlineLead}
      headlineAccent={copy.headlineAccent}
      subtext={copy.subtext}
      links={[
        {
          label: t("status.backHome", "Back to home"),
          href: localePath(locale, "/"),
          leadingArrow: true,
        },
        { ...secondary, variant: "outline" },
      ]}
    />
  );
}

import { localePath, type Locale } from "@evinvest/i18n";

import { translate } from "@/shared/config/i18n";
import type { StatusCopy } from "@/shared/ui/status-copy";

/**
 * Resolve the 500's strings on the server, for `StatusCopyProvider` to carry to
 * the client boundary. Server-only by construction: it reads `messagesFor`,
 * which statically imports every catalogue.
 */
export function serverErrorCopy(locale: Locale): StatusCopy {
  const t = translate(locale);
  return {
    eyebrow: t("status.serverError.eyebrow", "Server error"),
    headlineLead: t("status.serverError.headlineLead", "Our systems are "),
    headlineAccent: t("status.serverError.headlineAccent", "recalibrating"),
    subtext: t(
      "status.serverError.subtext",
      "Something broke on our end — not yours. We've been alerted and are restoring service. Please try again in a moment."
    ),
    backHome: t("status.backHome", "Back to home"),
    tryAgain: t("status.tryAgain", "Try again"),
    homeHref: localePath(locale, "/"),
  };
}

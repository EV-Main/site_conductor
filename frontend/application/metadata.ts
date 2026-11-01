import type { Metadata, Viewport } from "next";
import { SITE } from "@/shared/config/site";

// Must stay a STATIC export (no request data) so it streams despite the layout's
// `await cookies()` making routes dynamic — do NOT switch to generateMetadata.
// Icons are owned by the app/icon.* conventions. The OG image is rendered from
// this same SITE data by scripts/build-og.tsx into public/, and is declared here
// (not via the opengraph-image.* convention) so its alt pulls from SITE instead
// of a static .alt.txt duplicate. X/Twitter falls back to og:image, so no
// separate twitter image.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name}: ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  // No `alternates` here: a root-level canonical cascades into every page that
  // doesn't define its own (noindexed /apps/*, the 404) and
  // stamps them canonical-to-homepage — a contradictory signal pair. Each
  // indexable page declares its own self-canonical (home's is in app/page.tsx).
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Lets Google show a large image/thumbnail and an untruncated snippet.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name}: ${SITE.tagline}`,
    description: SITE.description,
    url: "/",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE.tagline}. ${SITE.description}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name}: ${SITE.tagline}`,
    description: SITE.description,
    ...(SITE.twitterHandle
      ? { site: SITE.twitterHandle, creator: SITE.twitterHandle }
      : {}),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // No `maximumScale: 1` — capping the scale blocks pinch-zoom, which is a
  // standing Lighthouse accessibility failure and a real barrier for low-vision
  // readers on a text-heavy research site. The reason it was there — iOS Safari
  // zooming the viewport when a focused control's text is under 16px — is now
  // fixed at the cause: every free-text input is `text-base` on phones (see
  // shared/ui/control.ts), so the zoom never fires and readers keep theirs.
  themeColor: SITE.theme.black,
};

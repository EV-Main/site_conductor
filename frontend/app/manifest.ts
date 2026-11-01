import type { MetadataRoute } from "next";
import { SITE } from "@/shared/config/site";

// Web App Manifest (served at /manifest.webmanifest). Static — no request data.
// Icon is the brand logo SVG (one scalable asset, `sizes: any`) — no rasters.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "browser",
    background_color: SITE.theme.black,
    theme_color: SITE.theme.black,
    icons: [
      {
        src: "/assets/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}

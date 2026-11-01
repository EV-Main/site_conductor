import type { MetadataRoute } from "next";
import { SITE } from "@/shared/config/site";

// This origin serves one indexable page: the coming-soon page at `/`. Its
// locale variants canonicalise to `/` (app/[locale]/page.tsx), and every former
// landing URL answers 404 — listing them here would point crawlers at errors.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE.url, changeFrequency: "monthly", priority: 1 }];
}

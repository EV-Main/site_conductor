import type { MetadataRoute } from "next";
import { SITE } from "@/shared/config/site";

// Static route — reads only build-time env, so it stays statically generated
// (and cached) even though the page is dynamic via the layout's await cookies().
export const dynamic = "force-static";

// AI answer/citation + training crawlers the brand explicitly WANTS (owner chose
// "allow all" for maximum visibility in ChatGPT / Perplexity / Gemini answers).
// Listing them by name documents intent and is robust to default-policy changes;
// to block training later, move the trainers to a `disallow: "/"` group.
const AI_CRAWLERS = [
  // OpenAI: live search, user-initiated fetch, training
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Anthropic
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  // Google (Gemini / Vertex) + Apple AI
  "Google-Extended",
  "Applebot-Extended",
  // Common Crawl (feeds many models) + Amazon
  "CCBot",
  "Amazonbot",
];

// Repeated into every group rather than written once, because robots.txt has no
// inheritance: a crawler obeys the ONE group that names it and ignores the `*`
// group entirely. So the named AI groups below, carrying `allow: "/"` and
// nothing else, would be exempt from the `*` group's `/api/` disallow. "Allowed
// everywhere the default crawler is" is what those groups mean; it is not
// "allowed more than it".
//
// The cabinet paths are no longer disallowed: they 301 to the landing's own
// host now, and a crawler barred from a URL never sees its redirect — the
// moved pages would keep their old entries instead of passing them on.
const DISALLOW = ["/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...AI_CRAWLERS.map(userAgent => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}

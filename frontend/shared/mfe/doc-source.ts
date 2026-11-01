// Server-side loader for document microfrontends (uses node:fs — server-only).
//
// A document remote is addressed by URL, exactly like an element remote's
// scriptUrl: an absolute http(s) URL is fetched (a doc service on its own
// origin/CDN), a site-relative path is read straight off disk from public/ —
// the common case, since the typst builds are copied there by the flake.

import { promises as fs } from "node:fs";
import path from "node:path";

export async function loadDocHtml(src: string): Promise<string> {
  if (/^https?:\/\//i.test(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`doc fetch ${res.status}: ${src}`);
    return res.text();
  }
  // Site-relative → read from public/. Resolve and confine to public/ so a
  // caller-supplied path segment (e.g. a [slug]) can't traverse out of it.
  const publicDir = path.join(process.cwd(), "public");
  const file = path.join(publicDir, src.replace(/^\/+/, ""));
  if (file !== publicDir && !file.startsWith(publicDir + path.sep)) {
    throw new Error(`doc path escapes public/: ${src}`);
  }
  return fs.readFile(file, "utf8");
}

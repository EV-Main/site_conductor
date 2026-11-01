// Pure, client-safe HTML helpers for document microfrontends (no node imports,
// so both the server reader and the client shadow island can use them).

// Returns the inner HTML of a complete HTML document's <body> — the typst docs
// are whole documents (<!DOCTYPE html>…<body>…). Falls back to the input if
// there's no <body> (already a fragment).
export function extractBodyInner(html: string): string {
  const match = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  return match ? match[1] : html;
}

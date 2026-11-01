import type { ReactNode } from "react";

// Shared eyebrow + display heading for the /team sections (Philosophy, Offices,
// Join). `children` carries the heading text and any inline italic accent span.
export function SectionHead({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <span className="block font-mono-tech text-xs uppercase tracking-[0.3em] text-primary-ink">
        {eyebrow}
      </span>
      <h2 className="font-serif-display text-3xl font-light text-white sm:text-4xl">
        {children}
      </h2>
    </div>
  );
}

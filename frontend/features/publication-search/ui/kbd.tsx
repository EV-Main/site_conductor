import type { ReactNode } from "react";

/**
 * A single key chip. Server Component — shared by the field hints and the
 * shortcuts dialog so the two never drift apart.
 */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded border border-ink/22 bg-ink/8 px-1.5 py-0.5 font-mono-tech text-[10px] leading-none text-ink/70">
      {children}
    </kbd>
  );
}

/** The quiet caption that follows a group of chips. */
export function KbdCaption({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono-tech text-[10px] uppercase tracking-[0.16em] text-ink/35">
      {children}
    </span>
  );
}

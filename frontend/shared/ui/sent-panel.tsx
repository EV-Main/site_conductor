import type { ReactNode } from "react";
import { Check } from "lucide-react";

/** Post-submit confirmation card shared by the application/contact forms. */
export function SentPanel({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center rounded-xl border border-primary-ink/30 bg-card/40 p-10 text-center"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-ink/15">
        <Check className="h-6 w-6 text-primary-ink" />
      </div>
      <h3 className="font-serif-display text-2xl text-white">{title}</h3>
      <p className="mt-2 max-w-xs text-sm text-ink/60">{children}</p>
    </div>
  );
}

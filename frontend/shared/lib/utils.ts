import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "@evinvest/uikit";
import { config } from "@/config";

// Kept local (not re-exported from the kit) so it stays server-safe: the kit
// bundle is a `"use client"` module, whereas `cn` is used in server components.
//
// In dev we panic the instant twMerge has to resolve a conflict: a silently
// dropped utility ("last one wins") is near-impossible to debug later, so we
// force it to be fixed at the source instead. twMerge only ever *removes*
// classes on conflict — a non-duplicate token present in the input but gone
// from the output is therefore an exact conflict signal (exact dupes survive in
// the set, so harmless `p-2 p-2` doesn't trip it).
//
// This only fires for the branch combination that actually rendered, which is
// why `npm run css:check` (scripts/css-conflict-check.mts) runs the same diff
// over *every* reachable combination at build and pre-push time. This is the
// backstop for what the static pass cannot read: a `className` handed in by a
// caller, or a `cva` result.
export function cn(...inputs: ClassValue[]) {
  const raw = clsx(inputs);
  const merged = twMerge(raw);
  if (!config.isProduction) {
    const kept = new Set(merged.split(/\s+/).filter(Boolean));
    const dropped = raw.split(/\s+/).filter(t => t && !kept.has(t));
    if (dropped.length) {
      throw new Error(
        `Tailwind class conflict: ${dropped.join(", ")} overridden in "${raw}" → "${merged}". ` +
          `Remove the losing utility (or don't pass a base that the caller overrides).`
      );
    }
  }
  return merged;
}

// Every interactive control in the design mock is a stub. Clicking one raises
// the same "this is a concept" toast — sourced from the kit so it matches the
// kit's <Toaster/>. Only ever invoked from client components.
export function notifyPlaceholder(featureName: string) {
  toast.info(`${featureName}: Концепт-интерфейс`, {
    description: "Данный элемент является частью интерактивного дизайн-макета.",
    duration: 3000,
  });
}

// Node-only, dynamically imported from instrumentation.ts: process.exit is a
// banned API in the Edge bundle at compile time, so it can't live in config.ts
// (statically imported by the edge-compiled instrumentation).
import { config } from "@/config";

// Touches every getter (recursing into `public`), so any required var missing
// in prod fails at server start — not mid-request weeks later. No-op during
// `next build`, whose env is deliberately partial.
export function assertConfig(): void {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const touch = (obj: object): void => {
    for (const key of Object.keys(obj)) {
      const v = (obj as Record<string, unknown>)[key];
      if (v && typeof v === "object") touch(v);
    }
  };
  try {
    touch(config);
  } catch (e) {
    // Next swallows instrumentation throws into per-request 500s; a server
    // missing config must die (→ CrashLoopBackOff → auto-rollback), not limp.
    console.error(e);
    process.exit(1);
  }
}


import { Container } from "@evinvest/uikit";

// Streamed fallback while the board's server-side fetch resolves, so a slow
// backend never leaves the previous route frozen.
export default function Loading() {
  return (
    <div className="min-h-screen bg-background" aria-hidden>
      <Container className="pt-40 pb-16">
        <div className="h-3 w-40 animate-pulse rounded bg-white/[0.06]" />
        <div className="mt-6 h-11 w-2/3 animate-pulse rounded bg-white/[0.06]" />
        <div className="mt-3 h-11 w-1/2 animate-pulse rounded bg-white/[0.06]" />
        <div className="mt-12 h-12 w-full animate-pulse rounded-lg bg-white/[0.04]" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-white/[0.03]"
            />
          ))}
        </div>
      </Container>
    </div>
  );
}

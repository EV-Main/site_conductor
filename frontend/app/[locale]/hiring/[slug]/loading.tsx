import { Container } from "@evinvest/uikit";

// Streamed fallback while the role's server-side fetch resolves.
export default function Loading() {
  return (
    <div className="min-h-screen bg-background" aria-hidden>
      <Container className="pt-32 pb-10">
        <div className="h-3 w-28 animate-pulse rounded bg-white/[0.06]" />
        <div className="mt-7 h-3 w-52 animate-pulse rounded bg-white/[0.06]" />
        <div className="mt-3 h-12 w-1/2 animate-pulse rounded bg-white/[0.06]" />
        <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-white/[0.04]" />
        <div className="mt-6 flex gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-28 animate-pulse rounded-full bg-white/[0.04]"
            />
          ))}
        </div>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-5 w-full animate-pulse rounded bg-white/[0.03]"
              />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-white/[0.03]" />
        </div>
      </Container>
    </div>
  );
}

"use client";

import * as Sentry from "@sentry/nextjs";
import { ErrorBoundary as Boundary } from "@evinvest/error-monitoring/react";
import { cn } from "@/shared/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

// The app's fallback UI over the lib's vendor-neutral ErrorBoundary (which ships no markup).
export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Boundary
      sentry={Sentry}
      fallback={(error) => (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-accent-error mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4">An unexpected error occurred.</h2>

            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-ink-soft whitespace-break-spaces">
                {error.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-on-primary",
                "hover:opacity-90 cursor-pointer",
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </Boundary>
  );
}

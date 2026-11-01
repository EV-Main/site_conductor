"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * The 500's copy, handed down from the server layout.
 *
 * `error.tsx` is the one status page Next requires to be a Client Component, so
 * `next/root-params` — which is how the 404/403/401 read the locale — cannot
 * reach it. The alternative is `useParams()` plus `messagesFor`, which pulls all
 * five catalogues (~176 KB) into the client graph.
 *
 * Measured caveat, so nobody repeats the reasoning I got wrong: those catalogues
 * are ALREADY in the client bundle on main — a production build has the footer's
 * "Политика конфиденциальности" and the vacancy notice's "Показано на английском"
 * sitting in a 185 KB static chunk. So this provider saves nothing today; its
 * benefit is latent. It is here because it is the only shape that keeps the 500
 * correct *without* depending on that leak, and because the leak is a bug someone
 * should fix — at which point `useParams()` here would silently put all five
 * catalogues back. The leak itself is tracked separately, not fixed here.
 *
 * The provider sits above the error boundary because a segment's `error.tsx`
 * renders *inside* its layout: an error in the page is caught below this, and an
 * error in the layout itself is `global-error.tsx`'s problem, where there is no
 * locale to read anyway.
 */
export interface StatusCopy {
  eyebrow: string;
  headlineLead: string;
  headlineAccent: string;
  subtext: string;
  backHome: string;
  tryAgain: string;
  homeHref: string;
}

const StatusCopyContext = createContext<StatusCopy | null>(null);

export function StatusCopyProvider({
  copy,
  children,
}: {
  copy: StatusCopy;
  children: ReactNode;
}) {
  return (
    <StatusCopyContext.Provider value={copy}>
      {children}
    </StatusCopyContext.Provider>
  );
}

/**
 * Returns `null` rather than throwing when there is no provider. An error page
 * that crashes because its copy is missing is a worse failure than an error page
 * in English, and this hook runs precisely when something has already gone wrong.
 */
export function useStatusCopy(): StatusCopy | null {
  return useContext(StatusCopyContext);
}

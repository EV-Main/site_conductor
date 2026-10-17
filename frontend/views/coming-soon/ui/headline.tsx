"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Never shrink the display line below this, px: past it the lines may wrap. */
const MIN_SIZE = 32;

/**
 * The display headline, two lines that must each stay on one line. CSS sizes
 * it off the viewport (`--cs-display`); this island only shrinks it further
 * when a line would still overflow its column — long words in a narrow grid
 * track, or the fallback face before the serif arrives.
 */
export function Headline({
  first,
  second,
}: {
  first: ReactNode;
  second: ReactNode;
}) {
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const firstRef = useRef<HTMLSpanElement>(null);
  const secondRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = h1Ref.current,
      l1 = firstRef.current,
      l2 = secondRef.current;
    const indented = l2?.parentElement;
    if (!el || !l1 || !l2 || !indented) return;

    const fit = () => {
      el.style.fontSize = "";
      const avail = el.clientWidth;
      let size = parseFloat(getComputedStyle(el).fontSize);
      for (let i = 0; i < 30; i++) {
        // The indent is in em, so it shrinks with the type and is re-read each pass.
        const pad = parseFloat(getComputedStyle(indented).paddingLeft);
        const w = Math.max(
          l1.getBoundingClientRect().width,
          l2.getBoundingClientRect().width + pad
        );
        if (w <= avail || size <= MIN_SIZE) break;
        size = Math.max(MIN_SIZE, size * Math.min(0.98, avail / w));
        el.style.fontSize = `${size}px`;
      }
    };

    let raf = 0,
      disposed = false;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };
    window.addEventListener("resize", onResize);
    void document.fonts.ready.then(() => {
      if (!disposed) fit();
    });
    fit();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // `lang="en"`: the line is the brand's own and stays English under every
  // locale, so a reader's screen reader must not voice it in, say, Russian.
  return (
    <h1
      ref={h1Ref}
      lang="en"
      className="m-0 font-serif text-(length:--cs-display) leading-none font-light tracking-(--cs-display-tracking) text-ink"
    >
      <span className="block whitespace-nowrap">
        <span ref={firstRef}>{first}</span>
      </span>
      <span className="block whitespace-nowrap pl-(--cs-display-indent)">
        <span ref={secondRef}>{second}</span>
      </span>
    </h1>
  );
}

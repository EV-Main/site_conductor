"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { mountTerrain } from "../lib/terrain/scene";

/**
 * Client island — the canvas and the two boxes the scene measures. The copy
 * above the field (`children`) and the E[V] caption (`label`) are rendered on
 * the server and only positioned here.
 */
export function TerrainHero({
  children,
  label,
  containerClassName,
}: {
  children: ReactNode;
  label: ReactNode;
  containerClassName: string;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current,
      field = fieldRef.current;
    const canvas = canvasRef.current,
      label = labelRef.current;
    if (!hero || !field || !canvas || !label) return;
    return mountTerrain({ hero, field, canvas, label });
  }, []);

  return (
    <div ref={heroRef} className="relative isolate flex flex-1 flex-col">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-1 block size-full"
      />
      <div className={`${containerClassName} flex flex-1 flex-col`}>
        {children}
        <div
          ref={fieldRef}
          className="relative mt-(--cs-field-mt) min-h-90 flex-1"
        >
          {/* `transform` is the scene's (it follows the anchor every frame);
              the side flip uses `translate`, a separate property, so the two
              compose instead of overwriting each other. */}
          <div
            ref={labelRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 -mt-9.5 flex flex-col items-start gap-1.25 whitespace-nowrap text-ink opacity-0 transition-opacity duration-800 will-change-transform data-left:items-end data-left:-translate-x-full data-on:opacity-100"
          >
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type Ctx = { height: number | null; setHeight: (h: number) => void };
const MatchHeightContext = createContext<Ctx | null>(null);

export function MatchHeightProvider({ children }: { children: ReactNode }) {
  const [height, setHeight] = useState<number | null>(null);
  return <MatchHeightContext.Provider value={{ height, setHeight }}>{children}</MatchHeightContext.Provider>;
}

/** Measures its children's rendered height and reports it up through MatchHeightProvider,
 *  so an unrelated sibling elsewhere in the tree (the desktop gallery) can size itself to
 *  match — e.g. the enquiry form card next to the property photo carousel. */
export function HeightReporter({ children }: { children: ReactNode }) {
  const ctx = useContext(MatchHeightContext);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ctx) return;
    const observer = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h) ctx.setHeight(h);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ctx]);

  return <div ref={ref}>{children}</div>;
}

export function useMatchedHeight() {
  return useContext(MatchHeightContext)?.height ?? null;
}

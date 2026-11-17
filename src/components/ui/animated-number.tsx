"use client";

import { useRef } from "react";
import NumberFlow from "@number-flow/react";
import { useInView } from "framer-motion";

/** Counts up from 0 the first time it scrolls into view (NumberFlow animates value changes). */
export function AnimatedNumber({ value, suffix = "", className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <span ref={ref} className={className} aria-label={`${value}${suffix}`}>
      <NumberFlow value={inView ? value : 0} suffix={suffix} trend={1} willChange aria-hidden />
    </span>
  );
}

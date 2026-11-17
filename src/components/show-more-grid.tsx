"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useIsDesktop } from "@/lib/use-is-desktop";

/** Wraps a grid of pre-rendered items and collapses it past a limit, with a "Show N
 *  more" toggle — used for Amenities / Specifications / Nearby Places so a long list
 *  doesn't dominate the page. Limit can differ for mobile vs desktop (e.g. fewer rows
 *  fit comfortably on a phone before it's worth collapsing).
 *
 *  Takes an `items` array (not a render-prop) on purpose: this is a Client Component,
 *  and a function passed as `children` from a Server Component can't cross that
 *  boundary (React can't serialize it) — it throws "Functions are not valid as a child
 *  of Client Components". An array of already-rendered elements serializes fine. */
export function ShowMoreGrid({
  items,
  limit,
  mobileLimit,
  className,
}: {
  items: ReactNode[];
  limit: number;
  mobileLimit?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isDesktop = useIsDesktop();
  const activeLimit = isDesktop || mobileLimit == null ? limit : mobileLimit;
  const hasMore = items.length > activeLimit;
  const visible = expanded ? items : items.slice(0, activeLimit);

  return (
    <div>
      <div className={className}>{visible}</div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary,#1b5e3a)]"
        >
          {expanded ? "Show less" : `Show ${items.length - activeLimit} more`}
          <ChevronDown size={13} className={expanded ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>
      )}
    </div>
  );
}

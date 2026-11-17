"use client";

import { useEffect } from "react";
import { logEvent } from "@/lib/track-event";
import { trackConversion } from "@/lib/pixels";

type Props = { propertyId: string; price?: number | null; title?: string };

/**
 * Per-property-view side effects: drops the id into a cookie so the homepage can render
 * "Recently Viewed", logs a property_view lead_event with UTM attribution, and fires the
 * ViewContent pixel event — the funnel step before a Lead (enquiry form submit).
 */
export function TrackView({ propertyId, price, title }: Props) {
  useEffect(() => {
    try {
      const existing = document.cookie
        .split("; ")
        .find((row) => row.startsWith("bhk_recent="))
        ?.split("=")[1];
      const ids = existing ? decodeURIComponent(existing).split(",").filter(Boolean) : [];
      const next = [propertyId, ...ids.filter((id) => id !== propertyId)].slice(0, 8);
      document.cookie = `bhk_recent=${encodeURIComponent(next.join(","))}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
    } catch {
      // ignore
    }

    trackConversion("ViewContent", { content_type: "product", content_ids: [propertyId], value: price, content_name: title });

    logEvent("property_view", { propertyId });
    document.body.dataset.propertyId = propertyId;
    return () => {
      delete document.body.dataset.propertyId;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  return null;
}

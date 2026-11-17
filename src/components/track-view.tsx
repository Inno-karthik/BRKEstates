"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getStoredUtm } from "@/lib/utm";
import { trackConversion } from "@/lib/pixels";

type Props = { propertyId: string; price?: number | null; title?: string };

/**
 * Per-property-view side effects: drops the id into a cookie so the homepage can render
 * "Recently Viewed", logs a page_view lead_event with UTM attribution, and fires the
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

    const utm = getStoredUtm();
    const supabase = createClient();
    void supabase.from("lead_events").insert({
      event_type: "page_view",
      property_id: propertyId,
      utm_source: utm.utm_source ?? null,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  return null;
}

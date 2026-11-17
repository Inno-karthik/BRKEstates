"use client";

import { createClient } from "@/lib/supabase/client";
import { getStoredUtm } from "@/lib/utm";
import { trackConversion } from "@/lib/pixels";
import type { LeadEventType } from "@/lib/types";

/** Logs a WhatsApp/call click (measured separately from form-submitted leads) and fires pixel events. */
export function trackClick(eventType: LeadEventType, propertyId?: string) {
  const utm = getStoredUtm();
  const supabase = createClient();
  void supabase.from("lead_events").insert({
    event_type: eventType,
    property_id: propertyId ?? null,
    utm_source: utm.utm_source ?? null,
    utm_medium: utm.utm_medium ?? null,
    utm_campaign: utm.utm_campaign ?? null,
  });
  if (eventType !== "page_view") trackConversion("Contact", { event_type: eventType });
}

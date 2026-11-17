"use client";

import { createClient } from "@/lib/supabase/client";
import { getStoredUtm } from "@/lib/utm";
import { trackConversion } from "@/lib/pixels";
import type { LeadEventType } from "@/lib/types";

const CONTACT_EVENTS: LeadEventType[] = ["whatsapp_click", "call_click", "email_click", "chat_lead"];

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** Anonymous, first-party visitor id (survives visits) and per-tab session id. */
export function getVisitorId(): string {
  return safe(() => {
    let id = localStorage.getItem("bkr_vid");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("bkr_vid", id);
    }
    return id;
  }, "anon");
}

export function getSessionId(): string {
  return safe(() => {
    let id = sessionStorage.getItem("bkr_sid");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("bkr_sid", id);
    }
    return id;
  }, "anon");
}

function deviceType() {
  const w = window.innerWidth;
  return w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop";
}

function externalReferrer(): string | null {
  return safe(() => {
    if (!document.referrer) return null;
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    return host === location.hostname.replace(/^www\./, "") ? null : host;
  }, null);
}

/** Records one analytics event (page views, clicks, searches…) in lead_events. Fire-and-forget. */
export function logEvent(
  eventType: LeadEventType,
  opts: { propertyId?: string; label?: string; path?: string } = {}
) {
  if (typeof window === "undefined") return;
  const utm = getStoredUtm();
  void createClient()
    .from("lead_events")
    .insert({
      event_type: eventType,
      property_id: opts.propertyId ?? null,
      label: opts.label ? opts.label.slice(0, 280) : null,
      path: (opts.path ?? location.pathname).slice(0, 280),
      referrer: externalReferrer(),
      device: deviceType(),
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      utm_source: utm.utm_source ?? null,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
    })
    .then(
      () => {},
      () => {}
    );
}

/** Logs a click/engagement event and fires the matching pixel conversion for contact actions. */
export function trackClick(eventType: LeadEventType, propertyId?: string, label?: string) {
  logEvent(eventType, { propertyId, label });
  if (CONTACT_EVENTS.includes(eventType)) trackConversion("Contact", { event_type: eventType });
}

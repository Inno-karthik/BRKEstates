"use client";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fires a standard conversion event on whichever pixels are configured (admin-set in Settings). */
export function trackConversion(event: "Lead" | "Contact" | "ViewContent", meta?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.fbq?.("track", event, meta);
  const gtagEvent = event === "Lead" ? "generate_lead" : event === "ViewContent" ? "view_item" : "contact";
  window.gtag?.("event", gtagEvent, meta);
}

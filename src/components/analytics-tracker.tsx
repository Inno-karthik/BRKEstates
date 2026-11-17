"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { logEvent, trackClick } from "@/lib/track-event";

const PRIVATE_PREFIXES = ["/admin", "/crm", "/vault-admin"];
const SOCIAL_HOSTS = /(facebook|instagram|youtube|youtu\.be|twitter|x\.com|linkedin|t\.me)/i;

/**
 * Site-wide analytics: a page view on every public route change, search detection on /listings,
 * and one delegated click listener that classifies calls, WhatsApp, email, directions, brochure
 * downloads, social links, property-card clicks and CTA buttons — without touching each component.
 * Links that already log themselves (TrackedLink) carry data-tracked and are skipped here.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || PRIVATE_PREFIXES.some((p) => pathname.startsWith(p))) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    logEvent("page_view", { path: pathname });

    if (pathname === "/listings" || pathname.startsWith("/locations")) {
      const q = new URLSearchParams(location.search);
      const parts = ["q", "type", "city", "minPrice", "maxPrice"].flatMap((k) => (q.get(k) ? [`${k}=${q.get(k)}`] : []));
      if (parts.length) logEvent("search", { label: parts.join(" · "), path: pathname });
    }
  }, [pathname]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const path = location.pathname;
      if (PRIVATE_PREFIXES.some((p) => path.startsWith(p))) return;
      const target = e.target as HTMLElement | null;
      const pid = document.body.dataset.propertyId;
      if (!target?.closest) return;

      const explicit = target.closest<HTMLElement>("[data-track]");
      const a = target.closest<HTMLAnchorElement>("a[href]");
      if (a?.dataset.tracked) return;

      if (explicit?.dataset.track) {
        trackClick("cta_click", pid, explicit.dataset.track);
        return;
      }
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const text = (a.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 60);

      if (href.startsWith("tel:")) return trackClick("call_click", pid, href.slice(4));
      if (/wa\.me|api\.whatsapp\.com|whatsapp:\/\//i.test(href)) return trackClick("whatsapp_click", pid, path);
      if (href.startsWith("mailto:")) return trackClick("email_click", pid, href.slice(7));
      if (/\.pdf($|\?)/i.test(href)) return trackClick("brochure_download", pid, href.split("/").pop());
      if (/google\.[a-z.]+\/maps|maps\.app\.goo\.gl|olamaps|goo\.gl\/maps/i.test(href)) {
        return trackClick("directions_click", pid, path);
      }
      if (/^https?:/i.test(href) && SOCIAL_HOSTS.test(href)) {
        return trackClick("social_click", undefined, new URL(href).hostname.replace(/^www\./, ""));
      }
      if (/^\/listings\/[^/?#]+/.test(href)) return trackClick("property_click", undefined, href.split("?")[0]);
      if (href === "/contact" || href.startsWith("/contact?")) {
        return trackClick("cta_click", undefined, `Contact: ${text || "link"}`);
      }
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

"use client";

import { usePathname } from "next/navigation";
import { PopupModal } from "@/components/popup-modal";
import type { Popup, PopupPage } from "@/lib/types";

function pageKeyFor(pathname: string): PopupPage | null {
  if (pathname === "/") return "home";
  if (pathname === "/listings") return "listings";
  if (pathname.startsWith("/listings/")) return "property";
  if (pathname === "/blog") return "blog";
  if (pathname.startsWith("/blog/")) return "blog_post";
  if (pathname.startsWith("/locations")) return "locations";
  if (pathname === "/about") return "about";
  if (pathname === "/contact") return "contact";
  return null;
}

function matchesPopup(popup: Popup, pageKey: PopupPage | null, currentSlug: string | null): boolean {
  // Scoped to one specific property — only that property's own page, no matter what
  // (if anything) is checked under "pages".
  if (popup.property_id) return !!currentSlug && popup.property?.slug === currentSlug;
  return popup.pages.length === 0 || (!!pageKey && popup.pages.includes(pageKey));
}

/** Several popups can be active at once, each scoped to its own pages (or every page, if
 *  none are picked) — shows at most one at a time, the most recently created match. */
export function PopupPageFilter({ popups }: { popups: Popup[] }) {
  const pathname = usePathname() ?? "/";
  const pageKey = pageKeyFor(pathname);
  const currentSlug = pathname.match(/^\/listings\/([^/]+)/)?.[1] ?? null;

  const match = popups.find((p) => matchesPopup(p, pageKey, currentSlug));
  if (!match) return null;

  return <PopupModal popup={match} />;
}

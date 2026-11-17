"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** The location map view (/locations/[slug]/map) and the site-wide "all properties"
 *  map (/map) are both meant to be full-screen with no site chrome around them — wraps
 *  Navbar/Footer/floating widgets so they hide on those routes only. */
export function HideOnMapRoute({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (/^\/locations\/[^/]+\/map\/?$/.test(pathname ?? "") || /^\/map\/?$/.test(pathname ?? "")) return null;
  return <>{children}</>;
}

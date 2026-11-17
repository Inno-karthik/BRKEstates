"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Search, Heart, MessageCircle } from "lucide-react";
import { getFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";
import { MobileSearchOverlay } from "@/components/mobile-search-overlay";
import type { PropertyType } from "@/lib/types";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: null, label: "Search", icon: Search },
  { href: "/favorites", label: "Saved", icon: Heart },
  { href: "/contact", label: "Contact", icon: MessageCircle },
] as const;

export function MobileBottomNav({ types = [] }: { types?: PropertyType[] }) {
  const pathname = usePathname();
  const [favCount, setFavCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const update = () => setFavCount(getFavorites().length);
    update();
    window.addEventListener("bhk-favorites-change", update);
    return () => window.removeEventListener("bhk-favorites-change", update);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="grid grid-cols-4">
          {items.map(({ href, label, icon: IconC }) => {
            const active = href ? (href === "/" ? pathname === "/" : pathname?.startsWith(href)) : false;
            const className = cn(
              "relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              active ? "text-[var(--color-primary,#9b1c1c)]" : "text-neutral-500"
            );
            const content = (
              <>
                <IconC size={22} strokeWidth={active ? 2.4 : 2} />
                {label}
                {label === "Saved" && favCount > 0 && (
                  <span className="absolute right-[26%] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent,#d4af37)] text-[9px] font-bold text-white">
                    {favCount}
                  </span>
                )}
              </>
            );
            if (!href) {
              return (
                <button key={label} type="button" onClick={() => setSearchOpen(true)} className={className}>
                  {content}
                </button>
              );
            }
            return (
              <Link key={href} href={href} className={className}>
                {content}
              </Link>
            );
          })}
        </div>
      </nav>

      <MobileSearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} types={types} />
    </>
  );
}

export function MobileBottomNavSpacer() {
  return <div className="h-16 md:hidden" />;
}

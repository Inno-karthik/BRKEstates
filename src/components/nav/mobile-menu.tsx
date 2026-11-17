"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Heart, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/icon";
import type { Location, PropertyType } from "@/lib/types";

export function MobileMenuButton({
  types,
  locations = [],
  siteName,
  logoUrl,
}: {
  types: PropertyType[];
  locations?: Location[];
  siteName: string;
  logoUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Portal target (document.body) only exists client-side, so this gates the createPortal call below.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const overlay = (
    <AnimatePresence>
      {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onPanEnd={(_, info) => {
              if (info.offset.x > 80 && Math.abs(info.offset.y) < 60) setOpen(false);
            }}
            className="fixed inset-0 z-[60] flex flex-col bg-white lg:hidden"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-5 py-4">
              <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
                <Image src={logoUrl || "/brand/logo.png"} alt={siteName} width={160} height={51} className="h-10 w-auto object-contain" />
              </Link>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
              <nav className="flex flex-col gap-0.5">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-base font-semibold text-neutral-900 hover:bg-neutral-50"
                >
                  Home
                </Link>
                <Link
                  href="/listings"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-base font-semibold text-neutral-900 hover:bg-neutral-50"
                >
                  All Listings
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-base font-semibold text-neutral-900 hover:bg-neutral-50"
                >
                  Blog
                </Link>
                <Link
                  href="/about"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-base font-semibold text-neutral-900 hover:bg-neutral-50"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-base font-semibold text-neutral-900 hover:bg-neutral-50"
                >
                  Contact
                </Link>
              </nav>

              {types.length > 0 && (
                <div className="mt-4 border-t border-black/5 pt-4">
                  <p className="mb-2.5 px-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Property Types
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {types.map((t) => (
                      <Link
                        key={t.id}
                        href={`/listings?type=${t.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-xl border border-black/5 bg-neutral-50 px-2.5 py-2.5 text-sm font-medium text-neutral-800"
                      >
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: `${t.accent_color ?? "#7f1d1d"}1a`, color: t.accent_color ?? "#7f1d1d" }}
                        >
                          <Icon name={t.icon_name} url={t.icon_url} size={14} />
                        </span>
                        <span className="truncate">{t.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {locations.length > 0 && (
                <div className="mt-4 border-t border-black/5 pt-4">
                  <p className="mb-2.5 px-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Locations
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {locations.map((l) => (
                      <Link
                        key={l.id}
                        href={`/locations/${l.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-xl border border-black/5 bg-neutral-50 px-2.5 py-2.5 text-sm font-medium text-neutral-800"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary,#7f1d1d)]/10 text-[var(--color-primary,#7f1d1d)]">
                          <MapPin size={14} />
                        </span>
                        <span className="truncate">{l.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 flex gap-2.5 border-t border-black/5 pt-4">
                <Link
                  href="/favorites"
                  onClick={() => setOpen(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-neutral-700"
                >
                  <Heart size={15} /> Favorites
                </Link>
              </div>
            </div>
          </motion.div>
        )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Rendered via portal — the header has backdrop-blur, which creates a new containing
          block for fixed-position descendants, confining "fixed inset-0" to the header's own
          small box instead of the viewport unless we escape it. */}
      {mounted && createPortal(overlay, document.body)}
    </>
  );
}

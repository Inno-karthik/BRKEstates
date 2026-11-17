"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/icon";
import type { PropertyType } from "@/lib/types";

export function MobileSearchOverlay({
  open,
  onClose,
  types,
}: {
  open: boolean;
  onClose: () => void;
  types: PropertyType[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // Reset the query whenever the overlay reopens.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQ("");
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  function go(params: URLSearchParams) {
    router.push(`/listings?${params.toString()}`);
    onClose();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    go(params);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[65] flex flex-col bg-white md:hidden"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-black/5 px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))]">
            <form onSubmit={submit} className="flex flex-1 items-center gap-2 rounded-full border border-black/10 bg-neutral-50 px-4 py-3">
              <Search size={17} className="shrink-0 text-neutral-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by location, title…"
                className="w-full bg-transparent text-sm outline-none"
              />
            </form>
            <button
              onClick={onClose}
              aria-label="Close search"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
              Browse by Property Type
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {types.map((t) => (
                <button
                  key={t.id}
                  onClick={() => go(new URLSearchParams({ type: t.slug }))}
                  className="flex items-center gap-2.5 rounded-xl border border-black/5 bg-neutral-50 px-3 py-3 text-left text-sm font-medium text-neutral-800"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${t.accent_color ?? "#9b1c1c"}1a`, color: t.accent_color ?? "#9b1c1c" }}
                  >
                    <Icon name={t.icon_name} url={t.icon_url} size={15} />
                  </span>
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => go(new URLSearchParams())}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--color-primary,#9b1c1c)] py-3.5 text-sm font-semibold text-white"
            >
              View All Listings
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

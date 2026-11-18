"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin } from "lucide-react";
import type { Location } from "@/lib/types";

export function NavLocationsDropdown({ locations }: { locations: Location[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-[var(--color-primary,#d0191f)]">
        Locations <ChevronDown size={15} className={open ? "rotate-180 transition" : "transition"} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full w-52 -translate-x-1/2 pt-3">
          <div className="rounded-xl border border-black/5 bg-white p-2 shadow-xl">
            {locations.map((l) => (
              <Link
                key={l.id}
                href={`/locations/${l.slug}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-[var(--color-primary,#d0191f)]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary,#d0191f)]/10 text-[var(--color-primary,#d0191f)]">
                  <MapPin size={16} />
                </span>
                {l.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

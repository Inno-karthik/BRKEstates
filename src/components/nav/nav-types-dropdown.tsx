"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Icon } from "@/components/icon";
import type { PropertyType } from "@/lib/types";

export function NavTypesDropdown({ types }: { types: PropertyType[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1 text-sm font-medium text-neutral-700 hover:text-[var(--color-primary,#d0191f)]">
        Property Types <ChevronDown size={15} className={open ? "rotate-180 transition" : "transition"} />
      </button>
      {open && (
        <div className="absolute left-1/2 top-full w-56 -translate-x-1/2 pt-3">
          <div className="rounded-xl border border-black/5 bg-white p-2 shadow-xl">
            {types.map((t) => (
              <Link
                key={t.id}
                href={`/listings?type=${t.slug}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-[var(--color-primary,#d0191f)]"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${t.accent_color ?? "#d0191f"}1a`, color: t.accent_color ?? "#d0191f" }}
                >
                  <Icon name={t.icon_name} url={t.icon_url} size={16} />
                </span>
                {t.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

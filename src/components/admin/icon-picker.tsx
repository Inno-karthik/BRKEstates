"use client";

import { useMemo, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { CURATED_ICON_NAMES } from "@/lib/icon-names";
import allIconNames from "@/lib/all-icon-names.json";
import { cn } from "@/lib/utils";
import { Search, Upload, X } from "lucide-react";

type Props = {
  value: string | null;
  onChange: (iconName: string | null) => void;
  iconUrl?: string | null;
  onUploadClick?: () => void;
};

export function IconPicker({ value, onChange, iconUrl, onUploadClick }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const btnRef = useRef<HTMLButtonElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return CURATED_ICON_NAMES;
    const q = query.toLowerCase();
    return (allIconNames as string[]).filter((n) => n.includes(q)).slice(0, 120);
  }, [query]);

  return (
    <div className="relative inline-block">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-black/10 bg-white hover:border-[var(--color-primary)] transition-colors"
      >
        <Icon name={value} url={iconUrl} size={22} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-2 w-72 rounded-xl border border-black/10 bg-white p-3 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-lg border border-black/10 px-2 py-1.5 flex-1">
                <Search size={14} className="text-neutral-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search icons…"
                  className="w-full text-sm outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-2 text-neutral-400 hover:text-neutral-700"
              >
                <X size={16} />
              </button>
            </div>

            {onUploadClick && (
              <button
                type="button"
                onClick={() => {
                  onUploadClick();
                  setOpen(false);
                }}
                className="mb-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-black/15 px-2 py-2 text-xs text-neutral-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                <Upload size={14} /> Upload custom icon image
              </button>
            )}

            <div className="grid max-h-56 grid-cols-7 gap-1 overflow-y-auto">
              {results.map((name) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-100",
                    value === name && "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  )}
                >
                  <Icon name={name} size={18} />
                </button>
              ))}
              {results.length === 0 && (
                <p className="col-span-7 py-4 text-center text-xs text-neutral-400">No icons found</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

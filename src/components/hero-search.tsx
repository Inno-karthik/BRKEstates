"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, MapPin, ChevronDown, ArrowUpRight } from "lucide-react";
import { Icon } from "@/components/icon";
import { getColorScheme } from "@/lib/color-schemes";
import { cn } from "@/lib/utils";
import type { Location, PropertyType } from "@/lib/types";

/** Custom-styled dropdown standing in for a native <select> — the browser's own option
 *  list (system font, harsh blue highlight) looks jarring against this rounded, white
 *  search pill, so it's rebuilt as a button + floating panel in the site's own palette. */
function SearchSelect({
  value,
  options,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 whitespace-nowrap text-sm text-neutral-700"
      >
        <span>{current ? current.label : placeholder}</span>
        <ChevronDown size={14} className={cn("shrink-0 text-neutral-400 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 max-h-64 w-full min-w-[12rem] overflow-y-auto rounded-xl border border-black/5 bg-white py-1.5 shadow-xl">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center px-3.5 py-2 text-left text-sm",
              !value ? "bg-[var(--color-primary,#9b1c1c)]/10 font-medium text-[var(--color-primary,#9b1c1c)]" : "text-neutral-700 hover:bg-neutral-50"
            )}
          >
            {placeholder}
          </button>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center px-3.5 py-2 text-left text-sm",
                value === o.value ? "bg-[var(--color-primary,#9b1c1c)]/10 font-medium text-[var(--color-primary,#9b1c1c)]" : "text-neutral-700 hover:bg-neutral-50"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function HeroSearch({ types, locations = [] }: { types: PropertyType[]; locations?: Location[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // A picked location already has its own curated listing page.
    if (location) {
      router.push(`/locations/${location}`);
      return;
    }
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    router.push(`/listings?${params.toString()}`);
  }

  // Picking a value from either dropdown fetches results right away — no need to also
  // press Search. Clearing a dropdown back to "All ..." just resets the field instead.
  function selectLocation(slug: string) {
    setLocation(slug);
    if (slug) router.push(`/locations/${slug}`);
  }

  function selectType(slug: string) {
    setType(slug);
    if (slug) {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("type", slug);
      router.push(`/listings?${params.toString()}`);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative z-20 flex w-full flex-col rounded-[1.5rem] bg-white/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)] ring-1 ring-white/20 backdrop-blur-xl sm:flex-row sm:items-center sm:rounded-full"
    >
      <div className="flex flex-1 items-center gap-2 px-5 py-3.5">
        <MapPin size={18} className="shrink-0 text-neutral-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by locality, project or city…"
          className="w-full bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
        />
      </div>

      {locations.length > 0 && (
        <div className="flex items-center gap-2 border-t border-black/5 px-4 py-3.5 sm:border-l sm:border-t-0">
          <SearchSelect
            value={location}
            onChange={selectLocation}
            placeholder="All Locations"
            options={locations.map((l) => ({ value: l.slug, label: l.name }))}
          />
        </div>
      )}

      {types.length > 0 && (
        <div className="flex items-center gap-2 border-t border-black/5 px-4 py-3.5 sm:border-l sm:border-t-0">
          <SearchSelect
            value={type}
            onChange={selectType}
            placeholder="All Property Types"
            options={types.map((t) => ({ value: t.slug, label: t.name }))}
          />
        </div>
      )}

      <button
        type="submit"
        className="m-1.5 flex shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--color-primary,#9b1c1c)] px-7 py-3 text-sm font-semibold text-white transition active:scale-[1.04]"
      >
        <Search size={18} /> Search
      </button>
    </form>
  );
}

export function TypeTile({ type }: { type: PropertyType }) {
  const scheme = getColorScheme(type.color_scheme);
  return (
    <a
      href={`/listings?type=${type.slug}`}
      className="group relative flex h-44 flex-col justify-between overflow-hidden rounded-[1.5rem] border border-black/5 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
      style={{ background: `linear-gradient(145deg, ${scheme.primary}14, ${scheme.secondary}0d)` }}
    >
      {type.image_url && (
        <Image
          src={type.image_url}
          alt=""
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover opacity-[0.14] transition-transform duration-500 group-hover:scale-110"
        />
      )}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30 blur-xl transition-opacity group-hover:opacity-50"
        style={{ background: `${scheme.accent}80` }}
      />
      <div className="relative flex items-start justify-between">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{ background: `${scheme.primary}1f`, color: scheme.primary }}
        >
          <Icon name={type.icon_name} url={type.icon_url} size={24} />
        </span>
        <ArrowUpRight
          size={16}
          className="text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-600"
        />
      </div>
      <div className="relative">
        <span className="block font-semibold text-neutral-900">{type.name}</span>
        {type.description && <span className="mt-0.5 block truncate text-xs text-neutral-500">{type.description}</span>}
      </div>
    </a>
  );
}

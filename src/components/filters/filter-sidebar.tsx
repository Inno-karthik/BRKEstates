"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";
import type { Amenity, AttributeDefinition, PropertyType } from "@/lib/types";
import { SlidersHorizontal, X } from "lucide-react";

type Props = {
  types: PropertyType[];
  amenities: Amenity[];
  attributeDefs: AttributeDefinition[];
};

export function FilterSidebar({ types, amenities, attributeDefs }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="mb-4 flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium lg:hidden"
      >
        <SlidersHorizontal size={15} /> Filters
      </button>

      <aside className="hidden w-full shrink-0 lg:block lg:w-72">
        <FilterForm types={types} amenities={amenities} attributeDefs={attributeDefs} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">Filters</h3>
              <button onClick={() => setMobileOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <FilterForm
              types={types}
              amenities={amenities}
              attributeDefs={attributeDefs}
              onApply={() => setMobileOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

function FilterForm({
  types,
  amenities,
  attributeDefs,
  onApply,
}: Props & { onApply?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const type = searchParams.get("type") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const city = searchParams.get("city") ?? "";
  const selectedAmenities = searchParams.get("amenities")?.split(",").filter(Boolean) ?? [];

  const activeDefs = attributeDefs.filter((d) => d.is_filterable && (!type || d.property_type_id));

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
    onApply?.();
  }

  function toggleAmenity(id: string) {
    const next = selectedAmenities.includes(id)
      ? selectedAmenities.filter((a) => a !== id)
      : [...selectedAmenities, id];
    updateParam("amenities", next.length ? next.join(",") : null);
  }

  function clearAll() {
    startTransition(() => router.push(pathname));
    onApply?.();
  }

  return (
    <div className="space-y-6 rounded-2xl border border-black/5 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Filters</h3>
        <button onClick={clearAll} className="text-xs font-medium text-[var(--color-primary,#1b5e3a)]">
          Clear all
        </button>
      </div>

      {types.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-neutral-700">Property Type</p>
          <div className="space-y-1">
            {types.map((t) => (
              <label key={t.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-neutral-50">
                <input
                  type="radio"
                  name="type"
                  checked={type === t.slug}
                  onChange={() => updateParam("type", t.slug)}
                  className="accent-[var(--color-primary,#1b5e3a)]"
                />
                <Icon name={t.icon_name} url={t.icon_url} size={14} />
                {t.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold text-neutral-700">Price Range (₹)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            onBlur={(e) => updateParam("minPrice", e.target.value || null)}
            className="w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-primary,#1b5e3a)]"
          />
          <span className="text-neutral-300">—</span>
          <input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            onBlur={(e) => updateParam("maxPrice", e.target.value || null)}
            className="w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-primary,#1b5e3a)]"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold text-neutral-700">City</p>
        <input
          type="text"
          placeholder="e.g. Hyderabad"
          defaultValue={city}
          onBlur={(e) => updateParam("city", e.target.value || null)}
          className="w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-primary,#1b5e3a)]"
        />
      </div>

      {activeDefs.length > 0 && type && (
        <div>
          <p className="mb-2 text-xs font-semibold text-neutral-700">Specifications</p>
          <div className="space-y-2">
            {activeDefs
              .filter((d) => d.field_type === "select" || d.field_type === "multiselect")
              .map((d) => (
                <select
                  key={d.id}
                  defaultValue={searchParams.get(d.key) ?? ""}
                  onChange={(e) => updateParam(d.key, e.target.value || null)}
                  className="w-full rounded-lg border border-black/10 px-2.5 py-1.5 text-sm outline-none"
                >
                  <option value="">{d.label}: Any</option>
                  {d.options.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ))}
          </div>
        </div>
      )}

      {amenities.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold text-neutral-700">Amenities</p>
          <div className="flex flex-wrap gap-2">
            {amenities.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAmenity(a.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  selectedAmenities.includes(a.id)
                    ? "border-[var(--color-primary,#1b5e3a)] bg-[var(--color-primary,#1b5e3a)]/10 text-[var(--color-primary,#1b5e3a)]"
                    : "border-black/10 text-neutral-600 hover:border-neutral-300"
                )}
              >
                <Icon name={a.icon_name} url={a.icon_url} size={13} />
                {a.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCompareIds, toggleCompare } from "@/lib/compare";
import { formatInventoryStat, formatPrice } from "@/lib/utils";
import type { AttributeDefinition, Property } from "@/lib/types";

export default function ComparePage() {
  const [properties, setProperties] = useState<Property[] | null>(null);
  const [defsByType, setDefsByType] = useState<Record<string, AttributeDefinition[]>>({});

  async function load() {
    const ids = getCompareIds();
    if (ids.length === 0) {
      setProperties([]);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("properties")
      .select("*, property_type:property_types(*), images:property_images(id,url,sort_order)")
      .in("id", ids);
    const props = (data as unknown as Property[]) ?? [];
    setProperties(props);

    const typeIds = Array.from(new Set(props.map((p) => p.type_id)));
    if (typeIds.length) {
      const { data: defs } = await supabase.from("attribute_definitions").select("*").in("property_type_id", typeIds);
      const grouped: Record<string, AttributeDefinition[]> = {};
      for (const d of (defs as unknown as AttributeDefinition[]) ?? []) {
        if (!grouped[d.property_type_id]) grouped[d.property_type_id] = [];
        grouped[d.property_type_id].push(d);
      }
      setDefsByType(grouped);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function remove(id: string) {
    toggleCompare(id);
    setProperties((prev) => prev?.filter((p) => p.id !== id) ?? null);
  }

  // union of all spec keys across compared properties, in first-seen order
  const allKeys: { key: string; label: string; unit: string | null }[] = [];
  const seen = new Set<string>();
  for (const p of properties ?? []) {
    for (const d of defsByType[p.type_id] ?? []) {
      if (!seen.has(d.key)) {
        seen.add(d.key);
        allKeys.push({ key: d.key, label: d.label, unit: d.unit });
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
      <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">Compare Properties</h1>
      <p className="mt-1 text-sm text-neutral-500">Side-by-side comparison of your selected properties.</p>

      {properties === null ? (
        <div className="mt-10 h-64 animate-pulse rounded-2xl bg-neutral-100" />
      ) : properties.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-black/10 py-20 text-center">
          <p className="text-lg font-semibold text-neutral-700">Nothing to compare yet</p>
          <p className="mt-1 text-sm text-neutral-500">Tap the scale icon on any project to add it here.</p>
          <Link href="/listings" className="mt-4 inline-block text-sm font-semibold text-[var(--color-primary,#d0191f)]">
            Explore projects
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="w-40"></th>
                {properties.map((p) => (
                  <th key={p.id} className="px-3 pb-4 text-left align-top">
                    <div className="relative">
                      <button
                        onClick={() => remove(p.id)}
                        className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow"
                      >
                        <X size={13} />
                      </button>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100">
                        {(p.cover_image || p.images?.[0]?.url) && (
                          <Image src={p.cover_image || p.images![0].url} alt={p.title} fill className="object-cover" unoptimized />
                        )}
                      </div>
                      <Link href={`/listings/${p.slug}`} className="mt-2 text-sm font-semibold text-neutral-900 hover:underline">
                        {p.title}
                      </Link>
                      <p className="text-xs font-bold text-[var(--color-primary,#d0191f)]">{formatPrice(p.price, p.price_label, false, p.area_unit, p.property_type?.slug)}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              <Row label="Type" values={properties.map((p) => p.property_type?.name ?? "—")} />
              <Row label="Location" values={properties.map((p) => [p.location, p.city].filter(Boolean).join(", ") || "—")} />
              <Row
                label="Area"
                values={properties.map(
                  (p) =>
                    formatInventoryStat(p.property_type?.slug, p.total_units, p.area_value, p.area_unit, p.area_value_max, p.unit_variants) ?? "—"
                )}
              />
              {allKeys.map(({ key, label, unit }) => (
                <Row
                  key={key}
                  label={label}
                  values={properties.map((p) => {
                    const v = p.attributes?.[key];
                    if (v === undefined || v === null || v === "") return "—";
                    return `${typeof v === "boolean" ? (v ? "Yes" : "No") : v}${unit ? ` ${unit}` : ""}`;
                  })}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <td className="whitespace-nowrap border-t border-black/5 py-2.5 pr-3 text-xs font-semibold text-neutral-500">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="border-t border-black/5 px-3 py-2.5 text-neutral-700">
          {v}
        </td>
      ))}
    </tr>
  );
}

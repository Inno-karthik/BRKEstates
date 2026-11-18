"use client";

import { useMemo, useState } from "react";
import { Car, Bike, DoorOpen, Calendar, FileCheck2, Droplets, Zap } from "lucide-react";
import { cn, formatArea, formatPrice } from "@/lib/utils";
import type { UnitVariant } from "@/lib/types";

const NO_FACING = "Any facing";

/** E-commerce-style configuration picker: BHK (like a product's Size) -> Facing ->
 *  variant name, each tier only shown when there's more than one option — with a
 *  detail card that updates live for the selection. */
export function UnitVariantSelector({ variants }: { variants: UnitVariant[] }) {
  const byBhk = useMemo(() => {
    const map = new Map<string, UnitVariant[]>();
    for (const v of variants) {
      const key = v.bhk != null ? String(v.bhk) : "other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    return [...map.entries()].sort(([a], [b]) => {
      if (a === "other") return 1;
      if (b === "other") return -1;
      return Number(a) - Number(b);
    });
  }, [variants]);

  const [activeBhk, setActiveBhk] = useState(byBhk[0]?.[0] ?? "other");
  const bhkGroup = useMemo(
    () => byBhk.find(([key]) => key === activeBhk)?.[1] ?? byBhk[0]?.[1] ?? [],
    [byBhk, activeBhk]
  );

  const byFacing = useMemo(() => {
    const map = new Map<string, UnitVariant[]>();
    for (const v of bhkGroup) {
      const key = v.facing || NO_FACING;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    return [...map.entries()];
  }, [bhkGroup]);

  const [activeFacingByBhk, setActiveFacingByBhk] = useState<Record<string, string>>({});
  const activeFacing = activeFacingByBhk[activeBhk] ?? byFacing[0]?.[0] ?? NO_FACING;
  const facingGroup = useMemo(
    () => byFacing.find(([key]) => key === activeFacing)?.[1] ?? byFacing[0]?.[1] ?? [],
    [byFacing, activeFacing]
  );

  const areaOf = (v: UnitVariant) => v.carpet_area ?? v.built_up_area ?? v.super_built_up_area ?? v.uds ?? null;

  const byArea = useMemo(() => {
    const map = new Map<string, UnitVariant[]>();
    for (const v of facingGroup) {
      const area = areaOf(v);
      const key = area != null ? formatArea(area, v.uds === area ? "sqyd" : "sqft") ?? String(area) : v.label;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    return [...map.entries()].sort(([, [a]], [, [b]]) => (areaOf(a) ?? 0) - (areaOf(b) ?? 0));
  }, [facingGroup]);

  const [activeAreaByKey, setActiveAreaByKey] = useState<Record<string, string>>({});
  const areaKey = `${activeBhk}::${activeFacing}`;
  const activeArea = activeAreaByKey[areaKey] ?? byArea[0]?.[0];
  const active = byArea.find(([key]) => key === activeArea)?.[1]?.[0] ?? byArea[0]?.[1]?.[0];

  if (!active) return null;

  const areas = [
    active.carpet_area != null && { label: "Carpet Area", value: formatArea(active.carpet_area, "sqft") },
    active.built_up_area != null && { label: "Built-up Area", value: formatArea(active.built_up_area, "sqft") },
    active.super_built_up_area != null && {
      label: "Super Built-up",
      value: formatArea(active.super_built_up_area, "sqft"),
    },
    active.uds != null && { label: "UDS", value: formatArea(active.uds, "sqyd") },
  ].filter(Boolean) as { label: string; value: string | null }[];

  const facts = [
    active.car_parking != null && { icon: Car, text: `${active.car_parking} Car Parking` },
    active.bike_parking != null && { icon: Bike, text: `${active.bike_parking} Bike Parking` },
    active.balconies != null && { icon: DoorOpen, text: `${active.balconies} Balconies` },
    active.expected_occupancy && { icon: Calendar, text: `Occupancy: ${active.expected_occupancy}` },
    active.occupancy_certificate && { icon: FileCheck2, text: `OC: ${active.occupancy_certificate}` },
    active.water_availability && { icon: Droplets, text: active.water_availability },
    active.power_backup && { icon: Zap, text: active.power_backup },
  ].filter(Boolean) as { icon: typeof Car; text: string }[];

  return (
    <div className="mb-8 rounded-2xl border border-black/5 bg-white p-5">
      <h2 className="mb-4 text-lg font-semibold text-neutral-900">Available Configurations</h2>

      {/* 1. BHK — primary tab, like a product's Size */}
      <div className="flex flex-wrap gap-2">
        {byBhk.map(([key, group]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveBhk(key)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              activeBhk === key
                ? "border-[var(--color-primary,#7f1d1d)] bg-[var(--color-primary,#7f1d1d)] text-white"
                : "border-black/10 text-neutral-600 hover:border-[var(--color-primary,#7f1d1d)]/40"
            )}
          >
            {key === "other" ? group[0]?.label || "Other" : `${key} BHK`}
          </button>
        ))}
      </div>

      {/* 2. Facing — like a product's Color */}
      {byFacing.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {byFacing.map(([facing]) => (
            <button
              key={facing}
              type="button"
              onClick={() => setActiveFacingByBhk((prev) => ({ ...prev, [activeBhk]: facing }))}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                facing === activeFacing
                  ? "border-[var(--color-accent,#d4af37)] bg-[var(--color-accent,#d4af37)]/10 text-[var(--color-secondary,#3b0b10)]"
                  : "border-black/10 text-neutral-500 hover:border-black/20"
              )}
            >
              {facing}
            </button>
          ))}
        </div>
      )}

      {/* 3. Area — when the same BHK + facing has more than one area option */}
      {byArea.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {byArea.map(([area]) => (
            <button
              key={area}
              type="button"
              onClick={() => setActiveAreaByKey((prev) => ({ ...prev, [areaKey]: area }))}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                area === activeArea
                  ? "border-[var(--color-primary,#7f1d1d)] bg-[var(--color-primary,#7f1d1d)]/10 text-[var(--color-primary,#7f1d1d)]"
                  : "border-black/10 text-neutral-500 hover:border-black/20"
              )}
            >
              {area}
            </button>
          ))}
        </div>
      )}

      {/* Detail card for the active selection */}
      <div
        className="mt-4 rounded-xl border border-[var(--color-primary,#7f1d1d)]/10 bg-gradient-to-br from-[var(--color-primary,#7f1d1d)]/[0.06] to-[var(--color-accent,#d4af37)]/[0.05] p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-neutral-900">{active.label}</p>
            {active.facing && <p className="mt-0.5 text-xs text-neutral-500">{active.facing} facing</p>}
          </div>
          {active.price != null && (
            <div className="rounded-lg bg-white/70 px-3 py-1.5 text-right">
              <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">Starting from</p>
              <p className="text-xl font-extrabold text-[var(--color-primary,#7f1d1d)]">
                {formatPrice(active.price, null, false)}
              </p>
            </div>
          )}
        </div>

        {areas.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {areas.map((a, i) => (
              <div key={i} className="rounded-lg bg-white/70 px-3 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">{a.label}</p>
                <p className="text-sm font-semibold text-neutral-800">{a.value}</p>
              </div>
            ))}
          </div>
        )}

        {facts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--color-primary,#7f1d1d)]/10 pt-4">
            {facts.map((f, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-neutral-600">
                <f.icon size={13} className="text-[var(--color-primary,#7f1d1d)]/50" />
                {f.text}
              </span>
            ))}
          </div>
        )}

        {(active.construction_status || active.total_units != null) && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-primary,#7f1d1d)]/10 pt-4">
            {active.construction_status && (
              <span className="rounded-full bg-[var(--color-accent,#d4af37)]/15 px-3 py-1 text-[11px] font-medium text-[var(--color-secondary,#3b0b10)]">
                {active.construction_status}
              </span>
            )}
            {active.total_units != null && (
              <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-neutral-600 shadow-sm">
                {active.total_units} units of this type
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

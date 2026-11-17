import { Icon } from "@/components/icon";
import { ShowMoreGrid } from "@/components/show-more-grid";
import type { AttributeDefinition, Amenity, Property } from "@/lib/types";
import { Check } from "lucide-react";

// Desktop limits are row counts × the desktop column count (3): Specifications 3 rows,
// Amenities 5 rows. Mobile is a single column, so its limit is the row count directly.
const SPEC_LIMIT_DESKTOP = 9;
const SPEC_LIMIT_MOBILE = 8;
const AMENITY_LIMIT_DESKTOP = 15;
const AMENITY_LIMIT_MOBILE = 12;

export function AttributesGrid({
  attributes,
  definitions,
}: {
  attributes: Property["attributes"];
  definitions: AttributeDefinition[];
}) {
  const entries = definitions
    .map((d) => ({ def: d, value: attributes[d.key] }))
    .filter((e) => e.value !== undefined && e.value !== null && e.value !== "" && !(Array.isArray(e.value) && e.value.length === 0));

  if (entries.length === 0) return null;

  const items = entries.map(({ def, value }) => (
    <div key={def.key} className="flex items-start gap-3 rounded-xl border border-black/5 bg-white p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary,#9b1c1c)]/10 text-[var(--color-primary,#9b1c1c)]">
        <Icon name={def.icon_name} size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] leading-snug text-neutral-500">{def.label}</p>
        <p className="text-[13px] font-semibold leading-snug text-neutral-900">
          {def.field_type === "boolean"
            ? value
              ? "Yes"
              : "No"
            : Array.isArray(value)
              ? value.join(", ")
              : String(value)}
          {def.unit ? ` ${def.unit}` : ""}
        </p>
      </div>
    </div>
  ));

  return (
    <ShowMoreGrid
      items={items}
      limit={SPEC_LIMIT_DESKTOP}
      mobileLimit={SPEC_LIMIT_MOBILE}
      className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
    />
  );
}

export function AmenitiesGrid({ amenities }: { amenities: Amenity[] }) {
  if (amenities.length === 0) return null;

  const items = amenities.map((a) => (
    <div key={a.id} className="flex items-start gap-2.5 rounded-xl border border-black/5 bg-white px-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent,#d4af37)]/10 text-[var(--color-accent,#d4af37)]">
        <Icon name={a.icon_name} url={a.icon_url} size={15} />
      </span>
      <span className="min-w-0 flex-1 text-[13px] leading-snug text-neutral-700">{a.name}</span>
      <Check size={13} className="mt-1 shrink-0 text-[var(--color-primary,#9b1c1c)]" />
    </div>
  ));

  return (
    <ShowMoreGrid
      items={items}
      limit={AMENITY_LIMIT_DESKTOP}
      mobileLimit={AMENITY_LIMIT_MOBILE}
      className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3"
    />
  );
}

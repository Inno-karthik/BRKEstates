import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { UnitVariant } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PER_UNIT_SUFFIX: Record<string, string> = { sqft: "/sqft", sqyd: "/sqyd" };

// Only these property types ever quote price as a rate rather than a flat total —
// everything else (apartment, villa, ...) stores a flat total price even though its
// area happens to be measured in sqft/sqyd, so the area unit alone doesn't mean the
// price is "per sqft".
const PER_UNIT_PRICE_TYPES = new Set(["open-plot", "farm-land"]);

/** Price is quoted per sqft/sqyd (a rate, not a flat total) only for land-based
 *  listings (Open Plots, Farm Land) — so only those get a "/sqft" or "/sqyd" suffix. */
export function pricePerUnitSuffix(areaUnit?: string | null, typeSlug?: string | null) {
  if (!typeSlug || !PER_UNIT_PRICE_TYPES.has(typeSlug)) return null;
  return areaUnit ? (PER_UNIT_SUFFIX[areaUnit] ?? null) : null;
}

function formatPriceAmount(price: number) {
  return price >= 10000000
    ? `₹${(price / 10000000).toFixed(2).replace(/\.?0+$/, "")} Cr`
    : price >= 100000
      ? `₹${(price / 100000).toFixed(2).replace(/\.?0+$/, "")} L`
      : `₹${price.toLocaleString("en-IN")}`;
}

/** Indian price formatting: below ₹1L shows the full number; ₹1L and above picks
 *  whichever of Lakh/Crore the value falls into — never anything else. */
export function formatPrice(
  price: number | null,
  label?: string | null,
  startingFrom = false,
  areaUnit?: string | null,
  typeSlug?: string | null
) {
  if (label) return label;
  if (price == null) return "Price on request";
  const amount = formatPriceAmount(price);
  const suffix = pricePerUnitSuffix(areaUnit, typeSlug) ?? "";
  return startingFrom ? `Starting from ${amount}${suffix}` : `${amount}${suffix}`;
}

/** Same as formatPrice but keeps the "/sqft" or "/sqyd" rate suffix separate from the
 *  amount, so callers can render it smaller/lighter instead of baked into the same
 *  bold price text. */
export function formatPriceParts(
  price: number | null,
  label?: string | null,
  startingFrom = false,
  areaUnit?: string | null,
  typeSlug?: string | null
): { prefix: string | null; amount: string; suffix: string | null } {
  if (label) {
    // Admins sometimes type the override as "From 65,00,000" / "Starting at ₹85L" rather
    // than a plain price — split off any leading words so it still gets the small-label /
    // bold-amount treatment instead of rendering as one oversized block.
    const match = label.match(/^([a-zA-Z][a-zA-Z\s]*?)\s+([₹\d].*)$/);
    if (match) return { prefix: match[1].trim(), amount: match[2].trim(), suffix: null };
    return { prefix: null, amount: label, suffix: null };
  }
  if (price == null) return { prefix: null, amount: "Price on request", suffix: null };
  const amount = formatPriceAmount(price);
  const suffix = pricePerUnitSuffix(areaUnit, typeSlug);
  return { prefix: startingFrom ? "Starting from" : null, amount, suffix };
}

export function formatArea(value: number | null, unit: string | null) {
  if (value == null) return null;
  return `${value.toLocaleString("en-IN")} ${unit ?? "sqft"}`;
}

/** Shows a size range ("1,200 - 1,800 sqft") when min/max genuinely differ, otherwise
 *  falls back to a single size — a project with every unit the same size shouldn't show
 *  a pointless "1,200 - 1,200 sqft". */
export function formatAreaRange(min: number | null, max: number | null, unit: string | null) {
  if (min == null && max == null) return null;
  if (min != null && max != null && max > min) {
    return `${min.toLocaleString("en-IN")} - ${max.toLocaleString("en-IN")} ${unit ?? "sqft"}`;
  }
  return formatArea(min ?? max, unit);
}

/** Derives a min/max size range from unit variants (apartment/villa configurations),
 *  preferring whichever area field each variant actually has filled in. */
export function unitVariantAreaRange(variants: UnitVariant[] | undefined | null): { min: number; max: number } | null {
  if (!variants?.length) return null;
  const areas = variants
    .map((v) => v.carpet_area ?? v.built_up_area ?? v.super_built_up_area)
    .filter((a): a is number => a != null);
  if (areas.length === 0) return null;
  return { min: Math.min(...areas), max: Math.max(...areas) };
}

const INVENTORY_LABELS: Record<string, { total: string; available: string; unit: string }> = {
  "open-plot": { total: "Total Plots", available: "Available Plots", unit: "Plots" },
  "farm-land": { total: "Total Farms", available: "Available Farms", unit: "Farms" },
  villa: { total: "Total Villas", available: "Available Villas", unit: "Villas" },
  apartment: { total: "Total Units", available: "Available Units", unit: "Units" },
};

export function unitInventoryLabels(typeSlug?: string | null) {
  return INVENTORY_LABELS[typeSlug ?? ""] ?? { total: "Total Units", available: "Available Units", unit: "Units" };
}

/** Right-hand stat shown on property cards/detail pages: plot/farm counts for
 *  multi-unit land projects, otherwise a size range when one applies (derived from unit
 *  variants' own areas first, then the property's own min/max fields) or a single size. */
export function formatInventoryStat(
  typeSlug: string | null | undefined,
  totalUnits: number | null | undefined,
  areaValue: number | null,
  areaUnit: string | null,
  areaValueMax?: number | null,
  variants?: UnitVariant[] | null
) {
  if ((typeSlug === "open-plot" || typeSlug === "farm-land") && totalUnits != null) {
    return `${totalUnits} ${unitInventoryLabels(typeSlug).unit}`;
  }
  const variantRange = unitVariantAreaRange(variants);
  if (variantRange) return formatAreaRange(variantRange.min, variantRange.max, areaUnit);
  if (areaValueMax != null) return formatAreaRange(areaValue, areaValueMax, areaUnit);
  return formatArea(areaValue, areaUnit);
}

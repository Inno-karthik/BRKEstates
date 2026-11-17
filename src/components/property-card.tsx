"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Ruler, Scale, Check, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { formatInventoryStat, formatPriceParts } from "@/lib/utils";
import { isFavorite, toggleFavorite } from "@/lib/favorites";
import { isComparing, toggleCompare } from "@/lib/compare";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/types";
import { motion } from "framer-motion";

export function PropertyCard({ property, index = 0 }: { property: Property; index?: number }) {
  const [fav, setFav] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [compareNotice, setCompareNotice] = useState<string | null>(null);

  useEffect(() => {
    // Sync from localStorage-backed favorites/compare state, which isn't available on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFav(isFavorite(property.id));
    setComparing(isComparing(property.id));
  }, [property.id]);

  const cover = property.cover_image || property.images?.[0]?.url;
  const priceParts = formatPriceParts(property.price, property.price_label, true, property.area_unit, property.property_type?.slug);
  const stat = formatInventoryStat(
    property.property_type?.slug,
    property.total_units,
    property.area_value,
    property.area_unit,
    property.area_value_max,
    property.unit_variants
  );
  // Freeze "now" at mount instead of reading the impure Date.now() during render.
  const [now] = useState(() => Date.now());
  const isNew = now - new Date(property.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[1.75rem] border border-black/[0.06] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--color-primary,#1b5e3a)]/30 hover:shadow-[0_24px_48px_-12px_rgba(15,61,38,0.18)]"
    >
      <Link href={`/listings/${property.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          {cover ? (
            <Image
              src={cover}
              alt={property.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 text-neutral-300">
              No image
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {property.property_type && (
                <span
                  className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur"
                  style={{ color: property.property_type.accent_color ?? "#1b5e3a" }}
                >
                  <Icon name={property.property_type.icon_name} url={property.property_type.icon_url} size={13} />
                  {property.property_type.name}
                </span>
              )}
              {property.status === "sold" && (
                <span className="rounded-full bg-neutral-900/90 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  Sold
                </span>
              )}
              {isNew && (
                <span className="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">New</span>
              )}
            </div>
            {property.featured && (
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent,#d4af37)] text-white shadow-sm"
                aria-label="Featured"
                title="Featured"
              >
                <Star size={13} fill="currentColor" />
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setFav(toggleFavorite(property.id));
              }}
              aria-label="Toggle favorite"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur transition hover:scale-110"
            >
              <svg
                viewBox="0 0 24 24"
                width={16}
                height={16}
                fill={fav ? "#d4af37" : "none"}
                stroke={fav ? "#d4af37" : "#374151"}
                strokeWidth={2}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                const result = toggleCompare(property.id, property.type_id);
                setComparing(result.list.includes(property.id));
                if (result.reason) {
                  setCompareNotice(
                    result.reason === "different-type"
                      ? "Clear your comparison first to compare a different property type"
                      : "You can compare up to 3 properties"
                  );
                  setTimeout(() => setCompareNotice(null), 2500);
                }
              }}
              aria-label="Toggle compare"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full shadow-md backdrop-blur transition hover:scale-110",
                comparing ? "bg-[var(--color-primary,#1b5e3a)] text-white" : "bg-white/95 text-neutral-600"
              )}
            >
              {comparing ? <Check size={15} /> : <Scale size={14} />}
            </button>
          </div>

          {compareNotice && (
            <div className="absolute inset-x-3 bottom-16 z-10 rounded-lg bg-neutral-900/95 px-3 py-2 text-center text-[11px] font-medium text-white shadow-lg">
              {compareNotice}
            </div>
          )}
        </div>
      </Link>

      <Link href={`/listings/${property.slug}`} className="block p-4">
        <h3 className="truncate text-[15px] font-semibold text-neutral-900">{property.title}</h3>
        {(property.location || property.city) && (
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-neutral-500">
            <MapPin size={12} />
            {[property.location, property.city].filter(Boolean).join(", ")}
          </p>
        )}

        <div className="mt-3.5 flex items-end justify-between border-t border-dashed border-black/[0.06] pt-3">
          <span>
            {priceParts.prefix && (
              <span className="block text-[10px] font-medium uppercase tracking-wide text-neutral-400">
                {priceParts.prefix}
              </span>
            )}
            <span className="block text-xl font-extrabold tracking-tight text-[var(--color-primary,#1b5e3a)]">
              {priceParts.amount}
              {priceParts.suffix && <span className="text-sm font-normal text-neutral-400">{priceParts.suffix}</span>}
            </span>
          </span>
          {stat && (
            <span className="flex items-center gap-1 text-xs font-medium text-neutral-500">
              <Ruler size={12} /> {stat}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

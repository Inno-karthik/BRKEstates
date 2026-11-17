import Image from "next/image";
import Link from "next/link";
import { formatPriceParts } from "@/lib/utils";
import type { Property } from "@/lib/types";

/** Compact horizontal rectangle card for the blog post sidebar — image on the left,
 *  details on the right, unlike the tall portrait PropertyCard used in listing grids. */
export function BlogSidebarPropertyCard({ property }: { property: Property }) {
  const cover = property.cover_image || property.images?.[0]?.url;
  const priceParts = formatPriceParts(property.price, property.price_label, true, property.area_unit, property.property_type?.slug);

  return (
    <Link
      href={`/listings/${property.slug}`}
      className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-black/5 bg-white p-2.5 shadow-sm transition hover:shadow-md"
    >
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        {cover ? (
          <Image
            src={cover}
            alt={property.title}
            fill
            sizes="112px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-neutral-300">No image</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-900">{property.title}</p>
        {(property.location || property.city) && (
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            {[property.location, property.city].filter(Boolean).join(", ")}
          </p>
        )}
        <p className="mt-1 text-sm font-extrabold text-[var(--color-primary,#7f1d1d)]">
          {priceParts.amount}
          {priceParts.suffix && <span className="text-xs font-normal text-neutral-400">{priceParts.suffix}</span>}
        </p>
      </div>
    </Link>
  );
}

"use client";

import { useEffect, useState } from "react";
import { PropertyCard } from "@/components/property-card";
import type { Property } from "@/lib/types";

/** Reads the bhk_recent cookie client-side instead of in the Server Component, so the
 *  homepage itself doesn't need next/headers' cookies() — that forces full dynamic
 *  rendering (no caching) for the whole page just for this one personalized section. */
export function RecentlyViewed() {
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const match = document.cookie.split("; ").find((row) => row.startsWith("bhk_recent="));
    const ids = match ? decodeURIComponent(match.split("=")[1]).split(",").filter(Boolean) : [];
    if (!ids.length) return;

    fetch(`/api/recent-properties?ids=${ids.join(",")}`)
      .then((res) => res.json() as Promise<{ properties?: Property[] }>)
      .then((data) => setProperties(data.properties ?? []))
      .catch(() => {});
  }, []);

  if (properties.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h2 className="mb-8 text-2xl font-bold text-neutral-900 md:text-3xl">Recently Viewed</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {properties.map((p, i) => (
          <PropertyCard key={p.id} property={p} index={i} />
        ))}
      </div>
    </section>
  );
}

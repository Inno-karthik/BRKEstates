"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getFavorites } from "@/lib/favorites";
import { PropertyCard } from "@/components/property-card";
import type { Property } from "@/lib/types";

export default function FavoritesPage() {
  const [properties, setProperties] = useState<Property[] | null>(null);

  useEffect(() => {
    const ids = getFavorites();
    if (ids.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProperties([]);
      return;
    }
    const supabase = createClient();
    supabase
      .from("properties")
      .select("*, property_type:property_types(*), images:property_images(id,url,sort_order)")
      .in("id", ids)
      .eq("status", "published")
      .then(({ data }) => setProperties((data as unknown as Property[]) ?? []));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">Your Shortlist</h1>
      <p className="mt-1 text-sm text-neutral-500">Properties you&apos;ve favorited, saved on this device</p>

      {properties === null ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-black/10 py-24 text-center">
          <HeartOff size={32} className="mb-3 text-neutral-300" />
          <p className="text-lg font-semibold text-neutral-700">Your shortlist is empty</p>
          <p className="mt-1 text-sm text-neutral-500">Tap the heart icon on any project to shortlist it here</p>
          <Link href="/listings" className="mt-4 text-sm font-semibold text-[var(--color-primary,#d0191f)]">
            Explore projects
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p, i) => (
            <PropertyCard key={p.id} property={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

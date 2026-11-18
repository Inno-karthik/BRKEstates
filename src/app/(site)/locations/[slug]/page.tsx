import { notFound } from "next/navigation";
import Link from "next/link";
import { Map } from "lucide-react";
import { PageTheme } from "@/components/theme-style";
import { PropertyCard } from "@/components/property-card";
import { getLocationBySlug, getLocationProperties } from "@/lib/queries";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) return {};
  return {
    title: location.meta_title || `Properties in ${location.name}`,
    description: location.meta_description || `Browse properties available in ${location.name}.`,
    alternates: { canonical: `/locations/${location.slug}` },
  };
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) notFound();

  const properties = await getLocationProperties(location.id);

  return (
    <PageTheme page="listings">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="min-w-0 flex-1 text-2xl font-bold text-neutral-900 md:text-3xl">{location.name}</h1>
            <Link
              href={`/locations/${location.slug}/map`}
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--color-primary,#d0191f)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Map size={15} /> Map View
            </Link>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {properties.length} propert{properties.length === 1 ? "y" : "ies"} found
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 py-24 text-center">
            <p className="text-lg font-semibold text-neutral-700">No properties here yet</p>
            <p className="mt-1 text-sm text-neutral-500">Check back soon, or explore all our projects.</p>
            <Link href="/listings" className="mt-4 text-sm font-semibold text-[var(--color-primary,#d0191f)]">
              View all projects
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {properties.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </PageTheme>
  );
}

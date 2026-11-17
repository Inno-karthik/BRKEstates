import Link from "next/link";
import { PageTheme } from "@/components/theme-style";
import { FilterSidebar } from "@/components/filters/filter-sidebar";
import { PropertyCard } from "@/components/property-card";
import { getAmenitiesForType, getActivePropertyTypes, getAttributeDefinitions, getSiteSettings, listProperties } from "@/lib/queries";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const seo = settings.page_seo?.listings;
  return {
    title: seo?.title || "All Listings",
    description: seo?.description || "Browse all apartments, villas, open plots and farm land listed with BRK Estates.",
    alternates: { canonical: "/listings" },
  };
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const types = await getActivePropertyTypes();

  const selectedType = types.find((t) => t.slug === sp.type);
  const [attributeDefs, amenities] = await Promise.all([
    selectedType ? getAttributeDefinitions(selectedType.id) : Promise.resolve([]),
    selectedType ? getAmenitiesForType(selectedType.id) : Promise.resolve([]),
  ]);

  const attrFilters: Record<string, string> = {};
  const multiselectKeys = new Set<string>();
  for (const d of attributeDefs) {
    if (sp[d.key]) attrFilters[d.key] = sp[d.key]!;
    if (d.field_type === "multiselect") multiselectKeys.add(d.key);
  }

  const page = Number(sp.page) || 1;
  const { properties, total, pageSize } = await listProperties({
    typeSlug: sp.type,
    q: sp.q,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    city: sp.city,
    amenityIds: sp.amenities?.split(",").filter(Boolean),
    attrs: attrFilters,
    multiselectKeys,
    sort: (sp.sort as "newest" | "price_asc" | "price_desc") ?? "newest",
    page,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <PageTheme page="listings">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 md:text-3xl">
            {selectedType ? selectedType.name : "All Properties"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">{total} propert{total === 1 ? "y" : "ies"} found</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <FilterSidebar types={types} amenities={amenities} attributeDefs={attributeDefs} />

          <div className="flex-1">
            {properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 py-24 text-center">
                <p className="text-lg font-semibold text-neutral-700">No properties match your filters</p>
                <p className="mt-1 text-sm text-neutral-500">Try adjusting or clearing some filters</p>
                <Link href="/listings" className="mt-4 text-sm font-semibold text-[var(--color-primary,#1b5e3a)]">
                  Clear all filters
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {properties.map((p, i) => (
                    <PropertyCard key={p.id} property={p} index={i} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      const params = new URLSearchParams(sp as Record<string, string>);
                      params.set("page", String(p));
                      return (
                        <Link
                          key={p}
                          href={`/listings?${params.toString()}`}
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                            p === page
                              ? "bg-[var(--color-primary,#1b5e3a)] text-white"
                              : "border border-black/10 text-neutral-600 hover:border-neutral-300"
                          }`}
                        >
                          {p}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageTheme>
  );
}

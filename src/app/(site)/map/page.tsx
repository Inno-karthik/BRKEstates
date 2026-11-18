import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LocationMapView } from "@/components/location-map-view";
import { getAllMappableProperties } from "@/lib/queries";
import type { Metadata } from "next";

// Prerendering would freeze the property list as of build time — this needs to reflect
// whatever is published right now, same reasoning as the per-location map page.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BKR Estates — Our Projects Across Visakhapatnam",
  description: "Every project BKR Estates represents, across every location, on one map.",
  robots: { index: false, follow: true },
};

export default async function AllPropertiesMapPage() {
  const properties = await getAllMappableProperties();

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-3">
        <Link
          href="/"
          className="-mx-2 -my-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
        >
          <ArrowLeft size={15} /> Back
        </Link>
        <p className="text-sm font-semibold text-neutral-900">BKR Estates — Our Projects Across Visakhapatnam</p>
      </div>
      <div className="flex-1">
        <LocationMapView properties={properties} />
      </div>
    </div>
  );
}

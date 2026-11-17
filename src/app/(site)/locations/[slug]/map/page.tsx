import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LocationMapView } from "@/components/location-map-view";
import { getLocationBySlug, getLocationProperties } from "@/lib/queries";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) return {};
  return { title: `Map — ${location.name}`, robots: { index: false, follow: true } };
}

export default async function LocationMapPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) notFound();

  const properties = await getLocationProperties(location.id);

  return (
    <div className="flex h-dvh flex-col">
      <div className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-3">
        <Link
          href={`/locations/${location.slug}`}
          className="-mx-2 -my-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
        >
          <ArrowLeft size={15} /> Back
        </Link>
        <p className="text-sm font-semibold text-neutral-900">{location.name}</p>
      </div>
      <div className="flex-1">
        <LocationMapView properties={properties} />
      </div>
    </div>
  );
}

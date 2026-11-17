import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPropertyById, getAllAmenitiesWithTypes } from "@/lib/admin-queries";
import { PropertyEditor } from "@/components/admin/property-editor";
import type { AttributeDefinition, PropertyType } from "@/lib/types";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [property, { data: types }, { data: defs }, amenities] = await Promise.all([
    getPropertyById(id),
    supabase.from("property_types").select("*").order("sort_order"),
    supabase.from("attribute_definitions").select("*").order("sort_order"),
    getAllAmenitiesWithTypes(),
  ]);

  if (!property) notFound();

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-neutral-900">Edit Property</h1>
      <PropertyEditor
        property={property}
        types={(types ?? []) as PropertyType[]}
        attributeDefs={(defs ?? []) as AttributeDefinition[]}
        amenities={amenities}
      />
    </div>
  );
}

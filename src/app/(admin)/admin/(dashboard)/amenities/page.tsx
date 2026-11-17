import { createClient } from "@/lib/supabase/server";
import { getAllAmenitiesWithTypes } from "@/lib/admin-queries";
import { AmenitiesManager } from "@/components/admin/amenities-manager";
import type { PropertyType } from "@/lib/types";

export default async function AmenitiesPage() {
  const supabase = await createClient();
  const [amenities, { data: types }] = await Promise.all([
    getAllAmenitiesWithTypes(),
    supabase.from("property_types").select("*").order("sort_order"),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Amenities</h1>
        <p className="text-sm text-neutral-500">
          Manage amenities with icons, and choose which property types each one applies to.
        </p>
      </div>
      <AmenitiesManager amenities={amenities} types={(types ?? []) as PropertyType[]} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { PropertyTypesManager } from "@/components/admin/property-types-manager";
import type { AttributeDefinition, PropertyType } from "@/lib/types";

export default async function PropertyTypesPage() {
  const supabase = await createClient();
  const [{ data: types }, { data: defs }] = await Promise.all([
    supabase.from("property_types").select("*").order("sort_order"),
    supabase.from("attribute_definitions").select("*").order("sort_order"),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Specifications</h1>
        <p className="text-sm text-neutral-500">Manage the spec fields shown for each fixed property category.</p>
      </div>
      <PropertyTypesManager
        types={(types ?? []) as PropertyType[]}
        attributeDefs={(defs ?? []) as AttributeDefinition[]}
      />
    </div>
  );
}

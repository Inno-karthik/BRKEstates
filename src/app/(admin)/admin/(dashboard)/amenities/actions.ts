"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertAmenity(input: {
  id?: string;
  name: string;
  icon_name?: string | null;
  is_active: boolean;
  propertyTypeIds: string[];
}) {
  const supabase = await createClient();
  const payload = {
    name: input.name,
    icon_name: input.icon_name || null,
    is_active: input.is_active,
  };

  let amenityId = input.id;
  if (amenityId) {
    const { error } = await supabase.from("amenities").update(payload).eq("id", amenityId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase.from("amenities").insert({ ...payload, sort_order: 999 }).select("id").single();
    if (error) throw new Error(error.message);
    amenityId = data.id;
  }

  await supabase.from("amenity_property_types").delete().eq("amenity_id", amenityId);
  if (input.propertyTypeIds.length) {
    await supabase
      .from("amenity_property_types")
      .insert(input.propertyTypeIds.map((property_type_id) => ({ amenity_id: amenityId, property_type_id })));
  }

  revalidatePath("/admin/amenities");
  revalidatePath("/", "layout");
}

export async function deleteAmenity(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("amenities").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/amenities");
  revalidatePath("/", "layout");
}

export async function toggleAmenityActive(id: string, is_active: boolean) {
  const supabase = await createClient();
  await supabase.from("amenities").update({ is_active }).eq("id", id);
  revalidatePath("/admin/amenities");
  revalidatePath("/", "layout");
}

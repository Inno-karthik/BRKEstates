"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export type LocationInput = {
  id?: string;
  name: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  sort_order: number;
  propertyIds: string[];
};

export async function upsertLocation(input: LocationInput) {
  const supabase = await createClient();
  const slug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name);

  const payload = {
    name: input.name,
    slug,
    meta_title: input.meta_title || null,
    meta_description: input.meta_description || null,
    is_active: input.is_active,
    sort_order: input.sort_order,
  };

  let locationId = input.id;
  if (locationId) {
    const { error } = await supabase.from("locations").update(payload).eq("id", locationId);
    if (error) throw new Error(error.message.includes("duplicate") ? "That URL slug is already in use by another location." : error.message);
  } else {
    const { data, error } = await supabase.from("locations").insert(payload).select("id").single();
    if (error) throw new Error(error.message.includes("duplicate") ? "That URL slug is already in use by another location." : error.message);
    locationId = data.id;
  }

  await supabase.from("location_properties").delete().eq("location_id", locationId);
  if (input.propertyIds.length) {
    await supabase
      .from("location_properties")
      .insert(input.propertyIds.map((property_id) => ({ location_id: locationId, property_id })));
  }

  revalidatePath("/admin/locations");
  revalidatePath("/", "layout");
  return { id: locationId };
}

export async function deleteLocation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("locations").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/locations");
  revalidatePath("/", "layout");
}

export async function setHomeMapEnabled(enabled: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").update({ home_map_enabled: enabled }).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/locations");
  revalidatePath("/", "layout");
}

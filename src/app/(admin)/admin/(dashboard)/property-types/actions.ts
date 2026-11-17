"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FieldType } from "@/lib/types";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function upsertAttributeDefinition(input: {
  id?: string;
  property_type_id: string;
  key: string;
  label: string;
  field_type: FieldType;
  unit?: string;
  options?: string[];
  icon_name?: string | null;
  is_filterable: boolean;
  is_required: boolean;
  sort_order: number;
}) {
  const supabase = await createClient();
  const payload = {
    property_type_id: input.property_type_id,
    key: slugify(input.key).replace(/-/g, "_"),
    label: input.label,
    field_type: input.field_type,
    unit: input.unit || null,
    options: input.options ?? [],
    icon_name: input.icon_name || null,
    is_filterable: input.is_filterable,
    is_required: input.is_required,
    sort_order: input.sort_order,
  };

  const { error } = input.id
    ? await supabase.from("attribute_definitions").update(payload).eq("id", input.id)
    : await supabase.from("attribute_definitions").insert(payload);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/property-types");
}

export async function deleteAttributeDefinition(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("attribute_definitions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/property-types");
}

export async function updatePropertyTypeImage(id: string, image_url: string | null) {
  const supabase = await createClient();
  const { error } = await supabase.from("property_types").update({ image_url }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/property-types");
  revalidatePath("/", "layout");
}

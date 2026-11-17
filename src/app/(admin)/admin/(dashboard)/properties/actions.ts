"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteFromR2 } from "@/lib/r2";
import type { Certification, GrowthHighlight, LayoutImage, MapPrecision, PropertyStatus, UnitVariant, VirtualTour } from "@/lib/types";

function sanitizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function slugify(input: string) {
  return sanitizeSlug(input) + "-" + Math.random().toString(36).slice(2, 6);
}

export type PropertyInput = {
  id?: string;
  title: string;
  slug?: string;
  type_id: string;
  status: PropertyStatus;
  featured: boolean;
  color_scheme: string;
  price?: number | null;
  price_label?: string;
  location?: string;
  city?: string;
  state?: string;
  area_value?: number | null;
  area_value_max?: number | null;
  area_unit?: string;
  latitude?: number | null;
  longitude?: number | null;
  map_precision: MapPrecision;
  description?: string;
  embed_code?: string;
  virtual_tours?: VirtualTour[];
  meta_title?: string;
  meta_description?: string;
  cover_image?: string | null;
  total_units?: number | null;
  available_units?: number | null;
  unit_variants?: UnitVariant[];
  certifications?: Certification[];
  layout_images?: LayoutImage[];
  growth_highlights?: GrowthHighlight[];
  attributes: Record<string, string | number | boolean | string[]>;
  amenityIds: string[];
};

/** Creates a minimal draft property and redirects straight into the editor, so photos,
 *  brochure and location are available immediately instead of after a first manual save. */
export async function createDraftProperty() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: firstType } = await supabase.from("property_types").select("id").order("sort_order").limit(1).single();
  if (!firstType) throw new Error("Create a property type first.");

  const { data, error } = await supabase
    .from("properties")
    .insert({
      title: "Untitled Property",
      type_id: firstType.id,
      status: "draft",
      slug: slugify("untitled-property"),
      created_by: user?.id,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin/properties");
  redirect(`/admin/properties/${data.id}/edit`);
}

export async function upsertProperty(input: PropertyInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    title: input.title,
    type_id: input.type_id,
    status: input.status,
    featured: input.featured,
    is_verified: true,
    color_scheme: input.color_scheme,
    price: input.price ?? null,
    price_label: input.price_label || null,
    location: input.location || null,
    city: input.city || null,
    state: input.state || null,
    area_value: input.area_value ?? null,
    area_value_max: input.area_value_max ?? null,
    area_unit: input.area_unit || "sqft",
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    map_precision: input.map_precision,
    description: input.description || null,
    embed_code: input.embed_code || null,
    virtual_tours: input.virtual_tours ?? [],
    growth_highlights: input.growth_highlights ?? [],
    meta_title: input.meta_title || null,
    meta_description: input.meta_description || null,
    cover_image: input.cover_image || null,
    total_units: input.total_units ?? null,
    available_units: input.available_units ?? null,
    unit_variants: input.unit_variants ?? [],
    certifications: input.certifications ?? [],
    layout_images: input.layout_images ?? [],
    attributes: input.attributes,
  };

  let propertyId = input.id;
  const customSlug = input.slug?.trim() ? sanitizeSlug(input.slug) : null;

  if (propertyId) {
    const { error } = await supabase
      .from("properties")
      .update(customSlug ? { ...payload, slug: customSlug } : payload)
      .eq("id", propertyId);
    if (error) throw new Error(error.message.includes("duplicate") ? "That URL slug is already in use by another property." : error.message);
  } else {
    const { data, error } = await supabase
      .from("properties")
      .insert({ ...payload, slug: customSlug || slugify(input.title), created_by: user?.id })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    propertyId = data.id;
  }

  await supabase.from("property_amenities").delete().eq("property_id", propertyId);
  if (input.amenityIds.length) {
    await supabase
      .from("property_amenities")
      .insert(input.amenityIds.map((amenity_id) => ({ property_id: propertyId, amenity_id })));
  }

  revalidatePath("/admin/properties");
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePath("/", "layout");
  return { id: propertyId };
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw new Error(error.message);

  // blog_sidebar_property_ids isn't a foreign key (it's a plain array on the settings
  // singleton), so a deleted property's id would otherwise sit there forever, quietly
  // miscounting the "X/5" picker in Settings.
  const { data: settings } = await supabase.from("site_settings").select("blog_sidebar_property_ids").eq("id", 1).single();
  if (settings?.blog_sidebar_property_ids?.includes(id)) {
    await supabase
      .from("site_settings")
      .update({ blog_sidebar_property_ids: settings.blog_sidebar_property_ids.filter((p: string) => p !== id) })
      .eq("id", 1);
  }

  revalidatePath("/admin/properties");
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

export async function addPropertyImage(propertyId: string, url: string, kind: "photo" | "floor_plan" | "render") {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("property_images")
    .select("sort_order")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;
  const { error } = await supabase.from("property_images").insert({ property_id: propertyId, url, kind, sort_order: nextOrder });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePath("/", "layout");
}

/** Persists a drag-and-drop reorder: sort_order becomes each id's position in orderedIds. */
export async function reorderPropertyImages(propertyId: string, orderedIds: string[]) {
  const supabase = await createClient();
  const results = await Promise.all(
    orderedIds.map((id, i) => supabase.from("property_images").update({ sort_order: i }).eq("id", id).eq("property_id", propertyId))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePath("/", "layout");
}

export async function deletePropertyImage(id: string, url: string, propertyId: string) {
  const supabase = await createClient();
  await supabase.from("property_images").delete().eq("id", id);
  try {
    await deleteFromR2(url);
  } catch {
    // best-effort
  }
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePath("/", "layout");
}

export async function setCoverImage(propertyId: string, url: string | null) {
  const supabase = await createClient();
  await supabase.from("properties").update({ cover_image: url }).eq("id", propertyId);
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePath("/", "layout");
}

export async function addNearbyPlace(input: {
  propertyId: string;
  name: string;
  category: string;
  placeId?: string;
  latitude: number;
  longitude: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("property_nearby_places").insert({
    property_id: input.propertyId,
    name: input.name,
    category: input.category,
    place_id: input.placeId ?? null,
    latitude: input.latitude,
    longitude: input.longitude,
    // Seconds (not ms) — property_nearby_places.sort_order is a 4-byte int and
    // Date.now() overflows it, which silently 500'd every add.
    sort_order: Math.floor(Date.now() / 1000),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/properties/${input.propertyId}/edit`);
  revalidatePath("/", "layout");
}

export async function removeNearbyPlace(id: string, propertyId: string) {
  const supabase = await createClient();
  await supabase.from("property_nearby_places").delete().eq("id", id);
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePath("/", "layout");
}

export async function setPropertyBrochure(propertyId: string, pdfUrl: string | null) {
  const supabase = await createClient();
  if (pdfUrl) {
    await supabase.from("property_brochures").upsert({ property_id: propertyId, pdf_url: pdfUrl });
  } else {
    await supabase.from("property_brochures").delete().eq("property_id", propertyId);
  }
  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePath("/", "layout");
}

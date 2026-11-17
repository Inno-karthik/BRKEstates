import { cache } from "react";
import { memo } from "@/lib/memo";
import { createPublicClient } from "@/lib/supabase/public";
import type {
  Amenity,
  AttributeDefinition,
  BlogPost,
  Location,
  Popup,
  Property,
  PropertyType,
  SiteSettings,
} from "@/lib/types";

/** Cached per-request — this is called from the layout, navbar and footer on every page,
 *  so dedupe the identical query instead of hitting Supabase 3-4x per load. */
export const getActivePropertyTypes = cache(memo("getActivePropertyTypes", async (): Promise<PropertyType[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("property_types")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
}));

export async function getAllPropertyTypes(): Promise<PropertyType[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("property_types")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}

/** Active amenities scoped to a given property type — nothing shows unless the admin has linked it. */
export async function getAmenitiesForType(propertyTypeId: string): Promise<Amenity[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("amenity_property_types")
    .select("amenity:amenities(*)")
    .eq("property_type_id", propertyTypeId);
  return ((data ?? []) as unknown as { amenity: Amenity }[])
    .map((r) => r.amenity)
    .filter((a) => a?.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export async function getAttributeDefinitions(propertyTypeId: string): Promise<AttributeDefinition[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("attribute_definitions")
    .select("*")
    .eq("property_type_id", propertyTypeId)
    .order("sort_order", { ascending: true });
  return (data ?? []).map((d) => ({ ...d, options: d.options ?? [] }));
}

/** Cached per-request — called from PixelScripts, Navbar, Footer and often the page itself. */
export const getSiteSettings = cache(memo("getSiteSettings", async (): Promise<SiteSettings> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  return (
    data ?? {
      id: 1,
      site_name: "BKR Estates",
      logo_url: null,
      favicon_url: null,
      phone: null,
      email: null,
      whatsapp: null,
      address: null,
      facebook_url: null,
      instagram_url: null,
      youtube_url: null,
      twitter_url: null,
      footer_text: null,
      meta_pixel_id: null,
      google_tag_id: null,
      google_ads_conversion_id: null,
      google_ads_conversion_label: null,
      whatsapp_default_message: null,
      blog_sidebar_title: null,
      blog_sidebar_property_ids: [],
      page_seo: {},
    }
  );
}));

/** Admin-curated "Popular Properties"-style sidebar shown on blog posts — preserves the
 *  order the admin picked them in, published only. */
export async function getBlogSidebarProperties(ids: string[]): Promise<Property[]> {
  if (!ids || ids.length === 0) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("*, property_type:property_types(*), images:property_images(id,url,sort_order)")
    .in("id", ids)
    .eq("status", "published");
  const byId = new Map((data ?? []).map((p) => [p.id, p as unknown as Property]));
  return ids.map((id) => byId.get(id)).filter((p): p is Property => !!p);
}


export type ListingFilters = {
  typeSlug?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  amenityIds?: string[];
  attrs?: Record<string, string>;
  /** Keys in `attrs` whose field_type is "multiselect" — filtered via array containment
   *  instead of exact string equality. */
  multiselectKeys?: Set<string>;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
};

export async function listProperties(filters: ListingFilters) {
  const supabase = createPublicClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;

  let query = supabase
    .from("properties")
    .select("*, property_type:property_types(*), images:property_images(id,url,sort_order)", {
      count: "exact",
    })
    .eq("status", "published");

  if (filters.typeSlug) {
    const { data: type } = await supabase
      .from("property_types")
      .select("id")
      .eq("slug", filters.typeSlug)
      .single();
    if (type) query = query.eq("type_id", type.id);
  }

  if (filters.q) {
    query = query.or(`title.ilike.%${filters.q}%,location.ilike.%${filters.q}%,city.ilike.%${filters.q}%`);
  }
  if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);

  if (filters.attrs) {
    for (const [key, value] of Object.entries(filters.attrs)) {
      if (!value) continue;
      if (filters.multiselectKeys?.has(key)) {
        query = query.contains(`attributes->${key}`, [value]);
      } else {
        query = query.eq(`attributes->>${key}`, value);
      }
    }
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.range((page - 1) * pageSize, page * pageSize - 1);

  const { data, count } = await query;
  let properties = (data ?? []) as unknown as Property[];

  if (filters.amenityIds?.length) {
    const { data: links } = await supabase
      .from("property_amenities")
      .select("property_id, amenity_id")
      .in("amenity_id", filters.amenityIds);
    const idsWithAll = new Map<string, Set<string>>();
    for (const l of links ?? []) {
      if (!idsWithAll.has(l.property_id)) idsWithAll.set(l.property_id, new Set());
      idsWithAll.get(l.property_id)!.add(l.amenity_id);
    }
    properties = properties.filter((p) => {
      const set = idsWithAll.get(p.id);
      return set && filters.amenityIds!.every((a) => set.has(a));
    });
  }

  return { properties, total: count ?? 0, page, pageSize };
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("*, property_type:property_types(*), images:property_images(id,url,sort_order)")
    .eq("status", "published")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as unknown as Property[];
}

export async function getPropertiesByIds(ids: string[]): Promise<Property[]> {
  if (!ids.length) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("*, property_type:property_types(*), images:property_images(id,url,sort_order)")
    .in("id", ids)
    .eq("status", "published");
  const byId = new Map((data ?? []).map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter(Boolean) as unknown as Property[];
}

/** Cached per-request — read by the navbar/mobile menu to show a Locations dropdown only
 *  when the admin has actually set one up, and by the location pages themselves. */
export const getActiveLocations = cache(memo("getActiveLocations", async (): Promise<Location[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("locations").select("*").eq("is_active", true).order("sort_order", { ascending: true });
  return data ?? [];
}));

export async function getLocationBySlug(slug: string): Promise<Location | null> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("locations").select("*").eq("slug", slug).eq("is_active", true).single();
  return data ?? null;
}

export async function getLocationProperties(locationId: string): Promise<Property[]> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("location_properties").select("property_id").eq("location_id", locationId);
  const ids = (data ?? []).map((r) => r.property_id as string);
  return getPropertiesByIds(ids);
}

/** Every published property with a map location, regardless of which location page (if
 *  any) it's assigned to — powers the site-wide "all properties on one map" page. */
export async function getAllMappableProperties(): Promise<Property[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select("*, property_type:property_types(*), images:property_images(id,url,sort_order)")
    .eq("status", "published")
    .not("latitude", "is", null)
    .not("longitude", "is", null);
  return (data ?? []) as unknown as Property[];
}

/** Cached per-request — backs the real-number "Properties Listed" stat shown on the
 *  homepage and About page, instead of a hand-typed figure admins forget to update. */
export const getPublishedPropertiesCount = cache(memo("getPublishedPropertiesCount", async (): Promise<number> => {
  const supabase = createPublicClient();
  const { count } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  return count ?? 0;
}));

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data ?? []) as unknown as BlogPost[];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("status", "published").single();
  return (data as unknown as BlogPost) ?? null;
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("properties")
    .select(
      "*, property_type:property_types(*), images:property_images(id,url,sort_order), brochure:property_brochures(pdf_url), amenities:property_amenities(amenity:amenities(*)), nearby_places:property_nearby_places(*)"
    )
    .eq("slug", slug)
    .single();

  if (!data) return null;

  type RawRow = Omit<Property, "amenities" | "brochure"> & {
    amenities: { amenity: Amenity }[];
    images: { id: string; url: string; sort_order: number }[];
    brochure: { pdf_url: string } | { pdf_url: string }[] | null;
  };
  const raw = data as unknown as RawRow;

  return {
    ...raw,
    amenities: raw.amenities?.map((a) => a.amenity).filter(Boolean) ?? [],
    images: [...(raw.images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    brochure: Array.isArray(raw.brochure) ? raw.brochure[0] ?? null : raw.brochure ?? null,
  };
}

/** Every currently-active popup (offer/festival greeting) — several can run at once, each
 *  targeted to its own set of pages. The client picks the one matching the current page. */
export async function getActivePopups(): Promise<Popup[]> {
  const supabase = createPublicClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("popups")
    .select("*, property:properties(slug, title)")
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as Popup[];
}

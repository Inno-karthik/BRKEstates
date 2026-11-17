import { createClient } from "@/lib/supabase/server";
import type { Amenity, Lead, LeadNote, Location, Profile, Property, PropertyDocument } from "@/lib/types";

/** The logged-in admin/staff user's own profile — drives section/area gating everywhere
 *  (sidebar links, dashboard layout redirects, the CMS/CRM/Vault chooser). */
export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (data as Profile) ?? null;
}

/** Staff accounts only — the default owner account(s) aren't shown/managed here. */
export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("role", "staff").order("created_at", { ascending: true });
  return (data ?? []) as Profile[];
}

export async function getAllAmenitiesWithTypes(): Promise<Amenity[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("amenities")
    .select("*, amenity_property_types(property_type_id)")
    .order("sort_order");
  return ((data ?? []) as unknown as (Amenity & { amenity_property_types: { property_type_id: string }[] })[]).map(
    (a) => ({ ...a, property_type_ids: a.amenity_property_types.map((l) => l.property_type_id) })
  );
}

export async function getAllProperties(): Promise<Property[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select("*, property_type:property_types(*), images:property_images(id,url,sort_order)")
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as Property[];
}

export async function getAllLocations(): Promise<(Location & { property_count: number; propertyIds: string[] })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("*, location_properties(property_id)")
    .order("sort_order", { ascending: true });
  return ((data ?? []) as unknown as (Location & { location_properties: { property_id: string }[] })[]).map((l) => ({
    ...l,
    property_count: l.location_properties.length,
    propertyIds: l.location_properties.map((r) => r.property_id),
  }));
}

export async function getLocationPropertyIds(locationId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("location_properties").select("property_id").eq("location_id", locationId);
  return (data ?? []).map((r) => r.property_id);
}

/** Vault: every property as a "folder", with its document count. */
export async function getVaultFolders() {
  const supabase = await createClient();
  const [{ data: properties }, { data: docs }] = await Promise.all([
    supabase
      .from("properties")
      .select("id, title, slug, cover_image, property_type:property_types(name, icon_name, accent_color)")
      .order("created_at", { ascending: false }),
    supabase.from("property_documents").select("property_id"),
  ]);
  const counts = new Map<string, number>();
  for (const d of docs ?? []) counts.set(d.property_id, (counts.get(d.property_id) ?? 0) + 1);
  return (properties ?? []).map((p) => ({ ...p, documentCount: counts.get(p.id) ?? 0 })) as unknown as (Pick<
    Property,
    "id" | "title" | "slug" | "cover_image"
  > & {
    property_type: { name: string; icon_name: string | null; accent_color: string | null } | null;
    documentCount: number;
  })[];
}

export async function getVaultDocuments(propertyId: string): Promise<PropertyDocument[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("property_documents")
    .select("*")
    .eq("property_id", propertyId)
    .order("sort_order");
  return (data ?? []) as PropertyDocument[];
}

export async function getPropertyById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("properties")
    .select(
      "*, images:property_images(id,url,sort_order,kind), brochure:property_brochures(pdf_url), property_amenities(amenity_id), nearby_places:property_nearby_places(*)"
    )
    .eq("id", id)
    .single();
  return data;
}

export async function getAllLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const [{ data: leads }, { data: notes }] = await Promise.all([
    supabase.from("leads").select("*, property:properties(title, slug)").order("created_at", { ascending: false }),
    supabase.from("lead_notes").select("*").order("created_at", { ascending: false }),
  ]);
  const notesByLead = new Map<string, LeadNote[]>();
  for (const n of (notes ?? []) as LeadNote[]) {
    if (!notesByLead.has(n.lead_id)) notesByLead.set(n.lead_id, []);
    notesByLead.get(n.lead_id)!.push(n);
  }
  return ((leads ?? []) as unknown as Lead[]).map((l) => ({ ...l, notes: notesByLead.get(l.id) ?? [] }));
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const supabase = await createClient();
  const [{ data: lead }, { data: notes }] = await Promise.all([
    supabase.from("leads").select("*, property:properties(title, slug)").eq("id", id).single(),
    supabase.from("lead_notes").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
  ]);
  if (!lead) return null;
  return { ...(lead as unknown as Lead), notes: (notes ?? []) as LeadNote[] };
}

export async function getDashboardStats() {
  const supabase = await createClient();
  const [{ count: totalProperties }, { count: published }, { count: totalLeads }, { count: newLeads }] =
    await Promise.all([
      supabase.from("properties").select("*", { count: "exact", head: true }),
      supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("leads").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    ]);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: leadsThisWeek } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekAgo);

  const { data: clickEvents } = await supabase
    .from("lead_events")
    .select("event_type")
    .gte("created_at", weekAgo);

  const whatsappClicks = clickEvents?.filter((e) => e.event_type === "whatsapp_click").length ?? 0;
  const callClicks = clickEvents?.filter((e) => e.event_type === "call_click").length ?? 0;

  return {
    totalProperties: totalProperties ?? 0,
    published: published ?? 0,
    totalLeads: totalLeads ?? 0,
    newLeads: newLeads ?? 0,
    leadsThisWeek: leadsThisWeek ?? 0,
    whatsappClicks,
    callClicks,
  };
}

export async function getLeadsBySource() {
  const supabase = await createClient();
  const { data } = await supabase.from("leads").select("utm_source");
  const counts = new Map<string, number>();
  for (const l of data ?? []) {
    const key = l.utm_source || "Direct / Organic";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

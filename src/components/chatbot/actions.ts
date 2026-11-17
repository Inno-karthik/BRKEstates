"use server";

import { createClient } from "@/lib/supabase/server";
import {
  listProperties,
  getActivePropertyTypes,
  getActiveLocations,
  getSiteSettings,
  getPropertyBySlug,
  getAttributeDefinitions,
} from "@/lib/queries";
import { formatArea, formatAreaRange, formatPrice } from "@/lib/utils";
import type { Property } from "@/lib/types";

export type BotSearchFilters = {
  typeSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
};

export async function searchPropertiesForBot(filters: BotSearchFilters): Promise<Property[]> {
  const { properties } = await listProperties({ ...filters, pageSize: 5, sort: "newest" });
  return properties;
}

export type BotPropertyCategory = "price" | "specs" | "amenities" | "nearby" | "overview";

/** Answers a question about one specific property, built entirely from its real stored
 *  data (price, attributes matched against that type's field definitions, amenities,
 *  nearby places) — this is the bot's actual "explain the property" capability, not just
 *  a lead-capture flow with a property's name attached to it. */
export type BotPropertyAnswer = { text: string; anchor?: { id: string; label: string } };

/** Beyond the plain answer, points back to the exact section on the property page that
 *  shows the same thing visually (map, EMI calculator, full specs grid) — so the bot
 *  actively steers the visitor to the richer in-page tools instead of just reciting text. */
export async function getBotPropertyAnswer(slug: string, category: BotPropertyCategory): Promise<BotPropertyAnswer> {
  const property = await getPropertyBySlug(slug);
  if (!property) return { text: "I couldn't find that property's details right now — sorry about that." };

  if (category === "price") {
    const parts: string[] = [];
    const typeSlug = property.property_type?.slug;
    if (property.price != null) parts.push(`Price: ${formatPrice(property.price, property.price_label, false, property.area_unit, typeSlug)}`);
    if (property.area_value != null) parts.push(`Area: ${formatAreaRange(property.area_value, property.area_value_max, property.area_unit)}`);
    if (property.unit_variants?.length) {
      const variantLines = property.unit_variants.slice(0, 4).map((v) => {
        const area = v.carpet_area ?? v.built_up_area ?? v.super_built_up_area;
        return `${v.label}${v.price != null ? ` — ${formatPrice(v.price, null, false, v.area_unit, typeSlug)}` : ""}${area != null ? ` (${formatArea(area, v.area_unit)})` : ""}`;
      });
      parts.push(`Available configurations:\n${variantLines.join("\n")}`);
    }
    if (parts.length === 0) return { text: "Pricing isn't listed for this one yet — our team can share the latest price on a call." };
    return {
      text: parts.join("\n"),
      anchor: property.price != null ? { id: "emi-calculator", label: "Try the EMI calculator" } : undefined,
    };
  }

  if (category === "amenities") {
    if (!property.amenities?.length) return { text: "No amenities have been listed for this property yet." };
    const names = property.amenities.map((a) => a.name);
    const shown = names.slice(0, 10).join(", ");
    return {
      text: `Amenities include: ${shown}${names.length > 10 ? `, and ${names.length - 10} more` : ""}.`,
      anchor: { id: "amenities", label: "View all amenities on the page" },
    };
  }

  if (category === "nearby") {
    if (!property.nearby_places?.length) return { text: "No nearby places have been added for this property yet." };
    const lines = property.nearby_places.slice(0, 6).map((p) => `${p.name} (${p.category.replace(/_/g, " ")})`);
    const hasMap = property.latitude != null && property.longitude != null;
    return {
      text: `Nearby:\n${lines.join("\n")}${hasMap ? "\n\nYou can explore all of these visually on the map in the Location & Nearby section of this page." : ""}`,
      anchor: hasMap ? { id: "nearby-map", label: "Explore on the map" } : undefined,
    };
  }

  if (category === "specs") {
    const defs = property.type_id ? await getAttributeDefinitions(property.type_id) : [];
    const entries = defs
      .map((d) => ({ def: d, value: property.attributes?.[d.key] }))
      .filter((e) => e.value !== undefined && e.value !== null && e.value !== "" && !(Array.isArray(e.value) && e.value.length === 0));
    if (entries.length === 0) return { text: "No detailed specifications have been added for this property yet." };
    const lines = entries.slice(0, 10).map(({ def, value }) => {
      const display = def.field_type === "boolean" ? (value ? "Yes" : "No") : Array.isArray(value) ? value.join(", ") : String(value);
      return `${def.label}: ${display}${def.unit ? ` ${def.unit}` : ""}`;
    });
    return { text: lines.join("\n"), anchor: { id: "specifications", label: "View full specifications" } };
  }

  // overview
  const plain = property.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return {
    text: plain
      ? plain.slice(0, 500)
      : "No description has been added for this property yet — ask me about price, specs, amenities or nearby places instead.",
  };
}

export async function getBotContext() {
  const [types, locations, settings] = await Promise.all([
    getActivePropertyTypes(),
    getActiveLocations(),
    getSiteSettings(),
  ]);
  return { types, locations, whatsapp: settings.whatsapp };
}

export async function submitBotLead(input: {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (!input.name.trim() || input.phone.trim().length < 7) {
    return { ok: false, error: "Please share a valid name and phone number." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: input.email?.trim() || null,
    message: input.message?.trim() || null,
    source: "chatbot",
    utm_source: "AI Assistant",
  });
  if (error) return { ok: false, error: "Something went wrong — please try again." };
  return { ok: true };
}

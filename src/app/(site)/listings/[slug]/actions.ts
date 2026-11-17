"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().optional(),
  propertyId: z.string().uuid().optional(),
  variant: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  landingPage: z.string().optional(),
});

export type LeadFormState = { ok: boolean; error?: string };

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message"),
    propertyId: formData.get("propertyId") || undefined,
    variant: formData.get("variant") || undefined,
    utmSource: formData.get("utmSource") || undefined,
    utmMedium: formData.get("utmMedium") || undefined,
    utmCampaign: formData.get("utmCampaign") || undefined,
    utmContent: formData.get("utmContent") || undefined,
    utmTerm: formData.get("utmTerm") || undefined,
    landingPage: formData.get("landingPage") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    message: parsed.data.message || null,
    property_id: parsed.data.propertyId || null,
    variant_label: parsed.data.variant || null,
    source: "website",
    utm_source: parsed.data.utmSource || null,
    utm_medium: parsed.data.utmMedium || null,
    utm_campaign: parsed.data.utmCampaign || null,
    utm_content: parsed.data.utmContent || null,
    utm_term: parsed.data.utmTerm || null,
    landing_page: parsed.data.landingPage || null,
  });

  if (error) return { ok: false, error: "Something went wrong. Please try again." };
  return { ok: true };
}

/** Gate for Layout/Floor Plan images and the Brochure — collects a lead before revealing
 *  either, same leads table as the main enquiry form, just tagged by what was unlocked. */
export async function submitUnlockLead(input: {
  propertyId: string;
  context: "Brochure" | "Layout & Floor Plans";
  name: string;
  phone: string;
  email?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (!name) return { ok: false, error: "Please enter your name." };
  if (phone.length < 7) return { ok: false, error: "Please enter a valid phone number." };

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    name,
    phone,
    email: input.email?.trim() || null,
    message: `Unlocked: ${input.context}`,
    property_id: input.propertyId,
    source: "website",
    utm_source: `${input.context} Unlock`,
  });

  if (error) return { ok: false, error: "Something went wrong. Please try again." };
  return { ok: true };
}

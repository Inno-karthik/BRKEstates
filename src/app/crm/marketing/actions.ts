"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";

export async function updateMarketingSettings(
  input: Pick<
    SiteSettings,
    | "meta_pixel_id"
    | "google_tag_id"
    | "google_ads_conversion_id"
    | "google_ads_conversion_label"
    | "whatsapp"
    | "whatsapp_default_message"
  >
) {
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").update(input).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

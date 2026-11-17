"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";

export async function updateSiteSettings(input: Omit<SiteSettings, "id">) {
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").update(input).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

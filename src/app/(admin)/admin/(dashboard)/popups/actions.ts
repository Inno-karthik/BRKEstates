"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertPopup(input: {
  id?: string;
  title: string;
  image_url: string | null;
  media_type?: "image" | "video";
  video_url?: string | null;
  target_url: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  pages: string[];
  property_id: string | null;
}) {
  const supabase = await createClient();
  const payload = {
    title: input.title || "Popup",
    image_url: input.image_url,
    media_type: input.media_type ?? "image",
    video_url: input.media_type === "video" ? input.video_url ?? null : null,
    target_url: input.target_url || null,
    is_active: input.is_active,
    starts_at: input.starts_at || null,
    ends_at: input.ends_at || null,
    pages: input.pages,
    property_id: input.property_id,
  };

  const { error } = input.id
    ? await supabase.from("popups").update(payload).eq("id", input.id)
    : await supabase.from("popups").insert(payload);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/popups");
  revalidatePath("/", "layout");
}

export async function deletePopup(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("popups").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/popups");
  revalidatePath("/", "layout");
}

export async function togglePopupActive(id: string, is_active: boolean) {
  const supabase = await createClient();
  await supabase.from("popups").update({ is_active }).eq("id", id);
  revalidatePath("/admin/popups");
  revalidatePath("/", "layout");
}

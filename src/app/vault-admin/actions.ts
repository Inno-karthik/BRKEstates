"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteFromR2 } from "@/lib/r2";

export async function addDocument(input: {
  propertyId: string;
  title: string;
  fileUrl: string;
  isConfidential: boolean;
  accessKey?: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("property_documents").insert({
    property_id: input.propertyId,
    title: input.title,
    file_url: input.fileUrl,
    is_confidential: input.isConfidential,
    access_key: input.isConfidential ? input.accessKey || null : null,
    sort_order: Math.floor(Date.now() / 1000),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/vault-admin/${input.propertyId}`);
  revalidatePath("/vault-admin");
}

export async function updateDocument(
  id: string,
  propertyId: string,
  patch: { title?: string; isConfidential?: boolean; accessKey?: string | null }
) {
  const supabase = await createClient();
  const payload: Record<string, unknown> = {};
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.isConfidential !== undefined) {
    payload.is_confidential = patch.isConfidential;
    if (!patch.isConfidential) payload.access_key = null;
  }
  if (patch.accessKey !== undefined) payload.access_key = patch.accessKey || null;

  const { error } = await supabase.from("property_documents").update(payload).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/vault-admin/${propertyId}`);
}

export async function deleteDocument(id: string, propertyId: string, fileUrl: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("property_documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await deleteFromR2(fileUrl).catch(() => {});
  revalidatePath(`/vault-admin/${propertyId}`);
  revalidatePath("/vault-admin");
}

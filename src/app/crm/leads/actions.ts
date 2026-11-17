"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/types";

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/crm/leads");
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/crm/leads");
}

// Returns a result object instead of throwing: a thrown Server Action error here was
// surfacing to the client as an opaque "Minified React error #441" (Next.js redacting
// the real message on the implicit re-render a throw triggers) instead of the actual
// "lead_notes table doesn't exist yet" message admins need to see.
export async function addLeadNote(leadId: string, note: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("lead_notes").insert({ lead_id: leadId, note });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/crm/leads");
  return { ok: true };
}

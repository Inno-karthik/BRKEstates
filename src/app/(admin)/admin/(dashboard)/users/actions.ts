"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CmsArea, StaffSection } from "@/lib/types";

async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") throw new Error("Only the account owner can manage users.");
}

export async function createStaffUser(input: {
  email: string;
  password: string;
  fullName?: string;
  sections: StaffSection[];
  cmsAreas: CmsArea[];
}) {
  await requireOwner();
  const adminClient = createAdminClient();

  const { data: created, error } = await adminClient.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);

  // The on_auth_user_created trigger already inserted a bare 'staff' profile row with no
  // access — upsert fills in the real name/sections/areas on top of it.
  const { error: profileError } = await adminClient.from("profiles").upsert({
    id: created.user.id,
    email: input.email,
    full_name: input.fullName || null,
    role: "staff",
    sections: input.sections,
    cms_areas: input.cmsAreas,
  });
  if (profileError) throw new Error(profileError.message);

  revalidatePath("/admin/users");
}

export async function updateStaffAccess(id: string, sections: StaffSection[], cmsAreas: CmsArea[]) {
  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ sections, cms_areas: cmsAreas }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function deleteStaffUser(id: string) {
  await requireOwner();
  const adminClient = createAdminClient();
  await adminClient.from("profiles").delete().eq("id", id);
  const { error } = await adminClient.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Pencil, UserCog } from "lucide-react";
import { Modal, FormField, inputClass } from "@/components/admin/modal";
import { createStaffUser, updateStaffAccess, deleteStaffUser } from "@/app/(admin)/admin/(dashboard)/users/actions";
import { CMS_AREAS, STAFF_SECTIONS, type CmsArea, type Profile, type StaffSection } from "@/lib/types";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm";

const SECTION_LABELS: Record<StaffSection, string> = { cms: "CMS", crm: "CRM", vault: "Vault" };
const AREA_LABELS: Record<CmsArea, string> = {
  properties: "Properties",
  "property-types": "Specifications",
  amenities: "Amenities",
  locations: "Locations",
  blog: "Blog",
  popups: "Popups",
  settings: "Settings",
};

export function UsersManager({ profiles }: { profiles: Profile[] }) {
  const confirm = useConfirm();
  const [editing, setEditing] = useState<Profile | "new" | null>(null);
  const [, startTransition] = useTransition();
  const staff = profiles.filter((p) => p.role === "staff");

  return (
    <div>
      <button
        onClick={() => setEditing("new")}
        className="mb-5 flex items-center gap-2 rounded-full bg-[#d0191f] px-4 py-2 text-sm font-semibold text-white"
      >
        <Plus size={15} /> Add User
      </button>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        {staff.map((p) => (
          <div key={p.id} className="flex items-center gap-3 border-b border-black/5 px-4 py-3 last:border-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d0191f]/10 text-[#d0191f]">
              <UserCog size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">{p.email}</p>
              <p className="truncate text-xs text-neutral-400">
                {p.sections.length === 0
                  ? "No access granted yet"
                  : p.sections
                      .map((s) => (s === "cms" ? `CMS (${p.cms_areas.map((a) => AREA_LABELS[a]).join(", ") || "no areas"})` : SECTION_LABELS[s]))
                      .join(" · ")}
              </p>
            </div>
            <button onClick={() => setEditing(p)} className="text-neutral-400 hover:text-neutral-700">
              <Pencil size={15} />
            </button>
            <button
              onClick={async () => { if (await confirm(`Remove ${p.email}'s access?`)) startTransition(async () => { await deleteStaffUser(p.id); toast.success("Deleted"); }); }}
              className="text-neutral-400 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {staff.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-400">
            No team members yet. Add one and choose exactly what they can access.
          </p>
        )}
      </div>

      {editing && <UserForm profile={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function UserForm({ profile, onClose }: { profile: Profile | null; onClose: () => void }) {
  const [email, setEmail] = useState(profile?.email ?? "");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [sections, setSections] = useState<StaffSection[]>(profile?.sections ?? []);
  const [cmsAreas, setCmsAreas] = useState<CmsArea[]>(profile?.cms_areas ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSection(s: StaffSection) {
    setSections((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }
  function toggleArea(a: CmsArea) {
    setCmsAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      if (profile) {
        await updateStaffAccess(profile.id, sections, cmsAreas);
      } else {
        if (!email.trim() || password.length < 8) {
          setError("Enter an email and a password of at least 8 characters.");
          setSaving(false);
          return;
        }
        await createStaffUser({ email: email.trim(), password, fullName: fullName.trim() || undefined, sections, cmsAreas });
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={profile ? "Edit Access" : "Add Team Member"} onClose={onClose}>
      <div className="space-y-3">
        {!profile && (
          <>
            <FormField label="Full Name (optional)">
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Temporary Password">
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="At least 8 characters" />
              <p className="mt-1 text-[11px] text-neutral-400">
                They can change this themselves later from Settings → Account — it becomes their own password, not yours.
              </p>
            </FormField>
          </>
        )}

        {profile && <p className="text-sm font-medium text-neutral-800">{profile.email}</p>}

        <FormField label="Access">
          <div className="flex flex-wrap gap-2">
            {STAFF_SECTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSection(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  sections.includes(s) ? "bg-[#d0191f] text-white" : "border border-black/10 text-neutral-600"
                }`}
              >
                {SECTION_LABELS[s]}
              </button>
            ))}
          </div>
        </FormField>

        {sections.includes("cms") && (
          <FormField label="CMS Areas">
            <div className="flex flex-wrap gap-2">
              {CMS_AREAS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleArea(a)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    cmsAreas.includes(a) ? "bg-[#d0191f]/10 text-[#d0191f] border border-[#d0191f]/30" : "border border-black/10 text-neutral-600"
                  }`}
                >
                  {AREA_LABELS[a]}
                </button>
              ))}
            </div>
          </FormField>
        )}

        <p className="text-[11px] text-neutral-400">Team members can never delete anything, in any section.</p>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-full bg-[#d0191f] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </Modal>
  );
}

import { getSiteSettings } from "@/lib/queries";
import { getAllProperties, getAllProfiles, getMyProfile } from "@/lib/admin-queries";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const me = await getMyProfile();
  const isOwner = !me || me.role === "admin";
  const [settings, properties, profiles] = await Promise.all([
    getSiteSettings(),
    getAllProperties(),
    isOwner ? getAllProfiles() : Promise.resolve([]),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">Site identity, contact details and marketing integrations.</p>
      </div>
      <SettingsForm settings={settings} properties={properties} profiles={profiles} isOwner={isOwner} />
    </div>
  );
}

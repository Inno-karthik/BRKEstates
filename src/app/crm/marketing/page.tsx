import { getSiteSettings } from "@/lib/queries";
import { MarketingSettingsForm } from "@/components/crm/marketing-settings-form";

export default async function MarketingSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Marketing Settings</h1>
        <p className="text-sm text-neutral-500">
          Ad pixels, conversion tracking and WhatsApp — everything that drives the lead funnel.
        </p>
      </div>
      <MarketingSettingsForm settings={settings} />
    </div>
  );
}

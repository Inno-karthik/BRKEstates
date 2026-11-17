"use client";

import { useState } from "react";
import { Check, Loader2, Megaphone, MessageCircle } from "lucide-react";
import { FormField, inputClass } from "@/components/admin/modal";
import { updateMarketingSettings } from "@/app/crm/marketing/actions";
import type { SiteSettings } from "@/lib/types";

export function MarketingSettingsForm({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await updateMarketingSettings({
        meta_pixel_id: form.meta_pixel_id,
        google_tag_id: form.google_tag_id,
        google_ads_conversion_id: form.google_ads_conversion_id,
        google_ads_conversion_label: form.google_ads_conversion_label,
        whatsapp: form.whatsapp,
        whatsapp_default_message: form.whatsapp_default_message,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Section icon={Megaphone} title="Ad Pixels &amp; Conversion Tracking">
        <p className="-mt-1 mb-2 text-xs text-neutral-400">
          Fires automatically: PageView on every visit, ViewContent when a property is opened, Lead when an enquiry
          is submitted, and a Contact event on WhatsApp/call clicks.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Meta Pixel ID">
            <input
              value={form.meta_pixel_id ?? ""}
              onChange={(e) => set("meta_pixel_id", e.target.value)}
              className={inputClass}
              placeholder="e.g. 1234567890"
            />
          </FormField>
          <FormField label="Google Tag ID (GA4)">
            <input
              value={form.google_tag_id ?? ""}
              onChange={(e) => set("google_tag_id", e.target.value)}
              className={inputClass}
              placeholder="e.g. G-XXXXXXX"
            />
          </FormField>
          <FormField label="Google Ads Conversion ID">
            <input
              value={form.google_ads_conversion_id ?? ""}
              onChange={(e) => set("google_ads_conversion_id", e.target.value)}
              className={inputClass}
              placeholder="e.g. AW-XXXXXXX"
            />
          </FormField>
          <FormField label="Google Ads Conversion Label">
            <input
              value={form.google_ads_conversion_label ?? ""}
              onChange={(e) => set("google_ads_conversion_label", e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
      </Section>

      <Section icon={MessageCircle} title="WhatsApp">
        <FormField label="WhatsApp Number">
          <input value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Default Message (used on the floating WhatsApp button)">
          <textarea
            value={form.whatsapp_default_message ?? ""}
            onChange={(e) => set("whatsapp_default_message", e.target.value)}
            rows={2}
            className={inputClass}
          />
        </FormField>
      </Section>

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
        {saved ? "Saved" : "Save Marketing Settings"}
      </button>
    </div>
  );
}

function Section({ icon: IconC, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        <IconC size={14} /> {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

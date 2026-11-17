"use client";

import { useState } from "react";
import { Check, Loader2, Search } from "lucide-react";
import { FormField, inputClass } from "@/components/admin/modal";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { UsersManager } from "@/components/admin/users-manager";
import { updateSiteSettings } from "@/app/(admin)/admin/(dashboard)/settings/actions";
import { cn } from "@/lib/utils";
import type { Profile, Property, SiteSettings } from "@/lib/types";

const MAX_SIDEBAR_PROPERTIES = 5;

const TABS = ["Identity", "Contact", "Social", "Blog Sidebar", "SEO", "Account", "Users"] as const;
type Tab = (typeof TABS)[number];
const NO_SAVE_BUTTON_TABS: Tab[] = ["Account", "Users"];

const SEO_PAGES: { key: string; label: string; defaultTitle: string }[] = [
  { key: "home", label: "Home", defaultTitle: "BKR Estates — Find Your Perfect Property" },
  { key: "about", label: "About Us", defaultTitle: "About Us" },
  { key: "contact", label: "Contact Us", defaultTitle: "Contact Us" },
  { key: "listings", label: "All Listings", defaultTitle: "All Listings" },
];

export function SettingsForm({
  settings,
  properties,
  profiles,
  isOwner,
}: {
  settings: SiteSettings;
  properties: Property[];
  profiles: Profile[];
  isOwner: boolean;
}) {
  const [form, setForm] = useState(settings);
  const [tab, setTab] = useState<Tab>("Identity");
  const visibleTabs = TABS.filter((t) => t !== "Users" || isOwner);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [propertySearch, setPropertySearch] = useState("");

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setPageSeo(pageKey: string, field: "title" | "description", value: string) {
    setForm((f) => ({
      ...f,
      page_seo: { ...(f.page_seo ?? {}), [pageKey]: { ...(f.page_seo?.[pageKey] ?? {}), [field]: value } },
    }));
  }

  function toggleSidebarProperty(id: string) {
    setForm((f) => {
      const current = f.blog_sidebar_property_ids ?? [];
      if (current.includes(id)) return { ...f, blog_sidebar_property_ids: current.filter((p) => p !== id) };
      if (current.length >= MAX_SIDEBAR_PROPERTIES) return f;
      return { ...f, blog_sidebar_property_ids: [...current, id] };
    });
  }

  const selectedSidebarIds = form.blog_sidebar_property_ids ?? [];
  const filteredProperties = properties.filter((p) => p.title.toLowerCase().includes(propertySearch.toLowerCase()));

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const { id, ...rest } = form;
      void id;
      await updateSiteSettings(rest);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-wrap gap-1.5 rounded-full border border-black/5 bg-white p-1.5">
        {visibleTabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition",
              tab === t ? "bg-[#9b1c1c] text-white" : "text-neutral-500 hover:bg-neutral-50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Identity" && (
        <Section title="Identity">
          <FormField label="Site Name">
            <input value={form.site_name} onChange={(e) => set("site_name", e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Logo">
            <ImageUploader value={form.logo_url} onChange={(url) => set("logo_url", url)} folder="brand" aspect="aspect-square max-w-[140px]" />
            <p className="mt-1 text-[11px] text-neutral-400">Recommended: 512×512px, square, transparent PNG</p>
          </FormField>
        </Section>
      )}

      {tab === "Contact" && (
        <Section title="Contact">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Phone">
              <input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Email">
              <input value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Address">
              <input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} className={inputClass} />
            </FormField>
          </div>
          <p className="text-xs text-neutral-400">
            WhatsApp number and ad pixel settings have moved to CRM → Marketing Settings.
          </p>
        </Section>
      )}

      {tab === "Social" && (
        <Section title="Social Links">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Facebook URL">
              <input value={form.facebook_url ?? ""} onChange={(e) => set("facebook_url", e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Instagram URL">
              <input value={form.instagram_url ?? ""} onChange={(e) => set("instagram_url", e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="YouTube URL">
              <input value={form.youtube_url ?? ""} onChange={(e) => set("youtube_url", e.target.value)} className={inputClass} />
            </FormField>
            <FormField label="Twitter / X URL">
              <input value={form.twitter_url ?? ""} onChange={(e) => set("twitter_url", e.target.value)} className={inputClass} />
            </FormField>
          </div>
          <FormField label="Footer Text">
            <input value={form.footer_text ?? ""} onChange={(e) => set("footer_text", e.target.value)} className={inputClass} />
          </FormField>
        </Section>
      )}

      {tab === "Blog Sidebar" && (
        <Section title="Blog Sidebar">
          <p className="-mt-1 mb-2 text-xs text-neutral-400">
            Shown on every blog post as a sticky sidebar. Pick up to {MAX_SIDEBAR_PROPERTIES} properties —
            leave empty to hide the sidebar.
          </p>
          <FormField label="Heading">
            <input
              value={form.blog_sidebar_title ?? ""}
              onChange={(e) => set("blog_sidebar_title", e.target.value)}
              className={inputClass}
              placeholder="e.g. Popular Properties"
            />
          </FormField>
          <FormField label={`Properties (${selectedSidebarIds.length}/${MAX_SIDEBAR_PROPERTIES})`}>
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2">
              <Search size={14} className="shrink-0 text-neutral-400" />
              <input
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
                placeholder="Search properties…"
                className="w-full text-sm outline-none"
              />
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-black/5 p-1.5">
              {filteredProperties.map((p) => {
                const checked = selectedSidebarIds.includes(p.id);
                const disabled = !checked && selectedSidebarIds.length >= MAX_SIDEBAR_PROPERTIES;
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleSidebarProperty(p.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition",
                      checked ? "bg-[#9b1c1c]/10 text-[#9b1c1c]" : disabled ? "text-neutral-300" : "text-neutral-700 hover:bg-neutral-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        checked ? "border-[#9b1c1c] bg-[#9b1c1c] text-white" : "border-black/20"
                      )}
                    >
                      {checked && <Check size={11} />}
                    </span>
                    <span className="truncate">{p.title}</span>
                  </button>
                );
              })}
              {filteredProperties.length === 0 && <p className="px-2.5 py-2 text-xs text-neutral-400">No properties found.</p>}
            </div>
          </FormField>
        </Section>
      )}

      {tab === "SEO" && (
        <Section title="Page SEO">
          <p className="-mt-1 mb-2 text-xs text-neutral-400">
            Overrides for each page&apos;s search-result title and description. Leave blank to use the default.
          </p>
          <div className="space-y-4">
            {SEO_PAGES.map((page) => (
              <div key={page.key} className="rounded-xl border border-black/5 bg-neutral-50 p-3.5">
                <p className="mb-2 text-xs font-semibold text-neutral-600">{page.label}</p>
                <FormField label="Meta Title">
                  <input
                    value={form.page_seo?.[page.key]?.title ?? ""}
                    onChange={(e) => setPageSeo(page.key, "title", e.target.value)}
                    className={inputClass}
                    placeholder={page.defaultTitle}
                  />
                </FormField>
                <FormField label="Meta Description">
                  <textarea
                    value={form.page_seo?.[page.key]?.description ?? ""}
                    onChange={(e) => setPageSeo(page.key, "description", e.target.value)}
                    rows={2}
                    className={inputClass}
                    placeholder="Shown in search results"
                  />
                </FormField>
              </div>
            ))}
          </div>
        </Section>
      )}

      {tab === "Account" && <ChangePasswordForm />}

      {tab === "Users" && isOwner && (
        <div>
          <p className="-mt-1 mb-4 text-xs text-neutral-400">
            Create logins for your team and choose exactly which sections and CMS areas each one can access.
          </p>
          <UsersManager profiles={profiles} />
        </div>
      )}

      {error && !NO_SAVE_BUTTON_TABS.includes(tab) && <p className="text-sm text-red-600">{error}</p>}

      {!NO_SAVE_BUTTON_TABS.includes(tab) && (
      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-1.5 rounded-full bg-[#9b1c1c] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
        {saved ? "Saved" : "Save Settings"}
      </button>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Check, MapPin } from "lucide-react";
import { Modal, FormField, inputClass } from "@/components/admin/modal";
import { upsertLocation, deleteLocation } from "@/app/(admin)/admin/(dashboard)/locations/actions";
import { cn } from "@/lib/utils";
import type { Location, Property } from "@/lib/types";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm";

type LocationRow = Location & { property_count: number; propertyIds: string[] };

export function LocationsManager({ locations, properties }: { locations: LocationRow[]; properties: Property[] }) {
  const confirm = useConfirm();
  const [editing, setEditing] = useState<LocationRow | "new" | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div>
      <button
        onClick={() => setEditing("new")}
        className="mb-5 flex items-center gap-2 rounded-full bg-[#d0191f] px-4 py-2 text-sm font-semibold text-white"
      >
        <Plus size={15} /> Add Location
      </button>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        {locations.map((l) => (
          <div key={l.id} className="flex items-center gap-3 border-b border-black/5 px-4 py-3 last:border-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#d0191f]/10 text-[#d0191f]">
              <MapPin size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">{l.name}</p>
              <p className="truncate text-xs text-neutral-400">
                /locations/{l.slug} · {l.property_count} {l.property_count === 1 ? "property" : "properties"}
              </p>
            </div>
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
                l.is_active ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"
              )}
            >
              {l.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
              {l.is_active ? "Active" : "Hidden"}
            </span>
            <button onClick={() => setEditing(l)} className="text-neutral-400 hover:text-neutral-700">
              <Pencil size={15} />
            </button>
            <button
              onClick={async () => { if (await confirm(`Delete "${l.name}"?`)) startTransition(async () => { await deleteLocation(l.id); toast.success("Deleted"); }); }}
              className="text-neutral-400 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {locations.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-400">
            No locations yet. Add one to group properties by area, e.g. &quot;Rushikonda&quot; or &quot;Madhurawada&quot;.
          </p>
        )}
      </div>

      {editing && (
        <LocationForm
          location={editing === "new" ? null : editing}
          properties={properties}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function LocationForm({
  location,
  properties,
  onClose,
}: {
  location: LocationRow | null;
  properties: Property[];
  onClose: () => void;
}) {
  const [name, setName] = useState(location?.name ?? "");
  const [slug, setSlug] = useState(location?.slug ?? "");
  const [metaTitle, setMetaTitle] = useState(location?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(location?.meta_description ?? "");
  const [isActive, setIsActive] = useState(location?.is_active ?? true);
  const [propertyIds, setPropertyIds] = useState<string[]>(location?.propertyIds ?? []);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleProperty(id: string) {
    setPropertyIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  const filtered = properties.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await upsertLocation({
        id: location?.id,
        name,
        slug,
        meta_title: metaTitle,
        meta_description: metaDescription,
        is_active: isActive,
        sort_order: location?.sort_order ?? 0,
        propertyIds,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save location");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={location ? "Edit Location" : "New Location"} onClose={onClose}>
      <div className="space-y-3">
        <FormField label="Name">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!location) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
            }}
            className={inputClass}
            placeholder="e.g. Rushikonda"
          />
        </FormField>
        <FormField label="URL Slug">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
        </FormField>
        <FormField label="Meta Title (SEO, optional)">
          <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputClass} placeholder={name} />
        </FormField>
        <FormField label="Meta Description (SEO, optional)">
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            className={inputClass}
          />
        </FormField>

        <FormField label={`Properties (${propertyIds.length} selected)`}>
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2">
            <Search size={14} className="shrink-0 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties…"
              className="w-full text-sm outline-none"
            />
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-black/5 p-1.5">
            {filtered.map((p) => {
              const checked = propertyIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProperty(p.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition",
                    checked ? "bg-[#d0191f]/10 text-[#d0191f]" : "text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      checked ? "border-[#d0191f] bg-[#d0191f] text-white" : "border-black/20"
                    )}
                  >
                    {checked && <Check size={11} />}
                  </span>
                  <span className="truncate">{p.title}</span>
                </button>
              );
            })}
            {filtered.length === 0 && <p className="px-2.5 py-2 text-xs text-neutral-400">No properties found.</p>}
          </div>
        </FormField>

        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active (shown in the nav menu and listed publicly)
        </label>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          onClick={save}
          disabled={saving || !name}
          className="w-full rounded-full bg-[#d0191f] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Location"}
        </button>
      </div>
    </Modal>
  );
}

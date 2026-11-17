"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Icon } from "@/components/icon";
import { IconPicker } from "@/components/admin/icon-picker";
import { Modal, FormField, inputClass } from "@/components/admin/modal";
import { cn } from "@/lib/utils";
import type { Amenity, PropertyType } from "@/lib/types";
import { upsertAmenity, deleteAmenity, toggleAmenityActive } from "@/app/(admin)/admin/(dashboard)/amenities/actions";

export function AmenitiesManager({ amenities, types }: { amenities: Amenity[]; types: PropertyType[] }) {
  const [editing, setEditing] = useState<Amenity | "new" | null>(null);
  const [, startTransition] = useTransition();

  function typeNames(a: Amenity) {
    if (!a.property_type_ids?.length) return "No property types linked";
    return a.property_type_ids.map((id) => types.find((t) => t.id === id)?.name).filter(Boolean).join(", ");
  }

  return (
    <div>
      <button
        onClick={() => setEditing("new")}
        className="mb-5 flex items-center gap-2 rounded-full bg-[#1b5e3a] px-4 py-2 text-sm font-semibold text-white"
      >
        <Plus size={15} /> Add Amenity
      </button>

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        {amenities.map((a) => (
          <div key={a.id} className="flex items-center gap-3 border-b border-black/5 px-4 py-3 last:border-0">
            <Icon name={a.icon_name} url={a.icon_url} size={16} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-800">{a.name}</p>
              <p className="truncate text-xs text-neutral-400">{typeNames(a)}</p>
            </div>
            <button
              onClick={() => startTransition(() => toggleAmenityActive(a.id, !a.is_active))}
              className={cn("shrink-0 text-neutral-400 hover:text-neutral-700", a.is_active && "text-emerald-600")}
              title={a.is_active ? "Active" : "Hidden"}
            >
              {a.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button onClick={() => setEditing(a)} className="shrink-0 text-neutral-400 hover:text-neutral-700">
              <Pencil size={15} />
            </button>
            <button
              onClick={() => confirm(`Delete "${a.name}"?`) && startTransition(() => deleteAmenity(a.id))}
              className="shrink-0 text-neutral-400 hover:text-red-600"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {amenities.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-400">
            No amenities yet. Add things like Swimming Pool, Gym, Security, Parking…
          </p>
        )}
      </div>

      {editing && <AmenityForm amenity={editing === "new" ? null : editing} types={types} onClose={() => setEditing(null)} />}
    </div>
  );
}

function AmenityForm({
  amenity,
  types,
  onClose,
}: {
  amenity: Amenity | null;
  types: PropertyType[];
  onClose: () => void;
}) {
  const [name, setName] = useState(amenity?.name ?? "");
  const [iconName, setIconName] = useState<string | null>(amenity?.icon_name ?? "sparkles");
  const [isActive, setIsActive] = useState(amenity?.is_active ?? true);
  const [typeIds, setTypeIds] = useState<string[]>(amenity?.property_type_ids ?? []);
  const [saving, setSaving] = useState(false);

  function toggleType(id: string) {
    setTypeIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  async function save() {
    setSaving(true);
    try {
      await upsertAmenity({ id: amenity?.id, name, icon_name: iconName, is_active: isActive, propertyTypeIds: typeIds });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={amenity ? "Edit Amenity" : "New Amenity"} onClose={onClose}>
      <div className="space-y-3">
        <FormField label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Swimming Pool" />
        </FormField>

        <FormField label="Applies to property types">
          <div className="flex flex-wrap gap-2">
            {types.map((t) => {
              const checked = typeIds.includes(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleType(t.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    checked ? "border-[#1b5e3a] bg-[#1b5e3a]/10 text-[#1b5e3a]" : "border-black/10 text-neutral-600"
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
            {types.length === 0 && <p className="text-xs text-neutral-400">Add a property type first.</p>}
          </div>
        </FormField>

        <div className="flex items-center gap-4">
          <FormField label="Icon">
            <IconPicker value={iconName} onChange={setIconName} />
          </FormField>
          <label className="mt-5 flex items-center gap-2 text-sm text-neutral-600">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
        </div>
        <button
          onClick={save}
          disabled={saving || !name}
          className="w-full rounded-full bg-[#1b5e3a] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronDown } from "lucide-react";
import { Icon } from "@/components/icon";
import { IconPicker } from "@/components/admin/icon-picker";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Modal, FormField, inputClass } from "@/components/admin/modal";
import { cn } from "@/lib/utils";
import { getColorScheme } from "@/lib/color-schemes";
import type { AttributeDefinition, FieldType, PropertyType } from "@/lib/types";
import {
  upsertAttributeDefinition,
  deleteAttributeDefinition,
  updatePropertyTypeImage,
} from "@/app/(admin)/admin/(dashboard)/property-types/actions";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm";

const FIELD_TYPES: FieldType[] = ["number", "text", "select", "multiselect", "boolean"];

export function PropertyTypesManager({
  types,
  attributeDefs,
}: {
  types: PropertyType[];
  attributeDefs: AttributeDefinition[];
}) {
  const [expanded, setExpanded] = useState<string | null>(types[0]?.id ?? null);

  return (
    <div>
      <p className="mb-5 max-w-xl text-sm text-neutral-500">
        Apartments, Villas, Open Plots and Farm Land are the fixed property categories. You can&apos;t add or remove
        categories, but you can manage the specification fields shown for each — bedrooms, facing, extent, and so on.
      </p>

      <div className="space-y-3">
        {types.map((t) => (
          <div key={t.id} className="rounded-2xl border border-black/5 bg-white">
            <button
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  background: `${getColorScheme(t.color_scheme).primary}1a`,
                  color: getColorScheme(t.color_scheme).primary,
                }}
              >
                <Icon name={t.icon_name} url={t.icon_url} size={18} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-neutral-900">{t.name}</p>
                {t.description && <p className="text-xs text-neutral-400">{t.description}</p>}
              </div>
              <ChevronDown size={16} className={cn("text-neutral-400 transition", expanded === t.id && "rotate-180")} />
            </button>

            {expanded === t.id && (
              <>
                <div className="border-t border-black/5 bg-neutral-50/60 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Homepage Background Image
                  </p>
                  <ImageUploader
                    value={t.image_url}
                    onChange={(url) => updatePropertyTypeImage(t.id, url)}
                    folder="property-types"
                    aspect="aspect-[16/9]"
                    className="max-w-xs"
                  />
                  <p className="mt-1 text-[11px] text-neutral-400">Recommended: 1200×675px (16:9)</p>
                </div>
                <AttributeFieldsEditor
                  propertyTypeId={t.id}
                  fields={attributeDefs.filter((d) => d.property_type_id === t.id)}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AttributeFieldsEditor({ propertyTypeId, fields }: { propertyTypeId: string; fields: AttributeDefinition[] }) {
  const confirm = useConfirm();
  const [editingField, setEditingField] = useState<AttributeDefinition | "new" | null>(null);

  return (
    <div className="border-t border-black/5 bg-neutral-50/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Specification Fields ({fields.length})
        </p>
        <button
          onClick={() => setEditingField("new")}
          className="flex items-center gap-1 text-xs font-semibold text-[#9b1c1c]"
        >
          <Plus size={13} /> Add Field
        </button>
      </div>

      <div className="space-y-1.5">
        {fields.map((f) => (
          <div key={f.id} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs">
            <Icon name={f.icon_name} size={14} />
            <span className="font-medium text-neutral-800">{f.label}</span>
            <span className="text-neutral-400">({f.field_type}{f.unit ? `, ${f.unit}` : ""})</span>
            {f.is_required && <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] text-red-600">required</span>}
            <span className="ml-auto flex gap-2">
              <button onClick={() => setEditingField(f)} className="text-neutral-400 hover:text-neutral-700">
                <Pencil size={13} />
              </button>
              <button
                onClick={async () => { if (await confirm(`Delete field "${f.label}"?`)) { await deleteAttributeDefinition(f.id); toast.success("Deleted"); } }}
                className="text-neutral-400 hover:text-red-600"
              >
                <Trash2 size={13} />
              </button>
            </span>
          </div>
        ))}
        {fields.length === 0 && <p className="text-xs text-neutral-400">No fields yet for this type.</p>}
      </div>

      {editingField && (
        <AttributeFieldForm
          propertyTypeId={propertyTypeId}
          field={editingField === "new" ? null : editingField}
          nextSortOrder={fields.length}
          onClose={() => setEditingField(null)}
        />
      )}
    </div>
  );
}

function AttributeFieldForm({
  propertyTypeId,
  field,
  nextSortOrder,
  onClose,
}: {
  propertyTypeId: string;
  field: AttributeDefinition | null;
  nextSortOrder: number;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(field?.label ?? "");
  const [fieldType, setFieldType] = useState<FieldType>(field?.field_type ?? "text");
  const [unit, setUnit] = useState(field?.unit ?? "");
  const [optionsText, setOptionsText] = useState(field?.options.join(", ") ?? "");
  const [iconName, setIconName] = useState<string | null>(field?.icon_name ?? "list");
  const [filterable, setFilterable] = useState(field?.is_filterable ?? true);
  const [required, setRequired] = useState(field?.is_required ?? false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await upsertAttributeDefinition({
        id: field?.id,
        property_type_id: propertyTypeId,
        key: field?.key ?? label,
        label,
        field_type: fieldType,
        unit,
        options: optionsText.split(",").map((o) => o.trim()).filter(Boolean),
        icon_name: iconName,
        is_filterable: filterable,
        is_required: required,
        sort_order: field?.sort_order ?? nextSortOrder,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={field ? "Edit Field" : "New Field"} onClose={onClose}>
      <div className="space-y-3">
        <FormField label="Label">
          <input value={label} onChange={(e) => setLabel(e.target.value)} className={inputClass} placeholder="e.g. Bedrooms" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Field Type">
            <select value={fieldType} onChange={(e) => setFieldType(e.target.value as FieldType)} className={inputClass}>
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Unit (optional)">
            <input value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass} placeholder="e.g. sqft" />
          </FormField>
        </div>
        {(fieldType === "select" || fieldType === "multiselect") && (
          <FormField label="Options (comma-separated)">
            <input
              value={optionsText}
              onChange={(e) => setOptionsText(e.target.value)}
              className={inputClass}
              placeholder="North, South, East, West"
            />
          </FormField>
        )}
        <FormField label="Icon">
          <IconPicker value={iconName} onChange={setIconName} />
        </FormField>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input type="checkbox" checked={filterable} onChange={(e) => setFilterable(e.target.checked)} />
            Show as filter
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
            Required
          </label>
        </div>
        <button
          onClick={save}
          disabled={saving || !label}
          className="w-full rounded-full bg-[#9b1c1c] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Field"}
        </button>
      </div>
    </Modal>
  );
}

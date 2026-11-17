"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, Loader2, Plus, Search, X } from "lucide-react";
import { FormField, inputClass } from "@/components/admin/modal";
import { PriceInput } from "@/components/admin/price-input";
import { Icon } from "@/components/icon";
import { IconPicker } from "@/components/admin/icon-picker";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { LocationPicker } from "@/components/admin/location-picker";
import { SchemePicker } from "@/components/admin/scheme-picker";
import { PropertyMediaManager } from "@/components/admin/property-media-manager";
import { NearbyPlacesEditor } from "@/components/admin/nearby-places-editor";
import { upsertProperty } from "@/app/(admin)/admin/(dashboard)/properties/actions";
import { cn, formatPrice, unitInventoryLabels } from "@/lib/utils";
import type {
  Amenity,
  AttributeDefinition,
  Certification,
  LayoutImage,
  MapPrecision,
  NearbyPlace,
  Property,
  GrowthHighlight,
  PropertyStatus,
  PropertyType,
  UnitVariant,
  VirtualTour,
} from "@/lib/types";

type PropertyWithRelations = Property & {
  images?: { id: string; url: string; sort_order: number; kind: "photo" | "floor_plan" | "render" }[];
  brochure?: { pdf_url: string } | { pdf_url: string }[] | null;
  property_amenities?: { amenity_id: string }[];
  nearby_places?: NearbyPlace[];
};

const AREA_UNITS = ["sqft", "sqyd", "acres", "guntas", "cents", "sqm"];
const FACING_OPTIONS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const CONSTRUCTION_STATUS_OPTIONS = ["Under Construction", "Ready to Move", "Completed", "Other"];
const OCCUPANCY_CERT_OPTIONS = ["Received", "Not Received", "Applied", "Not Applicable", "Not Verified"];
const WATER_AVAILABILITY_OPTIONS = ["24/7", "Fixed Timings", "Alternate Days", "Seasonal", "Other"];
const WATER_SOURCE_OPTIONS = ["Municipal Water", "Borewell", "Water Tanker", "Other"];
const POWER_BACKUP_OPTIONS = ["Full", "Partial", "Common Areas Only", "No Backup"];

function emptyVariant(): UnitVariant {
  return {
    label: "",
    bhk: null,
    facing: null,
    price: null,
    total_units: null,
    area_unit: "sqft",
    carpet_area: null,
    built_up_area: null,
    super_built_up_area: null,
    uds: null,
    balconies: null,
    car_parking: null,
    bike_parking: null,
    construction_status: null,
    expected_occupancy: null,
    occupancy_certificate: null,
    property_age: null,
    water_source: null,
    water_availability: null,
    water_storage: null,
    power_backup: null,
  };
}

function emptyCertification(): Certification {
  return { type: "", number: null, date_issued: null, show_publicly: true };
}

function emptyVirtualTour(): VirtualTour {
  return { title: "", embed_code: "" };
}

function emptyGrowthHighlight(): GrowthHighlight {
  return { icon: "trending-up", title: "", subtitle: "" };
}

export function PropertyEditor({
  property,
  types,
  attributeDefs,
  amenities,
}: {
  property: PropertyWithRelations;
  types: PropertyType[];
  attributeDefs: AttributeDefinition[];
  amenities: Amenity[];
}) {
  const router = useRouter();
  const [typeId, setTypeId] = useState(property.type_id ?? types[0]?.id ?? "");
  const [title, setTitle] = useState(property.title ?? "");
  const [slug, setSlug] = useState(property.slug ?? "");
  const [status, setStatus] = useState<PropertyStatus>(property.status ?? "draft");
  const [featured, setFeatured] = useState(property.featured ?? false);
  const [colorScheme, setColorScheme] = useState(property.color_scheme ?? "emerald");
  const [price, setPrice] = useState<number | null>(property.price ?? null);
  const [priceLabel, setPriceLabel] = useState(property.price_label ?? "");
  const [location, setLocation] = useState(property.location ?? "");
  const [city, setCity] = useState(property.city ?? "");
  const [state, setState] = useState(property.state ?? "");
  const [areaValue, setAreaValue] = useState(property.area_value?.toString() ?? "");
  const [areaValueMax, setAreaValueMax] = useState(property.area_value_max?.toString() ?? "");
  const [areaUnit, setAreaUnit] = useState(property.area_unit ?? "sqft");
  const [latitude, setLatitude] = useState<number | null>(property.latitude);
  const [longitude, setLongitude] = useState<number | null>(property.longitude);
  const [mapPrecision, setMapPrecision] = useState<MapPrecision>(property.map_precision ?? "approximate");
  const [description, setDescription] = useState(property.description ?? "");
  // Legacy single-embed field — no longer editable here (superseded by virtualTours
  // below), but its value is preserved on save so nothing already set is silently wiped.
  const [embedCode] = useState(property.embed_code ?? "");
  const [virtualTours, setVirtualTours] = useState<VirtualTour[]>(property.virtual_tours ?? []);
  const [growthHighlights, setGrowthHighlights] = useState<GrowthHighlight[]>(property.growth_highlights ?? []);
  const [metaTitle, setMetaTitle] = useState(property.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(property.meta_description ?? "");
  const [coverImage, setCoverImage] = useState<string | null>(property.cover_image ?? null);
  const [totalUnits, setTotalUnits] = useState(property.total_units?.toString() ?? "");
  const [availableUnits, setAvailableUnits] = useState(property.available_units?.toString() ?? "");
  const [variants, setVariants] = useState<UnitVariant[]>(property.unit_variants ?? []);
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>(property.certifications ?? []);
  const [layoutImages, setLayoutImages] = useState<LayoutImage[]>(property.layout_images ?? []);
  const [attrs, setAttrs] = useState<Record<string, string | number | boolean | string[]>>(
    property.attributes ?? {}
  );
  const [amenityIds, setAmenityIds] = useState<string[]>(
    property.property_amenities?.map((a) => a.amenity_id) ?? []
  );
  const [amenitySearch, setAmenitySearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fieldsForType = useMemo(
    () => attributeDefs.filter((d) => d.property_type_id === typeId),
    [attributeDefs, typeId]
  );

  const amenitiesForType = useMemo(
    () => amenities.filter((a) => a.property_type_ids?.includes(typeId)),
    [amenities, typeId]
  );

  const filteredAmenities = useMemo(
    () => amenitiesForType.filter((a) => a.name.toLowerCase().includes(amenitySearch.toLowerCase())),
    [amenitiesForType, amenitySearch]
  );

  const currentTypeSlug = useMemo(() => types.find((t) => t.id === typeId)?.slug, [types, typeId]);
  const inventoryLabels = unitInventoryLabels(currentTypeSlug);
  const showVariants = currentTypeSlug === "apartment" || currentTypeSlug === "villa";

  function updateVariant(index: number, patch: Partial<UnitVariant>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function addVariant() {
    setVariants((prev) => [...prev, emptyVariant()]);
    setExpandedVariant(variants.length);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
    setExpandedVariant(null);
  }

  function addCertification() {
    setCertifications((prev) => [...prev, emptyCertification()]);
  }

  function updateCertification(index: number, patch: Partial<Certification>) {
    setCertifications((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function removeCertification(index: number) {
    setCertifications((prev) => prev.filter((_, i) => i !== index));
  }

  function addVirtualTour() {
    setVirtualTours((prev) => (prev.length >= 3 ? prev : [...prev, emptyVirtualTour()]));
  }

  function updateVirtualTour(index: number, patch: Partial<VirtualTour>) {
    setVirtualTours((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function removeVirtualTour(index: number) {
    setVirtualTours((prev) => prev.filter((_, i) => i !== index));
  }

  function addGrowthHighlight() {
    setGrowthHighlights((prev) => [...prev, emptyGrowthHighlight()]);
  }

  function updateGrowthHighlight(index: number, patch: Partial<GrowthHighlight>) {
    setGrowthHighlights((prev) => prev.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  }

  function removeGrowthHighlight(index: number) {
    setGrowthHighlights((prev) => prev.filter((_, i) => i !== index));
  }

  function addLayoutImage(url: string) {
    setLayoutImages((prev) => [...prev, { title: "", url }]);
  }

  function updateLayoutImage(index: number, patch: Partial<LayoutImage>) {
    setLayoutImages((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function removeLayoutImage(index: number) {
    setLayoutImages((prev) => prev.filter((_, i) => i !== index));
  }

  function setAttr(key: string, value: string | number | boolean | string[]) {
    setAttrs((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await upsertProperty({
        id: property.id,
        title,
        slug,
        type_id: typeId,
        status,
        featured,
        color_scheme: colorScheme,
        price,
        price_label: priceLabel,
        location,
        city,
        state,
        area_value: areaValue ? Number(areaValue) : null,
        area_value_max: areaValueMax ? Number(areaValueMax) : null,
        area_unit: areaUnit,
        latitude,
        longitude,
        map_precision: mapPrecision,
        description,
        embed_code: embedCode,
        virtual_tours: virtualTours.filter((t) => t.title.trim() && t.embed_code.trim()),
        growth_highlights: growthHighlights.filter((g) => g.title.trim()),
        meta_title: metaTitle,
        meta_description: metaDescription,
        cover_image: coverImage,
        total_units: totalUnits ? Number(totalUnits) : null,
        available_units: availableUnits ? Number(availableUnits) : null,
        unit_variants: variants.filter((v) => v.label.trim()),
        certifications: certifications.filter((c) => c.type.trim()),
        layout_images: layoutImages.filter((l) => l.url),
        attributes: attrs,
        amenityIds,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save property");
    } finally {
      setSaving(false);
    }
  }

  const brochureUrl = Array.isArray(property.brochure) ? property.brochure[0]?.pdf_url : property.brochure?.pdf_url;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="flex-1 space-y-6 pb-16 lg:max-w-4xl">
      <Section title="Basic Information">
        <FormField label="Property Type">
          <select
            value={typeId}
            onChange={(e) => {
              setTypeId(e.target.value);
              setAmenityIds([]);
            }}
            className={inputClass}
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} {!t.is_active && "(hidden)"}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. 3BHK Luxury Villa in Gachibowli" />
        </FormField>
        <FormField label="URL Slug">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} placeholder="auto-generated-if-blank" />
          <p className="mt-1 text-[11px] text-neutral-400">
            /listings/{slug || "…"} — changing this breaks any links already shared to the old URL.
          </p>
        </FormField>
        <FormField label="Description">
          <RichTextEditor value={description} onChange={setDescription} />
        </FormField>
        <div className="flex gap-5">
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Feature on homepage
          </label>
        </div>
      </Section>

      <Section title="Pricing & Area">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            label={areaUnit === "sqft" || areaUnit === "sqyd" ? `Price (₹ per ${areaUnit})` : "Price (₹)"}
          >
            <PriceInput value={price} onChange={setPrice} className={inputClass} placeholder="e.g. 65,00,000" />
          </FormField>
          <FormField label="Price Label Override (optional)">
            <input
              value={priceLabel}
              onChange={(e) => setPriceLabel(e.target.value)}
              className={inputClass}
              placeholder='e.g. "Price on Request" — not for restating the number'
            />
            <p className="mt-1 text-[11px] text-neutral-400">
              Leave this blank — the price above is auto-formatted as Lakhs/Crores already. Only fill this in for
              a non-numeric case like &quot;Price on Request&quot;.
            </p>
          </FormField>
          <FormField label={currentTypeSlug === "villa" ? "Total Built-up Area" : "Area"}>
            <input type="number" value={areaValue} onChange={(e) => setAreaValue(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="Max Area (optional — shows as a size range)">
            <input
              type="number"
              value={areaValueMax}
              onChange={(e) => setAreaValueMax(e.target.value)}
              className={inputClass}
              placeholder="Leave blank for a single size"
            />
          </FormField>
          <FormField label="Area Unit">
            <select value={areaUnit} onChange={(e) => setAreaUnit(e.target.value)} className={inputClass}>
              {AREA_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </Section>

      <Section title="Inventory (optional)">
        <p className="-mt-1 mb-2 text-xs text-neutral-400">
          For a project with multiple {inventoryLabels.unit.toLowerCase()} — shown to buyers as availability and used
          on cards instead of area for Open Plots / Farm Land. Leave blank for a single standalone listing.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label={inventoryLabels.total}>
            <input
              type="number"
              min={0}
              value={totalUnits}
              onChange={(e) => setTotalUnits(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label={inventoryLabels.available}>
            <input
              type="number"
              min={0}
              value={availableUnits}
              onChange={(e) => setAvailableUnits(e.target.value)}
              className={inputClass}
            />
          </FormField>
        </div>
      </Section>

      <Section title="Location">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField label="Locality / Address">
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="City">
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
          </FormField>
          <FormField label="State">
            <input value={state} onChange={(e) => setState(e.target.value)} className={inputClass} />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FormField label="Latitude">
            <input
              type="number"
              value={latitude ?? ""}
              onChange={(e) => setLatitude(e.target.value ? Number(e.target.value) : null)}
              className={inputClass}
              placeholder="17.4448"
            />
          </FormField>
          <FormField label="Longitude">
            <input
              type="number"
              value={longitude ?? ""}
              onChange={(e) => setLongitude(e.target.value ? Number(e.target.value) : null)}
              className={inputClass}
              placeholder="78.3498"
            />
          </FormField>
          <FormField label="Map Precision">
            <select value={mapPrecision} onChange={(e) => setMapPrecision(e.target.value as MapPrecision)} className={inputClass}>
              <option value="exact">Exact pin</option>
              <option value="approximate">Approximate</option>
              <option value="locality">Locality only</option>
            </select>
          </FormField>
        </div>

        <FormField label="Map">
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />
        </FormField>

        <FormField label="Nearby Places">
          <NearbyPlacesEditor
            propertyId={property.id}
            places={property.nearby_places ?? []}
            propertyLat={latitude}
            propertyLng={longitude}
          />
        </FormField>
      </Section>

      <Section title="Layout / Floor Plan Images (optional)">
        <p className="-mt-1 mb-2 text-xs text-neutral-400">
          Upload layout plans for plots, or floor/unit plans for apartments &amp; villas — each with its own title,
          e.g. &quot;Master Layout&quot;, &quot;2BHK Floor Plan&quot;, &quot;Unit A Plan&quot;. Shown as a titled gallery on the property page.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {layoutImages.map((l, i) => (
            <div key={i} className="space-y-1.5">
              <ImageUploader
                value={l.url}
                onChange={(url) => (url ? updateLayoutImage(i, { url }) : removeLayoutImage(i))}
                folder="layout-plans"
                aspect="aspect-[4/3]"
              />
              <input
                value={l.title}
                onChange={(e) => updateLayoutImage(i, { title: e.target.value })}
                placeholder="Title, e.g. Master Layout"
                className={`${inputClass} text-xs`}
              />
            </div>
          ))}
          <ImageUploader value={null} onChange={(url) => url && addLayoutImage(url)} folder="layout-plans" aspect="aspect-[4/3]" />
        </div>
        <p className="mt-2 text-[11px] text-neutral-400">Recommended: 1200×900px (4:3) each</p>
      </Section>

      {fieldsForType.length > 0 && (
        <Section title="Specifications">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fieldsForType.map((f) => (
              <FormField key={f.id} label={`${f.label}${f.unit ? ` (${f.unit})` : ""}`}>
                {f.field_type === "boolean" ? (
                  <label className="flex items-center gap-2 text-sm text-neutral-600">
                    <input
                      type="checkbox"
                      checked={Boolean(attrs[f.key])}
                      onChange={(e) => setAttr(f.key, e.target.checked)}
                    />
                    Yes
                  </label>
                ) : f.field_type === "select" ? (
                  <select
                    value={(attrs[f.key] as string) ?? ""}
                    onChange={(e) => setAttr(f.key, e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : f.field_type === "multiselect" ? (
                  <div className="flex flex-wrap gap-1.5">
                    {f.options.map((o) => {
                      const current = Array.isArray(attrs[f.key]) ? (attrs[f.key] as string[]) : [];
                      const checked = current.includes(o);
                      return (
                        <button
                          key={o}
                          type="button"
                          onClick={() =>
                            setAttr(f.key, checked ? current.filter((v) => v !== o) : [...current, o])
                          }
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                            checked
                              ? "border-[#1b5e3a] bg-[#1b5e3a]/10 text-[#1b5e3a]"
                              : "border-black/10 text-neutral-600"
                          }`}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                ) : f.field_type === "number" ? (
                  <input
                    type="number"
                    value={(attrs[f.key] as string) ?? ""}
                    onChange={(e) => setAttr(f.key, e.target.value)}
                    className={inputClass}
                  />
                ) : (
                  <input
                    value={(attrs[f.key] as string) ?? ""}
                    onChange={(e) => setAttr(f.key, e.target.value)}
                    className={inputClass}
                  />
                )}
              </FormField>
            ))}
          </div>
        </Section>
      )}

      {showVariants && (
        <Section title="Unit Variants (optional)">
          <p className="-mt-1 mb-2 text-xs text-neutral-400">
            Add a row per configuration — e.g. 2BHK Type A / 3BHK Type B — each with its own BHK, areas, price,
            facing and how many units of that type exist. Total Floors and the project-wide Total/Available Units
            above are whole-project figures, separate from these.
          </p>
          <div className="space-y-2">
            {variants.map((v, i) => {
              const expanded = expandedVariant === i;
              return (
                <div key={i} className="rounded-xl border border-black/5">
                  <button
                    type="button"
                    onClick={() => setExpandedVariant(expanded ? null : i)}
                    className="flex w-full items-center gap-2 p-3 text-left"
                  >
                    <span className="flex-1 truncate text-sm font-medium text-neutral-800">
                      {v.label || `Variant ${i + 1}`}
                      {v.bhk != null && <span className="text-neutral-400"> · {v.bhk} BHK</span>}
                      {v.price != null && <span className="text-neutral-400"> · {formatPrice(v.price)}</span>}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVariant(i);
                      }}
                      aria-label="Remove variant"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <X size={15} />
                    </span>
                    <ChevronDown size={16} className={cn("shrink-0 text-neutral-400 transition-transform", expanded && "rotate-180")} />
                  </button>

                  {expanded && (
                    <div className="space-y-2 border-t border-black/5 p-3">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <input
                          value={v.label}
                          onChange={(e) => updateVariant(i, { label: e.target.value })}
                          placeholder="e.g. 2BHK Type A"
                          className={`${inputClass} col-span-2 sm:col-span-1`}
                        />
                        <input
                          type="number"
                          value={v.bhk ?? ""}
                          onChange={(e) => updateVariant(i, { bhk: e.target.value ? Number(e.target.value) : null })}
                          placeholder="BHK"
                          className={inputClass}
                        />
                        <select
                          value={v.facing ?? ""}
                          onChange={(e) => updateVariant(i, { facing: e.target.value || null })}
                          className={inputClass}
                        >
                          <option value="">Facing</option>
                          {FACING_OPTIONS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={0}
                          value={v.total_units ?? ""}
                          onChange={(e) => updateVariant(i, { total_units: e.target.value ? Number(e.target.value) : null })}
                          placeholder="Total units of this type"
                          className={inputClass}
                        />
                      </div>

                      <p className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Areas</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                        <input
                          type="number"
                          value={v.carpet_area ?? ""}
                          onChange={(e) => updateVariant(i, { carpet_area: e.target.value ? Number(e.target.value) : null })}
                          placeholder="Carpet Area"
                          className={inputClass}
                        />
                        <input
                          type="number"
                          value={v.built_up_area ?? ""}
                          onChange={(e) => updateVariant(i, { built_up_area: e.target.value ? Number(e.target.value) : null })}
                          placeholder="Built-up Area"
                          className={inputClass}
                        />
                        {currentTypeSlug === "apartment" && (
                          <>
                            <input
                              type="number"
                              value={v.super_built_up_area ?? ""}
                              onChange={(e) =>
                                updateVariant(i, { super_built_up_area: e.target.value ? Number(e.target.value) : null })
                              }
                              placeholder="Super Built-up"
                              className={inputClass}
                            />
                            <input
                              type="number"
                              value={v.uds ?? ""}
                              onChange={(e) => updateVariant(i, { uds: e.target.value ? Number(e.target.value) : null })}
                              placeholder="UDS"
                              className={inputClass}
                            />
                          </>
                        )}
                        <select
                          value={v.area_unit ?? "sqft"}
                          onChange={(e) => updateVariant(i, { area_unit: e.target.value })}
                          className={inputClass}
                        >
                          {AREA_UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>

                      <p className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                        Price &amp; Parking
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <PriceInput
                          value={v.price ?? null}
                          onChange={(val) => updateVariant(i, { price: val })}
                          placeholder="Price (₹)"
                          className={inputClass}
                        />
                        <input
                          type="number"
                          value={v.balconies ?? ""}
                          onChange={(e) => updateVariant(i, { balconies: e.target.value ? Number(e.target.value) : null })}
                          placeholder="Balconies"
                          className={inputClass}
                        />
                        <input
                          type="number"
                          value={v.car_parking ?? ""}
                          onChange={(e) => updateVariant(i, { car_parking: e.target.value ? Number(e.target.value) : null })}
                          placeholder="Car Parking"
                          className={inputClass}
                        />
                        <input
                          type="number"
                          value={v.bike_parking ?? ""}
                          onChange={(e) => updateVariant(i, { bike_parking: e.target.value ? Number(e.target.value) : null })}
                          placeholder="Bike Parking"
                          className={inputClass}
                        />
                      </div>

                      <p className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                        Construction &amp; Occupancy
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <select
                          value={v.construction_status ?? ""}
                          onChange={(e) => updateVariant(i, { construction_status: e.target.value || null })}
                          className={inputClass}
                        >
                          <option value="">Construction Status</option>
                          {CONSTRUCTION_STATUS_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                        <input
                          value={v.expected_occupancy ?? ""}
                          onChange={(e) => updateVariant(i, { expected_occupancy: e.target.value || null })}
                          placeholder="Expected Occupancy (e.g. Dec 2026)"
                          className={inputClass}
                        />
                        <select
                          value={v.occupancy_certificate ?? ""}
                          onChange={(e) => updateVariant(i, { occupancy_certificate: e.target.value || null })}
                          className={inputClass}
                        >
                          <option value="">Occupancy Certificate</option>
                          {OCCUPANCY_CERT_OPTIONS.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={v.property_age ?? ""}
                          onChange={(e) => updateVariant(i, { property_age: e.target.value ? Number(e.target.value) : null })}
                          placeholder="Property Age (yrs)"
                          className={inputClass}
                        />
                      </div>

                      {currentTypeSlug === "villa" && (
                        <>
                          <p className="pt-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                            Water &amp; Power
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {WATER_SOURCE_OPTIONS.map((o) => {
                              const current = v.water_source ?? [];
                              const checked = current.includes(o);
                              return (
                                <button
                                  key={o}
                                  type="button"
                                  onClick={() =>
                                    updateVariant(i, {
                                      water_source: checked ? current.filter((x) => x !== o) : [...current, o],
                                    })
                                  }
                                  className={cn(
                                    "rounded-full border px-3 py-1.5 text-xs font-medium",
                                    checked ? "border-[#1b5e3a] bg-[#1b5e3a]/10 text-[#1b5e3a]" : "border-black/10 text-neutral-600"
                                  )}
                                >
                                  {o}
                                </button>
                              );
                            })}
                          </div>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            <select
                              value={v.water_availability ?? ""}
                              onChange={(e) => updateVariant(i, { water_availability: e.target.value || null })}
                              className={inputClass}
                            >
                              <option value="">Water Availability</option>
                              {WATER_AVAILABILITY_OPTIONS.map((o) => (
                                <option key={o} value={o}>
                                  {o}
                                </option>
                              ))}
                            </select>
                            <select
                              value={v.power_backup ?? ""}
                              onChange={(e) => updateVariant(i, { power_backup: e.target.value || null })}
                              className={inputClass}
                            >
                              <option value="">Power Backup</option>
                              {POWER_BACKUP_OPTIONS.map((o) => (
                                <option key={o} value={o}>
                                  {o}
                                </option>
                              ))}
                            </select>
                            <label className="flex items-center gap-2 text-sm text-neutral-600">
                              <input
                                type="checkbox"
                                checked={v.water_storage ?? false}
                                onChange={(e) => updateVariant(i, { water_storage: e.target.checked })}
                              />
                              Water Storage
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="mt-2 flex items-center gap-1.5 rounded-full border border-dashed border-black/10 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-[#1b5e3a] hover:text-[#1b5e3a]"
          >
            <Plus size={13} /> Add Variant
          </button>
        </Section>
      )}

      <Section title={`Amenities (${amenityIds.length} selected)`}>
        {amenitiesForType.length > 0 ? (
          <>
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2">
              <Search size={14} className="shrink-0 text-neutral-400" />
              <input
                value={amenitySearch}
                onChange={(e) => setAmenitySearch(e.target.value)}
                placeholder="Search amenities…"
                className="w-full text-sm outline-none"
              />
              {amenitySearch && (
                <button type="button" onClick={() => setAmenitySearch("")} className="shrink-0 text-neutral-400 hover:text-neutral-700">
                  <X size={14} />
                </button>
              )}
            </div>
            {filteredAmenities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {filteredAmenities.map((a) => {
                  const checked = amenityIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() =>
                        setAmenityIds((prev) => (checked ? prev.filter((id) => id !== a.id) : [...prev, a.id]))
                      }
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                        checked
                          ? "border-[#1b5e3a] bg-[#1b5e3a]/10 text-[#1b5e3a]"
                          : "border-black/10 text-neutral-600"
                      }`}
                    >
                      <Icon name={a.icon_name} url={a.icon_url} size={13} />
                      {a.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No amenities match &quot;{amenitySearch}&quot;.</p>
            )}
          </>
        ) : (
          <p className="text-xs text-neutral-400">
            No amenities are linked to this property type yet — manage that in Admin → Amenities.
          </p>
        )}
      </Section>

      <PropertyMediaManager
        propertyId={property.id}
        images={property.images ?? []}
        coverImage={coverImage}
        onSetCover={setCoverImage}
        brochureUrl={brochureUrl}
      />

      <Section title="360° Views / Virtual Tours (optional, up to 3)">
        <p className="-mt-1 mb-2 text-xs text-neutral-400">
          For 360° walkthroughs or plot/layout iframe views (Matterport, OurPlots, YouTube, etc.). Each one gets its
          own tab next to Photos and Brochure on the property page, labelled with its title.
        </p>
        <div className="space-y-2">
          {virtualTours.map((t, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-black/5 p-3">
              <div className="flex items-center gap-2">
                <input
                  value={t.title}
                  onChange={(e) => updateVirtualTour(i, { title: e.target.value })}
                  placeholder="Tab title, e.g. 360° Tour or Plot View"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => removeVirtualTour(i)}
                  aria-label="Remove virtual tour"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
              <textarea
                value={t.embed_code}
                onChange={(e) => updateVirtualTour(i, { embed_code: e.target.value })}
                rows={3}
                className={`${inputClass} font-mono text-xs`}
                placeholder='<iframe src="..."></iframe>'
              />
            </div>
          ))}
        </div>
        {virtualTours.length < 3 && (
          <button
            type="button"
            onClick={addVirtualTour}
            className="mt-2 flex items-center gap-1.5 rounded-full border border-dashed border-black/10 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-[#1b5e3a] hover:text-[#1b5e3a]"
          >
            <Plus size={13} /> Add 360° View / Embed
          </button>
        )}
        {embedCode && (
          <p className="mt-3 text-xs text-neutral-400">
            This property also has a legacy embed set from before — it still shows on the page until you move it
            into the list above and save.
          </p>
        )}
      </Section>

      <Section title="Certifications &amp; Approvals (optional)">
        <p className="-mt-1 mb-2 text-xs text-neutral-400">
          e.g. RERA, HMDA, DTCP, Khata, Patta. Only entries with &quot;Show on website&quot; checked appear publicly, and the
          number is hidden if left blank. The section disappears entirely if nothing is marked public.
        </p>
        <div className="space-y-2">
          {certifications.map((c, i) => (
            <div key={i} className="grid grid-cols-2 items-center gap-2 rounded-xl border border-black/5 p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto_auto]">
              <input
                value={c.type}
                onChange={(e) => updateCertification(i, { type: e.target.value })}
                placeholder="Type, e.g. RERA"
                className={inputClass}
              />
              <input
                value={c.number ?? ""}
                onChange={(e) => updateCertification(i, { number: e.target.value || null })}
                placeholder="Registration number (optional)"
                className={inputClass}
              />
              <input
                type="date"
                value={c.date_issued ?? ""}
                onChange={(e) => updateCertification(i, { date_issued: e.target.value || null })}
                className={inputClass}
              />
              <label className="flex items-center gap-1.5 whitespace-nowrap text-xs text-neutral-600">
                <input
                  type="checkbox"
                  checked={c.show_publicly}
                  onChange={(e) => updateCertification(i, { show_publicly: e.target.checked })}
                />
                Show on website
              </label>
              <button
                type="button"
                onClick={() => removeCertification(i)}
                aria-label="Remove certification"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addCertification}
          className="mt-2 flex items-center gap-1.5 rounded-full border border-dashed border-black/10 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-[#1b5e3a] hover:text-[#1b5e3a]"
        >
          <Plus size={13} /> Add Certification
        </button>
      </Section>

      <Section title="Future Growth, Near & Around (optional)">
        <p className="-mt-1 mb-2 text-xs text-neutral-400">
          Upcoming metro lines, IT corridors, planned infrastructure — anything that makes the case for this
          property&apos;s future value. Each entry shows as a title + short note on the property page.
        </p>
        <div className="space-y-2">
          {growthHighlights.map((g, i) => (
            <div key={i} className="grid grid-cols-1 items-start gap-2 rounded-xl border border-black/5 p-3 sm:grid-cols-[auto_1fr_1.4fr_auto]">
              <IconPicker value={g.icon ?? null} onChange={(icon) => updateGrowthHighlight(i, { icon })} />
              <input
                value={g.title}
                onChange={(e) => updateGrowthHighlight(i, { title: e.target.value })}
                placeholder="Title, e.g. Upcoming Metro Line"
                className={inputClass}
              />
              <input
                value={g.subtitle}
                onChange={(e) => updateGrowthHighlight(i, { subtitle: e.target.value })}
                placeholder="Short note, e.g. 1.2 km away, expected 2027"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeGrowthHighlight(i)}
                aria-label="Remove growth highlight"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addGrowthHighlight}
          className="mt-2 flex items-center gap-1.5 rounded-full border border-dashed border-black/10 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-[#1b5e3a] hover:text-[#1b5e3a]"
        >
          <Plus size={13} /> Add Growth Highlight
        </button>
      </Section>

      <Section title="SEO (optional overrides)">
        <p className="-mt-1 mb-2 text-xs text-neutral-400">
          Leave blank to auto-generate from the title, location and price.
        </p>
        <FormField label="Meta Title">
          <input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className={inputClass}
            placeholder={title || "Auto-generated"}
          />
        </FormField>
        <FormField label="Meta Description">
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            className={inputClass}
            placeholder="Shown in search results and social shares"
          />
        </FormField>
      </Section>

      <Section title="Color Scheme">
        <p className="-mt-1 mb-2 text-xs text-neutral-400">Used throughout this property&apos;s own page.</p>
        <SchemePicker value={colorScheme} onChange={setColorScheme} />
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <aside className="sticky top-6 w-full shrink-0 space-y-4 rounded-2xl border border-black/5 bg-white p-5 lg:w-64">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={15} /> Back
        </button>

        <FormField label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus)} className={inputClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="paused">Paused</option>
            <option value="sold">Sold</option>
            <option value="archived">Archived</option>
          </select>
        </FormField>

        <button
          onClick={save}
          disabled={saving || !title || !typeId}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1b5e3a] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : null}
          {saving ? "Saving…" : saved ? "Saved" : "Save Changes"}
        </button>
      </aside>
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

"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, X, MapPin, Plus } from "lucide-react";
import { Icon } from "@/components/icon";
import { searchPlaces, type OlaPlacePrediction } from "@/lib/ola-places";
import { addNearbyPlace, removeNearbyPlace } from "@/app/(admin)/admin/(dashboard)/properties/actions";
import type { NearbyPlace } from "@/lib/types";

const CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: "school", label: "School / College", icon: "graduation-cap" },
  { key: "hospital", label: "Hospital", icon: "cross" },
  { key: "mall", label: "Mall / Shopping", icon: "shopping-bag" },
  { key: "transit", label: "Metro / Bus Stop", icon: "train-front" },
  { key: "airport", label: "Airport", icon: "plane" },
  { key: "industry", label: "Industries / IT Companies", icon: "factory" },
  { key: "tourist", label: "Tourist Places", icon: "camera" },
  { key: "restaurant", label: "Restaurant / Cafe", icon: "utensils" },
  { key: "park", label: "Park", icon: "trees" },
  { key: "bank", label: "Bank / ATM", icon: "landmark" },
  { key: "general", label: "Other", icon: "map-pin" },
];

export function NearbyPlacesEditor({
  propertyId,
  places,
  propertyLat,
  propertyLng,
}: {
  propertyId: string;
  places: NearbyPlace[];
  propertyLat: number | null;
  propertyLng: number | null;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OlaPlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("general");
  const [pending, setPending] = useState<OlaPlacePrediction | null>(null);
  const [customName, setCustomName] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const router = useRouter();
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onQueryChange(value: string) {
    setQuery(value);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const near = propertyLat != null && propertyLng != null ? { lat: propertyLat, lng: propertyLng } : undefined;
      const r = await searchPlaces(value, near);
      setResults(r);
      setSearching(false);
    }, 350);
  }

  function selectResult(p: OlaPlacePrediction) {
    setPending(p);
    setCustomName(p.mainText);
    setError(null);
    setResults([]);
    setQuery("");
  }

  async function confirmAdd() {
    if (!pending || !customName.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await addNearbyPlace({
        propertyId,
        name: customName.trim(),
        category,
        placeId: pending.place_id,
        latitude: pending.lat,
        longitude: pending.lng,
      });
      setQuery("");
      setResults([]);
      setPending(null);
      setCustomName("");
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add that place — try again.");
    } finally {
      setAdding(false);
    }
  }

  async function confirmManualAdd() {
    const lat = Number(manualLat);
    const lng = Number(manualLng);
    if (!manualName.trim()) return setError("Give the place a name.");
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) return setError("Latitude must be a number between -90 and 90.");
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) return setError("Longitude must be a number between -180 and 180.");

    setAdding(true);
    setError(null);
    try {
      await addNearbyPlace({ propertyId, name: manualName.trim(), category, latitude: lat, longitude: lng });
      setManualName("");
      setManualLat("");
      setManualLng("");
      setManualMode(false);
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add that place — try again.");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategory(c.key)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
              category === c.key ? "border-[#1b5e3a] bg-[#1b5e3a]/10 text-[#1b5e3a]" : "border-black/10 text-neutral-600"
            }`}
          >
            <Icon name={c.icon} size={13} />
            {c.label}
          </button>
        ))}
      </div>

      <div className="mb-2 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setManualMode((v) => !v);
            setError(null);
          }}
          className="flex items-center gap-1 text-xs font-semibold text-[#1b5e3a]"
        >
          <Plus size={13} /> {manualMode ? "Cancel manual add" : "Add manually with lat/long"}
        </button>
      </div>

      {manualMode && (
        <div className="mb-3 rounded-lg border border-[#1b5e3a]/20 bg-[#1b5e3a]/5 p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr]">
            <input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Name shown to visitors"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none"
            />
            <input
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              placeholder="Latitude"
              inputMode="decimal"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none"
            />
            <input
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              placeholder="Longitude"
              inputMode="decimal"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none"
            />
          </div>
          <button
            type="button"
            onClick={confirmManualAdd}
            disabled={adding || !manualName.trim() || !manualLat || !manualLng}
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-[#1b5e3a] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Add
          </button>
        </div>
      )}

      <div className="relative">
        <div className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2.5">
          <Search size={14} className="text-neutral-400" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search a school, hospital, mall… (via Ola Maps)"
            className="w-full text-sm outline-none"
          />
          {searching && <Loader2 size={14} className="animate-spin text-neutral-400" />}
        </div>

        {results.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-black/10 bg-white shadow-lg">
            {results.map((p) => (
              <button
                key={p.place_id}
                type="button"
                onClick={() => selectResult(p)}
                className="flex w-full items-center gap-2 border-b border-black/5 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-neutral-50"
              >
                <MapPin size={14} className="mt-0.5 shrink-0 text-neutral-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-neutral-800">{p.mainText}</p>
                  <p className="truncate text-xs text-neutral-400">{p.secondaryText}</p>
                </div>
                <Plus size={14} className="shrink-0 text-neutral-300" />
              </button>
            ))}
          </div>
        )}
      </div>

      {pending && (
        <div className="mt-2 rounded-lg border border-[#1b5e3a]/20 bg-[#1b5e3a]/5 p-3">
          <p className="mb-1.5 text-[11px] text-neutral-500">{pending.secondaryText}</p>
          <div className="flex items-center gap-2">
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Name shown to visitors"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={confirmAdd}
              disabled={adding || !customName.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#1b5e3a] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setPending(null);
                setCustomName("");
              }}
              className="shrink-0 text-xs font-medium text-neutral-400 hover:text-neutral-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {!propertyLat && <p className="mt-2 text-xs text-neutral-400">Set the property&apos;s location first for better search results.</p>}

      <div className="mt-4 space-y-1.5">
        {places.map((p) => {
          const cat = CATEGORIES.find((c) => c.key === p.category) ?? CATEGORIES[CATEGORIES.length - 1];
          return (
            <div key={p.id} className="flex items-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-xs">
              <Icon name={cat.icon} size={14} />
              <span className="font-medium text-neutral-800">{p.name}</span>
              <span className="text-neutral-400">({cat.label})</span>
              <button
                onClick={() =>
                  startTransition(() => {
                    removeNearbyPlace(p.id, propertyId).then(() => router.refresh());
                  })
                }
                className="ml-auto text-neutral-400 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
        {places.length === 0 && <p className="text-xs text-neutral-400">No nearby places added yet.</p>}
      </div>
    </div>
  );
}

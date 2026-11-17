"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Loader2, Navigation, X } from "lucide-react";
import { Icon } from "@/components/icon";
import { searchPlaces, getRoute, type OlaPlacePrediction, type RouteResult } from "@/lib/ola-places";
import { OlaAttributionBadge } from "@/components/property-map";
import { hideMapClutter } from "@/lib/ola-map";
import { ShowMoreGrid } from "@/components/show-more-grid";
import { cn } from "@/lib/utils";
import type { NearbyPlace } from "@/lib/types";
import "maplibre-gl/dist/maplibre-gl.css";

const CATEGORY_ICONS: Record<string, string> = {
  school: "graduation-cap",
  hospital: "cross",
  mall: "shopping-bag",
  transit: "train-front",
  airport: "plane",
  industry: "factory",
  tourist: "camera",
  restaurant: "utensils",
  park: "trees",
  bank: "landmark",
  general: "map-pin",
};

type Point = { lat: number; lng: number; name: string };

export function NearbyExplorer({
  latitude,
  longitude,
  title,
  nearbyPlaces,
}: {
  latitude: number;
  longitude: number;
  title: string;
  nearbyPlaces: NearbyPlace[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Awaited<ReturnType<typeof initMap>> | null>(null);
  const destMarkerRef = useRef<{ setLngLat: (c: [number, number]) => void; remove: () => void } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [query, setQuery] = useState("");
  const [mapQuery, setMapQuery] = useState("");
  const [results, setResults] = useState<OlaPlacePrediction[]>([]);
  const [mapResults, setMapResults] = useState<OlaPlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Point | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routing, setRouting] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;
    let cancelled = false;

    initMap(containerRef.current, apiKey, [longitude, latitude], title).then((map) => {
      if (cancelled) return;
      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  async function selectPoint(point: Point) {
    setSelected(point);
    setResults([]);
    setMapResults([]);
    setQuery("");
    setMapQuery("");
    const map = mapRef.current;
    if (!map) return;

    if (destMarkerRef.current) destMarkerRef.current.remove();
    destMarkerRef.current = map.addDestinationMarker([point.lng, point.lat]);

    setRouting(true);
    const r = await getRoute({ lat: latitude, lng: longitude }, { lat: point.lat, lng: point.lng });
    setRoute(r);
    setRouting(false);
    if (r.polyline) map.drawRoute(r.polyline);
    map.fitTo([longitude, latitude], [point.lng, point.lat]);
  }

  // The curated list sits above the map in the mobile stacked layout, so a tap there
  // wouldn't otherwise bring the route/distance into view without a manual scroll.
  // Desktop already shows the map alongside the list, so this is a no-op there.
  function jumpToMapOnMobile() {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function clearSelection() {
    setSelected(null);
    setRoute(null);
    destMarkerRef.current?.remove();
    destMarkerRef.current = null;
    mapRef.current?.clearRoute();
    mapRef.current?.recenter([longitude, latitude]);
  }

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function onQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const r = await searchPlaces(value, { lat: latitude, lng: longitude });
      setResults(r);
      setSearching(false);
    }, 350);
  }

  const mapDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  function onMapQueryChange(value: string) {
    setMapQuery(value);
    if (mapDebounceRef.current) clearTimeout(mapDebounceRef.current);
    if (!value.trim()) {
      setMapResults([]);
      return;
    }
    mapDebounceRef.current = setTimeout(async () => {
      const r = await searchPlaces(value, { lat: latitude, lng: longitude });
      setMapResults(r);
    }, 350);
  }

  if (!apiKey) return null;

  const distanceCard = (selected || routing) && (
    <div className="rounded-xl border border-black/5 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-neutral-400">Distance to</p>
          <p className="text-sm font-semibold text-neutral-900">{selected?.name}</p>
        </div>
        <button onClick={clearSelection} className="text-neutral-400 hover:text-neutral-700">
          <X size={16} />
        </button>
      </div>
      {routing ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-400">
          <Loader2 size={12} className="animate-spin" /> Calculating route…
        </p>
      ) : route ? (
        <p className="mt-2 text-lg font-bold text-[var(--color-primary,#7f1d1d)]">
          {route.distanceKm.toFixed(1)} km
          {route.durationMin && <span className="ml-2 text-sm font-medium text-neutral-500">· ~{route.durationMin} min</span>}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-5">
        {/* Desktop only — mobile uses the search overlaid on the map itself instead of a
            second, separate search box here. */}
        <div className="relative hidden lg:block">
          <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2.5 shadow-sm">
            <Search size={15} className="shrink-0 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search any nearby area or landmark…"
              className="w-full text-sm outline-none"
            />
            {searching && <Loader2 size={14} className="animate-spin text-neutral-400" />}
          </div>
          {results.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-xl border border-black/10 bg-white shadow-lg">
              {results.map((p) => (
                <button
                  key={p.place_id}
                  onClick={() => selectPoint({ lat: p.lat, lng: p.lng, name: p.mainText })}
                  className="flex w-full items-start gap-2 border-b border-black/5 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-neutral-50"
                >
                  <Navigation size={13} className="mt-0.5 shrink-0 text-neutral-400" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-neutral-800">{p.mainText}</p>
                    <p className="truncate text-xs text-neutral-400">{p.secondaryText}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {nearbyPlaces.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Nearby</p>
            <ShowMoreGrid
              limit={6}
              className="flex flex-col gap-1.5"
              items={nearbyPlaces.map((p) => {
                const isSelected = selected?.name === p.name;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "rounded-xl border transition",
                      isSelected ? "border-[var(--color-primary,#7f1d1d)] bg-[var(--color-primary,#7f1d1d)]/5" : "border-black/5 bg-white hover:border-black/10"
                    )}
                  >
                    <button
                      onClick={() => {
                        if (isSelected) clearSelection();
                        else {
                          selectPoint({ lat: p.latitude, lng: p.longitude, name: p.name });
                          jumpToMapOnMobile();
                        }
                      }}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary,#7f1d1d)]/10 text-[var(--color-primary,#7f1d1d)]">
                        <Icon name={CATEGORY_ICONS[p.category] ?? "map-pin"} size={15} />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium text-neutral-800">{p.name}</span>
                      {isSelected && !routing && route && (
                        <span className="shrink-0 text-xs font-bold text-[var(--color-primary,#7f1d1d)]">
                          {route.distanceKm.toFixed(1)} km
                        </span>
                      )}
                      {isSelected && routing && <Loader2 size={13} className="shrink-0 animate-spin text-neutral-400" />}
                    </button>
                  </div>
                );
              })}
            />
          </div>
        )}

        {/* Distance/time for the current selection — curated list pick or map search alike —
            renders under the map itself (right column) rather than here. */}
      </div>

      <div ref={mapSectionRef} className="space-y-4 lg:col-span-7 lg:sticky lg:top-24 lg:self-start scroll-mt-20">
        <div className="relative overflow-hidden rounded-2xl border border-black/5">
          <div ref={containerRef} className="h-80 w-full bg-neutral-50 lg:h-full lg:min-h-[420px]" />
          {!mapReady && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-50 text-neutral-400">
              <Loader2 size={20} className="animate-spin" />
            </div>
          )}

          {/* Mobile only — on desktop the sidebar search above is already in view. */}
          <div className="absolute inset-x-3 top-3 z-10 lg:hidden">
            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur">
              <Search size={14} className="shrink-0 text-neutral-400" />
              <input
                value={mapQuery}
                onChange={(e) => onMapQueryChange(e.target.value)}
                placeholder="Search on map…"
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>
            {mapResults.length > 0 && (
              <div className="mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-black/10 bg-white shadow-lg">
                {mapResults.map((p) => (
                  <button
                    key={p.place_id}
                    onClick={() => selectPoint({ lat: p.lat, lng: p.lng, name: p.mainText })}
                    className="flex w-full items-start gap-2 border-b border-black/5 px-3 py-2.5 text-left text-xs last:border-0 hover:bg-neutral-50"
                  >
                    <Navigation size={12} className="mt-0.5 shrink-0 text-neutral-400" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-neutral-800">{p.mainText}</p>
                      <p className="truncate text-neutral-400">{p.secondaryText}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <OlaAttributionBadge />
        </div>

        {distanceCard}
      </div>
    </div>
  );
}

async function initMap(container: HTMLDivElement, apiKey: string, center: [number, number], title: string) {
  const { OlaMaps } = await import("olamaps-web-sdk");
  const olaMaps = new OlaMaps({ apiKey });
  const map = await olaMaps.init({
    style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
    container,
    center,
    zoom: 13,
    attributionControl: false,
  });

  olaMaps.addMarker({ color: "#7f1d1d" }).setLngLat(center).setPopup(olaMaps.addPopup({}).setHTML(`<b>${title}</b>`)).addTo(map);
  map.resize?.();
  hideMapClutter(map);
  map.on?.("styledata", () => hideMapClutter(map));

  const ROUTE_SOURCE = "route-line";

  function ensureRouteLayer() {
    if (!map.getSource(ROUTE_SOURCE)) {
      map.addSource(ROUTE_SOURCE, {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });
      map.addLayer({
        id: ROUTE_SOURCE,
        type: "line",
        source: ROUTE_SOURCE,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#d4af37", "line-width": 4, "line-dasharray": [0.1, 1.5] },
      });
    }
  }

  return {
    addDestinationMarker(lngLat: [number, number]) {
      return olaMaps.addMarker({ color: "#d4af37" }).setLngLat(lngLat).addTo(map);
    },
    drawRoute(coords: [number, number][]) {
      ensureRouteLayer();
      const source = map.getSource(ROUTE_SOURCE);
      source?.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords } });
    },
    clearRoute() {
      const source = map.getSource(ROUTE_SOURCE);
      source?.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } });
    },
    fitTo(a: [number, number], b: [number, number]) {
      const bounds = [
        [Math.min(a[0], b[0]), Math.min(a[1], b[1])],
        [Math.max(a[0], b[0]), Math.max(a[1], b[1])],
      ] as [[number, number], [number, number]];
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 600 });
    },
    recenter(c: [number, number]) {
      map.flyTo({ center: c, zoom: 13, duration: 500 });
    },
  };
}

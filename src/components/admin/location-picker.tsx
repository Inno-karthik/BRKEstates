"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { OlaAttributionBadge } from "@/components/property-map";
import { hideMapClutter } from "@/lib/ola-map";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
};

const DEFAULT_CENTER: [number, number] = [78.4867, 17.385]; // Hyderabad — sensible default for this market

export function LocationPicker({ latitude, longitude, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ setCenter: (c: [number, number]) => void } | null>(null);
  const markerRef = useRef<{ setLngLat: (c: [number, number]) => void } | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !containerRef.current) {
      setStatus("unavailable");
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const { OlaMaps } = await import("olamaps-web-sdk");
        const olaMaps = new OlaMaps({ apiKey });
        const center: [number, number] = longitude != null && latitude != null ? [longitude, latitude] : DEFAULT_CENTER;
        const map = await olaMaps.init({
          style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
          container: containerRef.current!,
          center,
          zoom: 13,
          attributionControl: false,
        });
        if (cancelled) return;

        const marker = olaMaps.addMarker({ color: "#1b5e3a", draggable: true }).setLngLat(center).addTo(map);
        mapRef.current = map;
        markerRef.current = marker;
        map.resize?.();
        hideMapClutter(map);
        map.on?.("styledata", () => hideMapClutter(map));

        map.on("click", (e: { lngLat: { lng: number; lat: number } }) => {
          marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
          onChange(e.lngLat.lat, e.lngLat.lng);
        });
        marker.on("dragend", () => {
          const pos = marker.getLngLat();
          onChange(pos.lat, pos.lng);
        });

        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("unavailable");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // keep marker in sync if parent coordinates change from elsewhere (e.g. manual number input)
  useEffect(() => {
    if (status === "ready" && latitude != null && longitude != null) {
      markerRef.current?.setLngLat([longitude, latitude]);
      mapRef.current?.setCenter([longitude, latitude]);
    }
  }, [latitude, longitude, status]);

  if (status === "unavailable") {
    return (
      <p className="rounded-xl border border-dashed border-black/10 bg-neutral-50 p-4 text-xs text-neutral-500">
        Interactive map unavailable — enter latitude/longitude manually below.
      </p>
    );
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-black/10">
        {/* Container stays mounted at full size always — maplibre-gl sizes its canvas off this
            element at init time, so a display:none container (while "loading") breaks rendering. */}
        <div ref={containerRef} className="h-56 w-full bg-neutral-50" />
        {status === "loading" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-50 text-neutral-400">
            <Loader2 size={20} className="animate-spin" />
          </div>
        )}
        {status === "ready" && <OlaAttributionBadge />}
      </div>
      <p className="mt-2 text-[11px] text-neutral-400">Click the map, or drag the pin, to set the exact location.</p>
    </div>
  );
}

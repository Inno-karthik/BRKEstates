"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Info } from "lucide-react";
import { hideMapClutter } from "@/lib/ola-map";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  latitude: number | null;
  longitude: number | null;
  precision: "exact" | "approximate" | "locality";
  title: string;
};

/** Interactive Ola Maps view of a property's location; falls back to a static link if no key/coords. */
export function PropertyMap({ latitude, longitude, precision, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || latitude == null || longitude == null || !containerRef.current) return;
    let map: { remove: () => void } | null = null;
    let cancelled = false;

    (async () => {
      try {
        const { OlaMaps } = await import("olamaps-web-sdk");
        const olaMaps = new OlaMaps({ apiKey });
        const instance = await olaMaps.init({
          style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
          container: containerRef.current!,
          center: [longitude, latitude],
          zoom: precision === "exact" ? 15 : precision === "approximate" ? 13 : 11,
          attributionControl: false,
        });
        if (cancelled) return;
        map = instance;

        olaMaps
          .addMarker({ color: "#9b1c1c" })
          .setLngLat([longitude, latitude])
          .addTo(instance);
        instance.resize?.();
        hideMapClutter(instance);
        instance.on?.("styledata", () => hideMapClutter(instance));
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [apiKey, latitude, longitude, precision]);

  if (!apiKey || latitude == null || longitude == null || failed) {
    if (latitude == null || longitude == null) return null;
    return (
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 rounded-2xl border border-black/5 bg-neutral-50 py-10 text-sm font-medium text-[var(--color-primary,#9b1c1c)]"
      >
        <MapPin size={16} /> View {title} on the map
      </a>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/5">
      <div ref={containerRef} className="h-72 w-full md:h-96" />
      <OlaAttributionBadge />
    </div>
  );
}

/** Covers the map tile provider's baked-in watermark (part of the map canvas itself,
 *  not a DOM element, so CSS can't hide it) with a full-width info strip instead. */
export function OlaAttributionBadge() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center gap-1.5 bg-gradient-to-t from-white via-white/95 to-transparent px-3 pb-1.5 pt-4 text-[10px] font-medium text-neutral-500">
      <Info size={11} className="shrink-0" />
      Map location is approximate
    </div>
  );
}

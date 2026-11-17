"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LocateFixed, Maximize2 } from "lucide-react";
import { hideMapClutter, type OlaMap } from "@/lib/ola-map";
import { formatPrice } from "@/lib/utils";
import type { Property } from "@/lib/types";
import "maplibre-gl/dist/maplibre-gl.css";

type MapInstance = OlaMap & {
  remove: () => void;
  resize?: () => void;
  on?: (event: string, cb: () => void) => void;
  flyTo: (opts: Record<string, unknown>) => void;
  fitBounds: (bounds: [[number, number], [number, number]], opts?: Record<string, unknown>) => void;
};

// Clearly distinct hues — unlike pulling each type's own theme color (two types can both
// happen to be shades of green), so pins never look like duplicates of each other.
const MARKER_PALETTE = ["#2563eb", "#059669", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#db2777", "#65a30d", "#ea580c", "#4338ca"];

export function LocationMapView({
  properties,
  expandHref,
}: {
  properties: Property[];
  /** When set, shows a "full view" button next to/above the recenter button that links
   *  here — e.g. the homepage's embedded preview linking out to /map. Omit on pages that
   *  are already the full-screen map (nowhere further to expand to). */
  expandHref?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapInstance | null>(null);
  const initialViewRef = useRef<{ center: [number, number]; zoom: number } | (() => void) | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;

  const withCoords = properties.filter((p) => p.latitude != null && p.longitude != null);

  // One distinct color per property type present, assigned in order of first appearance.
  const typeColors = new Map<string, { name: string; color: string }>();
  for (const p of withCoords) {
    if (p.property_type && !typeColors.has(p.property_type.id)) {
      typeColors.set(p.property_type.id, {
        name: p.property_type.name,
        color: MARKER_PALETTE[typeColors.size % MARKER_PALETTE.length],
      });
    }
  }

  useEffect(() => {
    if (!apiKey || !containerRef.current || withCoords.length === 0) return;
    let map: MapInstance | null = null;
    let cancelled = false;
    let onResize: (() => void) | null = null;

    (async () => {
      try {
        const { OlaMaps } = await import("olamaps-web-sdk");
        const olaMaps = new OlaMaps({ apiKey });
        const first = withCoords[0];
        const instance = (await olaMaps.init({
          style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
          container: containerRef.current!,
          center: [first.longitude!, first.latitude!],
          zoom: 12,
          attributionControl: false,
        })) as MapInstance;
        if (cancelled) return;
        map = instance;
        mapRef.current = instance;

        const isHoverCapable = window.matchMedia("(hover: hover)").matches;
        const bounds: [number, number][] = [];
        // Only one property card open at a time — opening a new one closes whichever
        // was already showing, instead of leaving several stacked open on screen.
        let activeHide: (() => void) | null = null;

        for (const p of withCoords) {
          const color = p.property_type ? typeColors.get(p.property_type.id)?.color ?? "#7f1d1d" : "#7f1d1d";
          const cover = p.cover_image || p.images?.[0]?.url;
          const priceLabel = p.price != null ? formatPrice(p.price, null, false) : "";

          // The card is the only visible box — MapLibre's own popup chrome (padded
          // white box, tip, close button) is stripped via CSS, so this owns its own
          // shadow/corners/close button instead of sitting nested inside another one.
          // Title is clamped to 2 lines (ellipsis beyond that) so a long title can never
          // push the price out of view — price always renders in its own fixed row.
          const popupHtml = `
            <div style="position:relative;width:228px;font-family:inherit;border-radius:16px;overflow:hidden;background:#fff;box-shadow:0 12px 32px -10px rgba(0,0,0,.35)">
              <button type="button" class="bhk-popup-close" aria-label="Close" style="position:absolute;top:8px;right:8px;z-index:1;display:flex;align-items:center;justify-content:center;width:22px;height:22px;border:none;border-radius:999px;background:rgba(17,17,17,.5);color:#fff;font-size:13px;line-height:1;cursor:pointer;padding:0">&#215;</button>
              ${cover ? `<img src="${cover}" alt="" style="width:100%;height:120px;object-fit:cover;display:block" />` : ""}
              <div style="padding:10px 12px 12px">
                <p style="font-size:12.5px;font-weight:600;color:#171717;margin:0;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:33px">${p.title}</p>
                <p style="font-size:15px;font-weight:800;color:${color};margin:4px 0 8px;line-height:1.2">${priceLabel || "Price on request"}</p>
                <a href="/listings/${p.slug}" style="display:block;text-align:center;background:${color};color:#fff;font-size:11.5px;font-weight:700;padding:8px 0;border-radius:999px;text-decoration:none">View Property</a>
              </div>
            </div>
          `;

          const lngLat: [number, number] = [p.longitude!, p.latitude!];
          const popup = olaMaps
            .addPopup({ offset: [0, -30], closeButton: false, maxWidth: "240px" })
            .setLngLat(lngLat)
            .setHTML(popupHtml);
          const marker = olaMaps.addMarker({ color }).setLngLat(lngLat).addTo(instance);

          // Managed entirely by hand (not marker.setPopup(), whose built-in click-toggle
          // fought with these listeners and was why hover didn't reliably show/hide it).
          const el = marker.getElement?.();
          if (el) {
            el.style.cursor = "pointer";
            el.style.touchAction = "manipulation";
            // The pin's own hoverable/tappable box only covered its top circle, not the
            // pointed tip — pad it out (with an equal negative margin so it doesn't shift
            // the pin's visual position) so hover/tap works anywhere on the full pin shape.
            el.style.padding = "10px";
            el.style.margin = "-10px";

            let popupOpen = false;
            let hideTimer: ReturnType<typeof setTimeout> | null = null;
            const clearHideTimer = () => {
              if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimer = null;
              }
            };
            const hide = () => {
              clearHideTimer();
              popup.remove();
              popupOpen = false;
              if (activeHide === hide) activeHide = null;
            };
            // Small delay before actually closing on mouseleave, so moving the cursor
            // from the pin onto the popup itself (to click "View Property") doesn't
            // close it out from under the pointer first.
            const scheduleHide = () => {
              clearHideTimer();
              hideTimer = setTimeout(hide, 220);
            };
            const show = () => {
              clearHideTimer();
              if (popupOpen) return;
              activeHide?.();
              popup.setLngLat(lngLat).addTo(instance);
              popupOpen = true;
              activeHide = hide;
              const popupEl = (popup as { getElement?: () => HTMLElement | undefined }).getElement?.();
              if (popupEl && !popupEl.dataset.hoverBound) {
                popupEl.dataset.hoverBound = "1";
                popupEl.addEventListener("mouseenter", clearHideTimer);
                popupEl.addEventListener("mouseleave", scheduleHide);
                popupEl.querySelector(".bhk-popup-close")?.addEventListener("click", (e) => {
                  e.stopPropagation();
                  hide();
                });
              }
            };

            // Tap-to-toggle works on every device (including desktop, as a fallback to
            // hover); hover is layered on top only where the pointer actually supports it.
            el.addEventListener("click", (e: Event) => {
              e.stopPropagation();
              if (popupOpen) hide();
              else show();
            });
            if (isHoverCapable) {
              el.addEventListener("mouseenter", show);
              el.addEventListener("mouseleave", scheduleHide);
            }
          }

          bounds.push(lngLat);
        }

        // Resize before fitting bounds — the container may not have had its final layout
        // size yet when the map first initialized, and fitting bounds against a stale
        // (e.g. zero) size left some points outside the actually-visible area once the
        // map caught up to its real dimensions.
        instance.resize?.();

        if (bounds.length > 1) {
          const lngs = bounds.map((b) => b[0]);
          const lats = bounds.map((b) => b[1]);
          const fitBounds: [[number, number], [number, number]] = [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ];
          instance.fitBounds(fitBounds, { padding: 80, maxZoom: 15, duration: 0 });
          initialViewRef.current = () => instance.fitBounds(fitBounds, { padding: 80, maxZoom: 15, duration: 500 });
        } else {
          initialViewRef.current = { center: [first.longitude!, first.latitude!], zoom: 12 };
        }

        hideMapClutter(instance);
        instance.on?.("styledata", () => hideMapClutter(instance));
        setMapReady(true);

        // Mobile viewport height keeps settling after first paint (address bar
        // collapsing/expanding) — keep the canvas synced so the fit computed above
        // doesn't go stale once the real visible area changes.
        onResize = () => instance?.resize?.();
        window.addEventListener("resize", onResize);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (onResize) window.removeEventListener("resize", onResize);
      map?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  function recenter() {
    const map = mapRef.current;
    const initial = initialViewRef.current;
    if (!map || !initial) return;
    if (typeof initial === "function") initial();
    else map.flyTo({ center: initial.center, zoom: initial.zoom, duration: 500 });
  }

  if (!apiKey || withCoords.length === 0 || failed) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        {withCoords.length === 0 ? "No properties with a map location yet." : "Map unavailable right now."}
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full bg-neutral-50" />
      {!mapReady && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-50 text-neutral-400">
          Loading map…
        </div>
      )}

      {mapReady && (
        // Mobile: top-right, stacked full-view above recenter.
        // Desktop: bottom-right instead, side by side with recenter first (swapped).
        <div className="absolute right-4 top-4 z-10 flex flex-col gap-2 md:top-auto md:bottom-4 md:flex-row-reverse md:items-center">
          {expandHref && (
            <Link
              href={expandHref}
              aria-label="Open full map"
              title="Open full map"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-600 shadow-lg hover:text-[var(--color-primary,#7f1d1d)]"
            >
              <Maximize2 size={16} />
            </Link>
          )}
          <button
            type="button"
            onClick={recenter}
            aria-label="Recenter map"
            title="Recenter map"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-600 shadow-lg hover:text-[var(--color-primary,#7f1d1d)]"
          >
            <LocateFixed size={18} />
          </button>
        </div>
      )}

      {typeColors.size > 0 && (
        // Recenter/full-view buttons moved to top-right, so this no longer needs to
        // dodge anything at the bottom — one line, tight spacing, scrolls sideways on
        // the rare screen too narrow to fit every type. Sits flush against the bottom
        // edge (no gap) so it also covers the map tile provider's baked-in watermark
        // there, which is part of the canvas itself and can't be hidden via CSS.
        <div className="absolute bottom-0 left-0 z-10 flex max-w-[calc(100%-1rem)] items-center gap-x-3 gap-y-1 overflow-x-auto whitespace-nowrap rounded-tr-xl bg-white/95 pb-3 pl-3 pr-3 pt-2.5 shadow-lg backdrop-blur">
          {[...typeColors.values()].map((t) => (
            <span key={t.name} className="flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-neutral-700">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: t.color }} />
              {t.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

export type OlaPlacePrediction = {
  place_id: string;
  description: string;
  mainText: string;
  secondaryText: string;
  lat: number;
  lng: number;
};

/** Ola Maps Places Autocomplete — called from the browser so the domain-restricted key works. */
export async function searchPlaces(input: string, near?: { lat: number; lng: number }): Promise<OlaPlacePrediction[]> {
  const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
  if (!apiKey || !input.trim()) return [];

  const params = new URLSearchParams({ input, api_key: apiKey });
  if (near) params.set("location", `${near.lat},${near.lng}`);

  try {
    const res = await fetch(`https://api.olamaps.io/places/v1/autocomplete?${params.toString()}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { predictions?: unknown[] };
    type Prediction = {
      place_id: string;
      description: string;
      structured_formatting?: { main_text?: string; secondary_text?: string };
      geometry?: { location?: { lat: number; lng: number } };
    };
    return ((data.predictions ?? []) as Prediction[])
      .filter((p) => p.geometry?.location)
      .map((p) => ({
        place_id: p.place_id,
        description: p.description,
        mainText: p.structured_formatting?.main_text ?? p.description,
        secondaryText: p.structured_formatting?.secondary_text ?? "",
        lat: p.geometry!.location!.lat,
        lng: p.geometry!.location!.lng,
      }));
  } catch {
    return [];
  }
}

/** Straight-line (haversine) distance in km — used as a fallback when the routing API is unavailable. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export type RouteResult = { distanceKm: number; durationMin: number | null; polyline: [number, number][] | null };

/** Ola Maps Directions API — falls back to a straight line + haversine distance if the call fails. */
export async function getRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<RouteResult> {
  const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
  const fallback: RouteResult = {
    distanceKm: haversineKm(origin, destination),
    durationMin: null,
    polyline: [
      [origin.lng, origin.lat],
      [destination.lng, destination.lat],
    ],
  };
  if (!apiKey) return fallback;

  try {
    const params = new URLSearchParams({
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      api_key: apiKey,
    });
    const res = await fetch(`https://api.olamaps.io/routing/v1/directions?${params.toString()}`, { method: "POST" });
    if (!res.ok) return fallback;
    const data = (await res.json()) as {
      routes?: {
        legs?: { distance?: number; duration?: number }[];
        // Ola Maps returns the encoded polyline as a plain string here, not
        // Google's { points: string } shape.
        overview_polyline?: string;
      }[];
    };
    const route = data?.routes?.[0];
    if (!route) return fallback;

    const leg = route.legs?.[0];
    const distanceKm = leg?.distance ? leg.distance / 1000 : fallback.distanceKm;
    const durationMin = leg?.duration ? Math.round(leg.duration / 60) : null;

    // decode the encoded polyline if present, else fall back to a straight line
    const encoded = route.overview_polyline;
    const polyline = encoded ? decodePolyline(encoded) : fallback.polyline;

    return { distanceKm, durationMin, polyline };
  } catch {
    return fallback;
  }
}

function decodePolyline(encoded: string): [number, number][] {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: [number, number][] = [];

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coordinates.push([lng / 1e5, lat / 1e5]);
  }

  return coordinates;
}

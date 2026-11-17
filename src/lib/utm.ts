"use client";

const COOKIE = "bhk_utm";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type UtmData = Partial<Record<(typeof UTM_KEYS)[number], string>> & { landing_page?: string };

function getCookie(name: string): string | null {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1] ?? null
  );
}

/** Captures utm_* params from the URL on first touch and persists them (30 days) for lead attribution. */
export function captureUtmFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const hasUtm = UTM_KEYS.some((k) => params.get(k));
  if (!hasUtm) return;

  const data: UtmData = { landing_page: window.location.pathname };
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) data[key] = v;
  }

  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}

export function getStoredUtm(): UtmData {
  try {
    const raw = getCookie(COOKIE);
    return raw ? (JSON.parse(decodeURIComponent(raw)) as UtmData) : {};
  } catch {
    return {};
  }
}

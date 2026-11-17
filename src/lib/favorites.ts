"use client";

const KEY = "bhk_favorites";

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("bhk-favorites-change"));
  } catch {
    // storage unavailable (private mode, etc.) — fail silently
  }
}

export function getFavorites(): string[] {
  return read();
}

export function isFavorite(id: string): boolean {
  return read().includes(id);
}

export function toggleFavorite(id: string): boolean {
  const ids = read();
  const idx = ids.indexOf(id);
  if (idx >= 0) {
    ids.splice(idx, 1);
    write(ids);
    return false;
  }
  ids.push(id);
  write(ids);
  return true;
}

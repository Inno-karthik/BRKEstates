"use client";

import { logEvent } from "@/lib/track-event";

const KEY = "bhk_compare";
export const MAX_COMPARE = 3;

type Entry = { id: string; typeId: string };

function read(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // tolerate the old plain-string-array format from before type-scoping
    if (Array.isArray(parsed) && parsed.length && typeof parsed[0] === "string") return [];
    return parsed as Entry[];
  } catch {
    return [];
  }
}

function write(entries: Entry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
    window.dispatchEvent(new CustomEvent("bhk-compare-change"));
  } catch {
    // ignore
  }
}

export function getCompareIds(): string[] {
  return read().map((e) => e.id);
}

export function getCompareTypeId(): string | null {
  return read()[0]?.typeId ?? null;
}

export function isComparing(id: string): boolean {
  return read().some((e) => e.id === id);
}

export type ToggleResult = {
  added: boolean;
  list: string[];
  reason?: "max" | "different-type";
};

export function toggleCompare(id: string, typeId?: string): ToggleResult {
  const entries = read();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx >= 0) {
    entries.splice(idx, 1);
    write(entries);
    return { added: false, list: entries.map((e) => e.id) };
  }
  if (!typeId) {
    return { added: false, list: entries.map((e) => e.id) };
  }
  if (entries.length > 0 && entries[0].typeId !== typeId) {
    return { added: false, list: entries.map((e) => e.id), reason: "different-type" };
  }
  if (entries.length >= MAX_COMPARE) {
    return { added: false, list: entries.map((e) => e.id), reason: "max" };
  }
  entries.push({ id, typeId });
  write(entries);
  logEvent("compare_add", { propertyId: id });
  return { added: true, list: entries.map((e) => e.id) };
}

export function clearCompare() {
  write([]);
}

export type ColorScheme = {
  key: string;
  label: string;
  primary: string;
  secondary: string;
  accent: string;
};

export const COLOR_SCHEMES: ColorScheme[] = [
  { key: "bkr", label: "BKR Maroon & Gold", primary: "#7f1d1d", secondary: "#3b0b10", accent: "#d4af37" },
  { key: "royal-gold", label: "Royal Gold", primary: "#8a6d1f", secondary: "#2b2210", accent: "#f2c14e" },
  { key: "ocean-blue", label: "Ocean Blue", primary: "#1b5e8f", secondary: "#0e3550", accent: "#5cc8e0" },
  { key: "sunset-coral", label: "Sunset Coral", primary: "#c4532e", secondary: "#5c2416", accent: "#f2a65a" },
  { key: "plum-rose", label: "Plum Rose", primary: "#7a3366", secondary: "#3a1733", accent: "#e0a3c8" },
  { key: "slate-charcoal", label: "Slate Charcoal", primary: "#3c4652", secondary: "#1b2027", accent: "#9fb3c8" },
  { key: "forest-moss", label: "Forest Moss", primary: "#4a6741", secondary: "#232e1f", accent: "#a8c686" },
  { key: "terracotta", label: "Terracotta", primary: "#a15c38", secondary: "#432617", accent: "#e3a872" },
  { key: "midnight-indigo", label: "Midnight Indigo", primary: "#363a8f", secondary: "#191b45", accent: "#8f9bf0" },
  { key: "sandstone", label: "Sandstone", primary: "#8f7a4f", secondary: "#3d331f", accent: "#d9c08f" },
  { key: "crimson", label: "Crimson", primary: "#8f2a2a", secondary: "#3d1212", accent: "#e88080" },
  { key: "teal-breeze", label: "Teal Breeze", primary: "#1f7a6c", secondary: "#0d3a33", accent: "#7fd9c4" },
];

export function getColorScheme(key?: string | null): ColorScheme {
  return COLOR_SCHEMES.find((s) => s.key === key) ?? COLOR_SCHEMES[0];
}

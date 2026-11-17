import { Map, Bot, ShieldCheck, FolderLock } from "lucide-react";

const FEATURES = [
  { icon: Map, text: "Transparent map views with true locations & timings" },
  { icon: Bot, text: "AI Property Assistant to help you search & decide" },
  { icon: ShieldCheck, text: "Transparent, verified property data" },
  { icon: FolderLock, text: "All required documents, shared securely via Vault" },
];

export function FeatureMarquee() {
  // Rendered twice back-to-back — the animation scrolls exactly one copy's width (-50%)
  // so it loops seamlessly with no visible jump.
  const items = [...FEATURES, ...FEATURES];

  return (
    <div className="overflow-hidden border-b border-black/5 bg-white py-3.5">
      <div className="flex w-max animate-marquee gap-10">
        {items.map((f, i) => (
          <span key={i} className="flex items-center gap-2.5 whitespace-nowrap text-sm font-medium text-neutral-700">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary,#1b5e3a)]/10 text-[var(--color-primary,#1b5e3a)]">
              <f.icon size={14} />
            </span>
            {f.text}
          </span>
        ))}
      </div>
    </div>
  );
}

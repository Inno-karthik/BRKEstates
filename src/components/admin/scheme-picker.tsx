"use client";

import { Check } from "lucide-react";
import { COLOR_SCHEMES } from "@/lib/color-schemes";
import { cn } from "@/lib/utils";

export function SchemePicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  return (
    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {COLOR_SCHEMES.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => onChange(s.key)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl border p-2 text-left transition",
            value === s.key ? "border-neutral-900 ring-1 ring-neutral-900" : "border-black/10 hover:border-neutral-300"
          )}
        >
          <span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full border border-black/10">
            <span className="h-full w-1/2" style={{ background: s.primary }} />
            <span className="h-full w-1/2" style={{ background: s.accent }} />
          </span>
          <span className="whitespace-nowrap text-[11px] font-medium text-neutral-700">{s.label}</span>
          {value === s.key && <Check size={13} className="shrink-0 text-neutral-900" />}
        </button>
      ))}
    </div>
  );
}

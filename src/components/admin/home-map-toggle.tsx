"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Map } from "lucide-react";
import { setHomeMapEnabled } from "@/app/(admin)/admin/(dashboard)/locations/actions";

export function HomeMapToggle({ enabled }: { enabled: boolean }) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !isEnabled;
    setIsEnabled(next);
    startTransition(() => setHomeMapEnabled(next));
  }

  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9b1c1c]/10 text-[#9b1c1c]">
          <Map size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-neutral-900">Map section on homepage</p>
          <p className="text-xs text-neutral-500">
            Shows every published property, across all locations, on one map on the homepage.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition disabled:opacity-60 ${
          isEnabled ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-500"
        }`}
      >
        {isEnabled ? <Eye size={13} /> : <EyeOff size={13} />}
        {isEnabled ? "Enabled" : "Disabled"}
      </button>
    </div>
  );
}

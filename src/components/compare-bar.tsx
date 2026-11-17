"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Scale, X } from "lucide-react";
import { getCompareIds, clearCompare } from "@/lib/compare";
import { AnimatePresence, motion } from "framer-motion";

export function CompareBar() {
  const [ids, setIds] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const update = () => setIds(getCompareIds());
    update();
    window.addEventListener("bhk-compare-change", update);
    return () => window.removeEventListener("bhk-compare-change", update);
  }, []);

  if (pathname?.startsWith("/admin") || pathname === "/compare" || ids.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-black/5 bg-white/95 p-3 shadow-2xl backdrop-blur md:bottom-6"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary,#1b5e3a)]/10 text-[var(--color-primary,#1b5e3a)]">
          <Scale size={16} />
        </span>
        <p className="flex-1 text-xs font-medium text-neutral-700">{ids.length} propert{ids.length === 1 ? "y" : "ies"} selected</p>
        <button
          onClick={() => router.push("/compare")}
          disabled={ids.length < 2}
          className="rounded-full bg-[var(--color-primary,#1b5e3a)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
        >
          Compare
        </button>
        <button onClick={clearCompare} className="text-neutral-400 hover:text-neutral-700">
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

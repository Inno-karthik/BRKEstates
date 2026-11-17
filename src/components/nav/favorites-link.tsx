"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

export function FavoritesLink({ className }: { className?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(getFavorites().length);
    update();
    window.addEventListener("bhk-favorites-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("bhk-favorites-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <Link href="/favorites" className={cn("relative items-center justify-center", className)}>
      <Heart size={22} className="text-neutral-700" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent,#d4af37)] text-[9px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

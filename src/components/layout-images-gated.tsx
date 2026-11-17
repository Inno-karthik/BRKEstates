"use client";

import Image from "next/image";
import { LeadUnlock } from "@/components/lead-unlock";
import { useUnlock } from "@/components/unlock-context";
import type { LayoutImage } from "@/lib/types";

export function LayoutImagesGated({
  propertyId,
  propertyTitle,
  layoutImages,
}: {
  propertyId: string;
  propertyTitle: string;
  layoutImages: LayoutImage[];
}) {
  const { unlocked, unlock } = useUnlock();

  if (!unlocked) {
    return (
      <LeadUnlock
        propertyId={propertyId}
        context="Layout & Floor Plans"
        onUnlock={unlock}
        previewImage={layoutImages[0]?.url}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {layoutImages.map((l, i) => (
        <a
          key={i}
          href={l.url}
          target="_blank"
          rel="noreferrer"
          className="group block overflow-hidden rounded-xl border border-black/5 bg-neutral-50"
        >
          <div className="relative aspect-[4/3]">
            <Image
              src={l.url}
              alt={l.title || propertyTitle}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          </div>
          {l.title && <p className="truncate px-2.5 py-2 text-xs font-medium text-neutral-700">{l.title}</p>}
        </a>
      ))}
    </div>
  );
}

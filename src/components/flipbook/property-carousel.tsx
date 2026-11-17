"use client";

import { useCallback, useEffect, useState } from "react";
import { useIsDesktop } from "@/lib/use-is-desktop";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lightbox } from "@/components/flipbook/lightbox";
import { useMatchedHeight } from "@/components/match-height";

/** Single rectangular, swipeable photo carousel used on both mobile and desktop — on
 *  desktop its height is synced (via MatchHeightProvider) to the enquiry form card next
 *  to it so the two line up instead of the gallery towering over or under it. */
export function PropertyCarousel({ images, title }: { images: string[]; title: string }) {
  const [autoplayPlugin] = useState(() => Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: images.length > 1 }, [autoplayPlugin]);
  const [selected, setSelected] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const matchedHeight = useMatchedHeight();
  const isDesktop = useIsDesktop();

  const onSelect = useCallback(() => {
    if (emblaApi) setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    // Sync initial slide index once embla is ready — subscribing alone wouldn't fire for slide 0.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
  }, [emblaApi, onSelect]);

  const heightStyle = isDesktop && matchedHeight ? { height: Math.round(matchedHeight) } : undefined;

  return (
    <div>
      <div
        className={cn("group relative overflow-hidden rounded-2xl bg-neutral-100", !heightStyle && "aspect-[4/5] lg:aspect-[4/3]")}
        style={heightStyle}
        ref={emblaRef}
      >
        <div className="flex h-full">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="relative h-full min-w-0 flex-[0_0_100%]"
              aria-label="View fullscreen"
            >
              <Image
                src={src}
                alt={`${title} — image ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
                unoptimized={src.startsWith("data:")}
                priority={i === 0}
              />
            </button>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2 text-neutral-700 opacity-0 shadow transition group-hover:opacity-100 lg:flex"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Next image"
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2 text-neutral-700 opacity-0 shadow transition group-hover:opacity-100 lg:flex"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white">
          <Expand size={11} /> {images.length > 1 ? `${selected + 1} / ${images.length}` : "Tap to zoom"}
        </span>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === selected ? "w-5 bg-[var(--color-primary,#9b1c1c)]" : "w-1.5 bg-neutral-300"
              )}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox images={images} index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNavigate={setLightboxIndex} />
      )}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % images.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, images.length, onClose, onNavigate]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
      <button onClick={onClose} className="absolute right-4 top-4 text-white/80 hover:text-white" aria-label="Close">
        <X size={28} />
      </button>
      <button
        onClick={() => onNavigate((index - 1 + images.length) % images.length)}
        className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:left-6"
        aria-label="Previous"
      >
        <ChevronLeft size={22} />
      </button>
      <div className="relative h-[80vh] w-full max-w-4xl">
        <Image
          src={images[index]}
          alt={`Image ${index + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
          unoptimized={images[index]?.startsWith("data:")}
        />
      </div>
      <button
        onClick={() => onNavigate((index + 1) % images.length)}
        className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-6"
        aria-label="Next"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
}

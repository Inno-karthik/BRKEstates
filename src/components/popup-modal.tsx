"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Popup } from "@/lib/types";

/**
 * Popup shown over a blurred copy of the page. The media (image or video, portrait or landscape)
 * is shown at its own shape — no card, no padding, no white space — with a close button sitting
 * just above its top-right corner.
 */
export function PopupModal({ popup }: { popup: Popup }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(`bhk_popup_dismissed_${popup.id}`)) return;
    } catch {
      // ignore
    }
    const timer = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(timer);
  }, [popup.id]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(`bhk_popup_dismissed_${popup.id}`, "1");
    } catch {
      // ignore
    }
  }

  const isVideo = popup.media_type === "video" && !!popup.video_url;
  const isExternal = popup.target_url?.startsWith("http");

  const bubble =
    "bg-black/35 text-white backdrop-blur-md ring-1 ring-white/30 transition hover:bg-black/55 active:scale-95";
  const mediaClass = "block h-auto max-h-[80vh] w-auto max-w-[92vw] rounded-2xl shadow-2xl sm:max-w-[min(92vw,720px)]";

  const imageEl = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={popup.image_url ?? ""} alt={popup.title} className={mediaClass} draggable={false} />
  );

  let media: React.ReactNode;
  if (isVideo) {
    media = (
      <div className="relative">
        <video
          src={popup.video_url ?? undefined}
          className={mediaClass}
          autoPlay
          muted
          loop
          playsInline
          controls
          controlsList="nodownload"
        />
        {popup.target_url &&
          (isExternal ? (
            <a
              href={popup.target_url}
              target="_blank"
              rel="noreferrer"
              onClick={dismiss}
              className={`absolute bottom-16 right-3 flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${bubble}`}
            >
              Know more <ArrowRight size={12} />
            </a>
          ) : (
            <Link
              href={popup.target_url}
              onClick={dismiss}
              className={`absolute bottom-16 right-3 flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold ${bubble}`}
            >
              Know more <ArrowRight size={12} />
            </Link>
          ))}
      </div>
    );
  } else if (popup.image_url) {
    media = popup.target_url ? (
      isExternal ? (
        <a href={popup.target_url} target="_blank" rel="noreferrer" onClick={dismiss}>
          {imageEl}
        </a>
      ) : (
        <Link href={popup.target_url} onClick={dismiss}>
          {imageEl}
        </Link>
      )
    ) : (
      imageEl
    );
  } else {
    media = (
      <div className="flex w-[min(88vw,420px)] flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-secondary,#14307e)] to-[var(--color-primary,#d0191f)] p-10 text-center shadow-2xl">
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">{popup.title}</h3>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/35 backdrop-blur-md"
            onClick={dismiss}
          />
          <motion.div
            role="dialog"
            aria-label={popup.title}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 300 }}
            className="relative"
          >
            <button
              onClick={dismiss}
              aria-label="Close"
              className={`absolute -right-3 -top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full ${bubble}`}
            >
              <X size={18} strokeWidth={2.5} />
            </button>
            {media}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Popup } from "@/lib/types";

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

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(`bhk_popup_dismissed_${popup.id}`, "1");
    } catch {
      // ignore
    }
  }

  const isExternal = popup.target_url?.startsWith("http");

  const content = (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dismiss();
        }}
        aria-label="Close"
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
      >
        <X size={16} />
      </button>

      {popup.image_url ? (
        <div className="relative aspect-[4/5] w-full">
          <Image src={popup.image_url} alt={popup.title} fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="flex aspect-[4/3] w-full flex-col items-center justify-center bg-gradient-to-br from-[var(--color-secondary,#3b0b10)] to-[var(--color-primary,#7f1d1d)] p-8 text-center">
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">{popup.title}</h3>
        </div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={dismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="relative w-full max-w-sm"
          >
            {popup.target_url ? (
              isExternal ? (
                <a href={popup.target_url} target="_blank" rel="noreferrer" onClick={dismiss}>
                  {content}
                </a>
              ) : (
                <Link href={popup.target_url} onClick={dismiss}>
                  {content}
                </Link>
              )
            ) : (
              content
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

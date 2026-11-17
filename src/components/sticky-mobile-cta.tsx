"use client";

import { useState } from "react";
import { MessageSquare, Share2, Check, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { TrackedLink } from "@/components/tracked-link";
import { WhatsappIcon } from "@/components/social-icons";
import { EnquiryForm } from "@/components/enquiry-form";
import type { UnitVariant } from "@/lib/types";

export function StickyMobileCta({
  propertyId,
  whatsapp,
  title,
  variants,
}: {
  propertyId: string;
  phone?: string | null;
  whatsapp?: string | null;
  title: string;
  variants?: UnitVariant[];
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cols = ["enquire", whatsapp && "whatsapp", "share"].filter(Boolean).length;

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-16 z-30 grid gap-px border-t border-black/5 bg-black/5 pb-[env(safe-area-inset-bottom)] md:hidden"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-1.5 bg-[var(--color-primary,#7f1d1d)] py-3.5 text-xs font-semibold text-white"
        >
          <MessageSquare size={15} /> Enquire
        </button>
        {whatsapp && (
          <TrackedLink
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in ${title}`)}`}
            event="whatsapp_click"
            propertyId={propertyId}
            className="flex items-center justify-center gap-1.5 bg-[#25D366] py-3.5 text-xs font-semibold text-white"
          >
            <WhatsappIcon size={15} className="text-white" /> WhatsApp
          </TrackedLink>
        )}
        <button
          onClick={share}
          className="flex items-center justify-center gap-1.5 bg-white py-3.5 text-xs font-semibold text-neutral-800"
        >
          {copied ? <Check size={15} /> : <Share2 size={15} />}
          {copied ? "Copied!" : "Share"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[70] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-neutral-900">Enquire about this property</p>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500"
                >
                  <X size={16} />
                </button>
              </div>
              <EnquiryForm propertyId={propertyId} propertyTitle={title} variants={variants} bare />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

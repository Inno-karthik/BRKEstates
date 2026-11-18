"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, Loader2 } from "lucide-react";
import { submitUnlockLead } from "@/app/(site)/listings/[slug]/actions";

/** Gates a piece of content (brochure, layout images) behind a short lead-capture form —
 *  name + mobile required, email optional — then calls onUnlock so the caller can reveal
 *  the real content. The lead lands in the normal CRM leads table, tagged by context.
 *  An optional previewImage renders heavily blurred behind the form, as a visual tease
 *  that there's real content waiting rather than an empty locked box. */
export function LeadUnlock({
  propertyId,
  context,
  onUnlock,
  previewImage,
}: {
  propertyId: string;
  context: "Brochure" | "Layout & Floor Plans";
  onUnlock: () => void;
  previewImage?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await submitUnlockLead({ propertyId, context, name, phone, email });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Something went wrong — please try again.");
      return;
    }
    onUnlock();
  }

  return (
    <div className="relative flex min-h-[22rem] flex-col items-center justify-center overflow-hidden rounded-2xl border border-black/10">
      {previewImage && (
        <Image
          src={previewImage}
          alt=""
          fill
          unoptimized
          className="scale-110 object-cover opacity-70 blur-2xl"
        />
      )}
      <div className="absolute inset-0 bg-white/55 backdrop-blur-sm" />

      <div className="relative flex flex-col items-center gap-3 p-8 text-center">
        {!expanded ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex items-center gap-2 rounded-full bg-[var(--color-primary,#d0191f)] px-5 py-2.5 text-sm font-semibold text-white shadow-md"
          >
            <Lock size={15} /> Unlock {context}
          </button>
        ) : (
          <form onSubmit={submit} className="w-full max-w-sm space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary,#d0191f)]"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile number"
              type="tel"
              required
              className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary,#d0191f)]"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
              type="email"
              className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-primary,#d0191f)]"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--color-primary,#d0191f)] py-2.5 text-sm font-semibold text-white shadow-md disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              {submitting ? "Unlocking…" : `Unlock ${context}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

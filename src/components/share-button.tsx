"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

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
    <button
      onClick={share}
      className={className ?? "flex w-full items-center justify-center gap-2 rounded-full border border-black/10 py-2.5 text-sm font-medium text-neutral-600 hover:border-neutral-300"}
    >
      {copied ? <Check size={15} /> : <Share2 size={15} />}
      {copied ? "Link copied!" : "Share this property"}
    </button>
  );
}

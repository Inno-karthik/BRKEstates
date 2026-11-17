import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AUTHOR } from "@/lib/author";

/** Compact founder strip for the homepage — photo on the left. */
export function AuthorSpotlight() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-14 md:px-8">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-[var(--color-accent,#d4af37)]/30 bg-gradient-to-br from-white to-[#fff7ee] p-6 shadow-sm sm:flex-row sm:items-center sm:gap-8 md:p-8">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-2xl ring-2 ring-[var(--color-accent,#d4af37)]/60 md:h-40 md:w-40">
          <Image src={AUTHOR.portrait} alt={AUTHOR.title} fill sizes="160px" className="object-cover" />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary,#7f1d1d)]">Meet the Founder</p>
          <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold text-neutral-900 md:text-2xl">
            {AUTHOR.tagline}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">{AUTHOR.short}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-start">
            <span className="text-sm text-neutral-700"><b className="text-[var(--color-primary,#7f1d1d)]">20+</b> yrs at Prakruti</span>
            <span className="text-sm text-neutral-700"><b className="text-[var(--color-primary,#7f1d1d)]">115</b> ventures</span>
            <Link href="/about" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary,#7f1d1d)] hover:underline">
              Read his story <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

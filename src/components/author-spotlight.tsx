import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Building2, Quote } from "lucide-react";
import { AUTHOR } from "@/lib/author";

/** Founder band for the homepage — burgundy with gold accents, photo on the left. */
export function AuthorSpotlight() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#5a1219] via-[#3b0b10] to-[#1f0508] p-6 shadow-2xl ring-1 ring-[var(--color-accent,#d4af37)]/40 sm:p-8 md:p-12">
        {/* gold glow + hairlines */}
        <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-[var(--color-accent,#d4af37)]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 -z-10 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent,#d4af37)] to-transparent" />
        <Quote
          size={120}
          strokeWidth={1}
          className="pointer-events-none absolute right-6 top-4 -z-10 text-[var(--color-accent,#d4af37)]/10"
          aria-hidden
        />

        <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12">
          {/* photo with offset gold frame */}
          <div className="relative shrink-0">
            <div className="absolute -bottom-3 -right-3 h-full w-full rounded-3xl border-2 border-[var(--color-accent,#d4af37)]/70" />
            <div className="relative h-44 w-44 overflow-hidden rounded-3xl ring-4 ring-[var(--color-accent,#d4af37)] sm:h-52 sm:w-52 md:h-60 md:w-60">
              <Image src={AUTHOR.portrait} alt={AUTHOR.title} fill sizes="240px" className="object-cover" />
            </div>
            <span className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#f3d98b] via-[#d4af37] to-[#b8901f] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#3b0b10] shadow-lg">
              <Award size={13} /> Founder
            </span>
          </div>

          <div className="mt-4 text-center md:mt-0 md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent,#d4af37)]">Meet the Founder</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold leading-snug text-white md:text-3xl">
              Your guide, consultant and{" "}
              <span className="bg-gradient-to-r from-[#f3d98b] via-[#d4af37] to-[#e7c35a] bg-clip-text text-transparent">
                investment companion
              </span>{" "}
              in Visakhapatnam real estate.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75 md:text-[15px]">{AUTHOR.short}</p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent,#d4af37)]/40 bg-white/5 px-4 py-2 text-sm text-white/85">
                <Award size={15} className="text-[var(--color-accent,#d4af37)]" />
                <b className="text-[var(--color-accent,#d4af37)]">20+</b> years at Prakruti
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent,#d4af37)]/40 bg-white/5 px-4 py-2 text-sm text-white/85">
                <Building2 size={15} className="text-[var(--color-accent,#d4af37)]" />
                <b className="text-[var(--color-accent,#d4af37)]">115+</b> projects
              </span>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f3d98b] via-[#d4af37] to-[#b8901f] px-5 py-2.5 text-sm font-semibold text-[#3b0b10] shadow-lg transition hover:brightness-105 active:scale-[0.97]"
              >
                Read his story <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

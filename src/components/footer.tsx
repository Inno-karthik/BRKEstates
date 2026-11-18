import { HERO_BG } from "@/lib/author";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon, TwitterIcon } from "@/components/social-icons";
import type { PropertyType, SiteSettings } from "@/lib/types";

// Placeholders so the footer looks complete before the admin sets real profiles in Settings.
const DUMMY_SOCIAL = {
  facebook: "https://facebook.com/bkrestates",
  instagram: "https://instagram.com/bkrestates",
  youtube: "https://youtube.com/@bkrestates",
  twitter: "https://x.com/bkrestates",
};

export function Footer({ types, settings }: { types: PropertyType[]; settings: SiteSettings }) {
  return (
    <footer className="relative isolate mt-16 overflow-hidden border-t-2 border-[var(--color-accent,#d4af37)]/70 bg-[var(--color-secondary,#3b0b10)] text-white">
      <Image src={HERO_BG} alt="" fill sizes="100vw" className="-z-20 object-cover object-bottom opacity-70" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/62 via-black/55 to-black/72" />
      {settings.phone && (
        <div className="relative overflow-hidden border-b border-[#3b0b10]/30 bg-gradient-to-r from-[#f3d98b] via-[#d4af37] to-[#c4961c]">
          <div className="pointer-events-none absolute -left-10 top-0 h-full w-1/3 -skew-x-12 bg-white/20 blur-2xl" />
          <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-9 text-center sm:flex-row sm:text-left md:px-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#3b0b10] text-[#f3d98b] shadow-lg ring-4 ring-white/30">
                <Phone size={24} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3b0b10]/70">Have a question?</p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[#2a080c] md:text-3xl">
                  Call us at{" "}
                  <a
                    href={`tel:${settings.phone}`}
                    className="whitespace-nowrap text-[#7f1d1d] underline decoration-[#7f1d1d]/40 decoration-2 underline-offset-4 hover:decoration-[#7f1d1d]"
                  >
                    {settings.phone}
                  </a>
                </p>
              </div>
            </div>
            <Link
              href="/contact"
              className="flex shrink-0 items-center gap-2 rounded-full bg-[#3b0b10] px-7 py-3.5 text-sm font-semibold text-white shadow-xl transition hover:scale-[1.03] hover:bg-[#2a080c] active:scale-[0.97]"
            >
              Enquire Now <ArrowRight size={15} className="text-[#f3d98b]" />
            </Link>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 md:gap-x-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="lg:pr-4">
            <div className="inline-flex rounded-xl bg-white px-3 py-2 shadow-sm">
              <Image
                src={settings.logo_url || "/brand/logo.png"}
                alt={settings.site_name}
                width={200}
                height={64}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="mt-4 text-sm text-white/70">
              {settings.footer_text ?? "Your trusted partner in finding the perfect property."}
            </p>
            <div className="mt-5 flex gap-2.5">
              <a
                href={settings.facebook_url || DUMMY_SOCIAL.facebook}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--color-accent,#d4af37)] hover:text-[var(--color-secondary,#3b0b10)]"
              >
                <FacebookIcon size={16} />
              </a>
              <a
                href={settings.instagram_url || DUMMY_SOCIAL.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--color-accent,#d4af37)] hover:text-[var(--color-secondary,#3b0b10)]"
              >
                <InstagramIcon size={16} />
              </a>
              <a
                href={settings.youtube_url || DUMMY_SOCIAL.youtube}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--color-accent,#d4af37)] hover:text-[var(--color-secondary,#3b0b10)]"
              >
                <YoutubeIcon size={16} />
              </a>
              <a
                href={settings.twitter_url || DUMMY_SOCIAL.twitter}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--color-accent,#d4af37)] hover:text-[var(--color-secondary,#3b0b10)]"
              >
                <TwitterIcon size={16} />
              </a>
            </div>
          </div>

          {types.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white/50">Property Types</h4>
              <ul className="mt-4 space-y-2.5 text-sm text-white/80">
                {types.map((t) => (
                  <li key={t.id}>
                    <Link href={`/listings?type=${t.slug}`} className="hover:text-[var(--color-accent,#d4af37)]">
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/50">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              <li><Link href="/listings" className="hover:text-[var(--color-accent,#d4af37)]">Our Projects</Link></li>
              <li><Link href="/map" className="hover:text-[var(--color-accent,#d4af37)]">Project Map</Link></li>
              <li><Link href="/blog" className="hover:text-[var(--color-accent,#d4af37)]">Blog</Link></li>
              <li><Link href="/favorites" className="hover:text-[var(--color-accent,#d4af37)]">Shortlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white/50">Get in Touch</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              {settings.phone && (
                <li className="flex items-center gap-2">
                  <Phone size={15} /> <a href={`tel:${settings.phone}`}>{settings.phone}</a>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2">
                  <Mail size={15} /> <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2">
                  <MapPin size={15} className="mt-0.5 shrink-0" /> <span>{settings.address}</span>
                </li>
              )}
            </ul>

          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            <a href="/privacy-policy" target="_blank" rel="noreferrer" className="hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms-and-conditions" target="_blank" rel="noreferrer" className="hover:text-white">
              Terms &amp; Conditions
            </a>
            <a href="/disclaimer" target="_blank" rel="noreferrer" className="hover:text-white">
              Disclaimer
            </a>
          </div>
          <p>
            © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
            <span className="mx-2 text-white/30">|</span>
            Powered by <b className="font-semibold text-[var(--color-accent,#d4af37)]">Prakruti Avenues</b>
          </p>
          <p className="mt-1.5">
            Application by{" "}
            <a href="https://innovalley.in" target="_blank" rel="noreferrer" className="text-white/70 hover:text-white">
              Innovalley
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

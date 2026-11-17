import Image from "next/image";
import { ShieldCheck, Users, TrendingUp, Award, Compass, Handshake, LineChart, CheckCircle2 } from "lucide-react";
import { AUTHOR } from "@/lib/author";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { PageTheme } from "@/components/theme-style";
import { getPublishedPropertiesCount, getSiteSettings } from "@/lib/queries";
import type { Metadata } from "next";

// ISR via the R2 incremental cache doesn't reliably pick up revalidatePath() from admin
// actions yet, so this stays dynamic until that's sorted out.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const seo = settings.page_seo?.about;
  return {
    title: seo?.title || "About Us",
    description:
      seo?.description ||
      "Learn about BKR Estates, powered by Prakruti — Visakhapatnam real estate guided by 20+ years of experience and 115+ projects.",
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const [settings, propertiesCount] = await Promise.all([getSiteSettings(), getPublishedPropertiesCount()]);

  return (
    <PageTheme page="about">
      <section className="bg-[var(--color-secondary,#3b0b10)] py-16 text-center text-white md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold md:text-5xl">
            About {settings.site_name}
          </h1>
          <p className="mt-4 text-sm text-white/70 md:text-base">
            We help families and investors in and around Visakhapatnam find properties they&apos;ll love —
            with transparency, deep local expertise and a human touch.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Our Story</h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              {settings.site_name}, powered by Prakruti, was founded with a simple goal: make finding and buying
              property in Visakhapatnam honest, transparent and genuinely helpful. We vet every listing, work
              closely with owners and developers, and guide buyers through every step — from the first site visit
              to registration.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Whether you&apos;re looking for your first apartment, a villa to call home, an open plot to build
              on, or farm land to invest in, our team brings deep knowledge of Madhurawada, Rushikonda, Dwaraka Nagar,
              Anandapuram, Bheemili, Pendurthi and the wider Vizag growth corridors to every conversation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat icon={ShieldCheck} label="Customer Satisfaction" value={100} suffix="%" />
            <Stat icon={Users} label="Projects" value={115} suffix="+" />
            <Stat icon={TrendingUp} label="Properties Live" value={propertiesCount} suffix="+" />
            <Stat icon={Award} label="Years with Prakruti" value={20} suffix="+" />
          </div>
        </div>
      </section>

      {/* Founder / author */}
      <section className="bg-gradient-to-b from-[#fff6ec] to-white py-16">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-primary,#7f1d1d)]">Meet the Founder</p>
          <h2 className="mx-auto mt-2 max-w-2xl text-center font-[family-name:var(--font-display)] text-2xl font-bold text-neutral-900 md:text-4xl">
            {AUTHOR.tagline}
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-[320px_1fr] md:items-start lg:gap-12">
            <div className="mx-auto w-full max-w-xs md:max-w-none">
              <div className="relative aspect-square overflow-hidden rounded-3xl shadow-xl ring-4 ring-[var(--color-accent,#d4af37)]/50">
                <Image src={AUTHOR.portrait} alt={AUTHOR.title} fill sizes="(min-width:768px) 320px, 80vw" className="object-cover" priority />
              </div>
              <p className="mt-4 text-center text-sm font-semibold text-neutral-800">{AUTHOR.title}</p>
              <p className="text-center text-xs text-neutral-500">Regional Deputy Director · Prakruti Avenues</p>
            </div>

            <div>
              <p className="text-sm leading-relaxed text-neutral-600 md:text-base">{AUTHOR.short}</p>
              <ul className="mt-6 space-y-3">
                {AUTHOR.journey.map((j) => (
                  <li key={j} className="flex gap-3 text-sm text-neutral-700">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--color-primary,#7f1d1d)]" />
                    <span>{j}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {AUTHOR.strengths.map((st, i) => {
                  const Ico = [Compass, Handshake, LineChart][i] ?? Compass;
                  return (
                    <div key={st.title} className="rounded-2xl border border-[var(--color-accent,#d4af37)]/30 bg-white p-4 shadow-sm">
                      <Ico size={20} className="text-[var(--color-primary,#7f1d1d)]" />
                      <h3 className="mt-2 text-sm font-semibold text-neutral-900">{st.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-500">{st.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <figure className="mt-12 overflow-hidden rounded-3xl border border-black/5 shadow-lg">
            <div className="relative aspect-[3/2] w-full sm:aspect-[16/9]">
              <Image src={AUTHOR.group} alt="Honoured at a Prakruti recognition event" fill sizes="(min-width:1152px) 1100px, 100vw" className="object-cover object-[50%_30%]" />
            </div>
            <figcaption className="bg-white px-4 py-3 text-center text-xs text-neutral-500">
              Recognised at a Prakruti event — two decades of trust, built one family at a time.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center md:px-8">
          <h2 className="text-2xl font-bold text-neutral-900">Our Values</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Value title="Transparency" description="Clear pricing, honest details, no hidden surprises." />
            <Value title="Local Expertise" description="We know Visakhapatnam's neighbourhoods and growth corridors." />
            <Value title="Client First" description="Your goals guide every recommendation we make." />
          </div>
        </div>
      </section>
    </PageTheme>
  );
}

function Stat({ icon: IconC, label, value, suffix }: { icon: typeof ShieldCheck; label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 text-center shadow-sm">
      <IconC className="mx-auto mb-2 text-[var(--color-primary,#7f1d1d)]" size={24} />
      <p className="text-xl font-bold text-neutral-900">
        <AnimatedNumber value={value} suffix={suffix} />
      </p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function Value({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6">
      <h3 className="font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-sm text-neutral-500">{description}</p>
    </div>
  );
}

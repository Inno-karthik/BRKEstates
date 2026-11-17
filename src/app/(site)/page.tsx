import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Users } from "lucide-react";
import { PageTheme } from "@/components/theme-style";
import { HeroSearch, TypeTile } from "@/components/hero-search";
import { HeroScenicBg } from "@/components/hero-scenic-bg";
import { PropertyCard } from "@/components/property-card";
import { RecentlyViewed } from "@/components/recently-viewed";
import { FeatureMarquee } from "@/components/feature-marquee";
import { LocationMapView } from "@/components/location-map-view";
import {
  getActiveLocations,
  getActivePropertyTypes,
  getAllMappableProperties,
  getFeaturedProperties,
  getPublishedPropertiesCount,
  getSiteSettings,
} from "@/lib/queries";
import type { Metadata } from "next";

// ISR via the R2 incremental cache doesn't reliably pick up revalidatePath() calls from
// admin actions yet (edits weren't showing up live), so this stays dynamic for now —
// still lighter than before since it no longer needs cookies() (see RecentlyViewed).
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const seo = settings.page_seo?.home;
  if (!seo?.title && !seo?.description) return {};
  return { title: seo.title || undefined, description: seo.description || undefined };
}

export default async function HomePage() {
  const [types, locations, featured, settings, propertiesCount] = await Promise.all([
    getActivePropertyTypes(),
    getActiveLocations(),
    getFeaturedProperties(8),
    getSiteSettings(),
    getPublishedPropertiesCount(),
  ]);
  const mapProperties = settings.home_map_enabled ? await getAllMappableProperties() : [];

  return (
    <PageTheme page="home">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--color-secondary,#0f3d26)]">
        <HeroScenicBg />
        <div className="absolute inset-0 bg-dot-grid opacity-40" />
        <div className="blob left-[-10%] top-[-15%] h-[28rem] w-[28rem] bg-[var(--color-primary,#1b5e3a)]/60" />
        <div
          className="blob right-[-12%] top-[10%] h-[24rem] w-[24rem] bg-[var(--color-accent,#d4af37)]/25"
          style={{ animationDelay: "-6s" }}
        />
        <div className="blob bottom-[-20%] left-[30%] h-[22rem] w-[22rem] bg-emerald-400/10" style={{ animationDelay: "-11s" }} />

        <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-20 text-center md:pb-24 md:pt-32">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
            Your Tomorrow Begins Today.
          </span>
          <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl">
            A Better Tomorrow Begins with the{" "}
            <span className="text-gradient-accent">Right Choice</span> Today.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm text-white/70 md:text-base">
            Every opportunity opens a new possibility. At BRK Estates, we bring together properties across budgets
            and aspirations, with the information and insights you need to explore your options and choose what
            feels right for your future.
          </p>
          <div className="mx-auto mt-9 max-w-2xl">
            <HeroSearch types={types} locations={locations} />
          </div>
        </div>

        {/* floating stat strip — mirrors the About page's four stats, with Properties
            Listed pulled live from the DB instead of hand-typed. */}
        <div className="relative mx-auto max-w-sm px-4 pb-14 sm:max-w-2xl md:pb-20">
          <div className="grid grid-cols-2 divide-x divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur sm:grid-cols-4 sm:divide-y-0">
            <HeroStat value="100%" label="Verified Listings" />
            <HeroStat value="100+" label="Customers" />
            <HeroStat value={`${propertiesCount}+`} label="Properties Live" />
            <HeroStat value="5+" label="Years of Experience" />
          </div>
        </div>
      </section>

      <FeatureMarquee />

      {/* Dynamic property type tiles — nothing shows unless admin adds & activates it */}
      {types.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">Browse by Property Type</h2>
            <p className="mt-2 text-sm text-neutral-500">Explore what&apos;s available right now</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {types.map((t) => (
              <TypeTile key={t.id} type={t} />
            ))}
          </div>
        </section>
      )}

      {/* Featured listings */}
      {featured.length > 0 && (
        <section className="bg-neutral-50 py-16">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">Featured Properties</h2>
                <p className="mt-2 text-sm text-neutral-500">Hand-picked listings worth a look</p>
              </div>
              <Link
                href="/listings"
                className="hidden items-center gap-1 text-sm font-semibold text-[var(--color-primary,#1b5e3a)] sm:flex"
              >
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/listings"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary,#1b5e3a)]"
              >
                View all listings <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Site-wide map — admin can turn this off from Admin → Locations. The expand
          icon on the map itself (top-right) opens /map full-screen. */}
      {settings.home_map_enabled && mapProperties.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 md:text-3xl">Verified &amp; Trusted Properties</h2>
            <p className="mt-2 text-sm text-neutral-500">Every published listing, across every location, on one map</p>
          </div>
          <div className="relative h-[420px] overflow-hidden rounded-2xl border border-black/5 shadow-sm md:h-[480px]">
            <LocationMapView properties={mapProperties} expandHref="/map" />
          </div>
        </section>
      )}

      <RecentlyViewed />

      {/* Trust strip */}
      <section className="border-y border-black/5 bg-white py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-4 sm:grid-cols-3">
          <TrustCard icon={ShieldCheck} title="Verified Listings" desc="Every property reviewed before it goes live" />
          <TrustCard icon={Users} title="Local Expertise" desc="Deep knowledge of neighborhoods that matter" />
          <TrustCard icon={Sparkles} title="Transparent Pricing" desc="No hidden surprises, ever" />
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate mx-auto my-16 max-w-5xl overflow-hidden rounded-[2rem] px-4 py-16 text-center md:px-8">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "linear-gradient(135deg, var(--color-secondary,#0f3d26), var(--color-primary,#1b5e3a))" }}
        />
        <div className="blob left-1/4 top-[-30%] h-72 w-72 bg-[var(--color-accent,#d4af37)]/20" />
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white md:text-4xl">
          Have a property to sell or rent?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/70">
          Get in touch and our team will help you find the right buyer or tenant.
        </p>
        <Link
          href="/contact"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-[var(--color-secondary,#0f3d26)] shadow-lg transition hover:scale-[1.03]"
        >
          Contact Us <ArrowRight size={15} />
        </Link>
      </section>
    </PageTheme>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-4 py-5 text-center first:pl-5 last:pr-5">
      <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-white md:text-3xl">{value}</p>
      <p className="mt-0.5 text-[11px] text-white/60 md:text-xs">{label}</p>
    </div>
  );
}

function TrustCard({ icon: IconC, title, desc }: { icon: typeof ShieldCheck; title: string; desc: string }) {
  return (
    <div className="group rounded-2xl border border-black/5 p-6 text-center transition hover:-translate-y-1 hover:border-[var(--color-primary,#1b5e3a)]/20 hover:shadow-lg">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary,#1b5e3a)]/10 text-[var(--color-primary,#1b5e3a)] transition-transform group-hover:scale-110">
        <IconC size={22} />
      </span>
      <h3 className="mt-3 font-semibold text-neutral-900">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500">{desc}</p>
    </div>
  );
}

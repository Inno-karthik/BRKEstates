import { ShieldCheck, Users, TrendingUp, Award } from "lucide-react";
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
      "Learn about BRK Estates — our story, values, and commitment to transparent, verified real estate listings.",
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const [settings, propertiesCount] = await Promise.all([getSiteSettings(), getPublishedPropertiesCount()]);

  return (
    <PageTheme page="about">
      <section className="bg-[var(--color-secondary,#0f3d26)] py-16 text-center text-white md:py-24">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold md:text-5xl">
            About {settings.site_name}
          </h1>
          <p className="mt-4 text-sm text-white/70 md:text-base">
            We help families and investors find properties they&apos;ll love — with transparency, local
            expertise and a human touch.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Our Story</h2>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              {settings.site_name} was founded with a simple goal: make finding and buying property honest,
              transparent and genuinely helpful. We vet every listing, work closely with property owners, and
              guide buyers through every step — from the first search to closing the deal.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Whether you&apos;re looking for your first apartment, a villa to call home, an open plot to build
              on, or farm land to invest in, our team brings deep local knowledge to every conversation.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat icon={ShieldCheck} label="Verified Listings" value="100%" />
            <Stat icon={Users} label="Customers" value="100+" />
            <Stat icon={TrendingUp} label="Properties Live" value={`${propertiesCount}+`} />
            <Stat icon={Award} label="Years of Experience" value="5+" />
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-5xl px-4 text-center md:px-8">
          <h2 className="text-2xl font-bold text-neutral-900">Our Values</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Value title="Transparency" description="Clear pricing, honest details, no hidden surprises." />
            <Value title="Local Expertise" description="We know the neighborhoods that matter to you." />
            <Value title="Client First" description="Your goals guide every recommendation we make." />
          </div>
        </div>
      </section>
    </PageTheme>
  );
}

function Stat({ icon: IconC, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 text-center shadow-sm">
      <IconC className="mx-auto mb-2 text-[var(--color-primary,#1b5e3a)]" size={24} />
      <p className="text-xl font-bold text-neutral-900">{value}</p>
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

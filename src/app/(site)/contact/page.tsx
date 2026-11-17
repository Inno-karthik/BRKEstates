import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { PageTheme } from "@/components/theme-style";
import { EnquiryForm } from "@/components/enquiry-form";
import { WhatsappIcon } from "@/components/social-icons";
import { TrackedLink } from "@/components/tracked-link";
import { getSiteSettings } from "@/lib/queries";
import type { Metadata } from "next";

// ISR via the R2 incremental cache doesn't reliably pick up revalidatePath() from admin
// actions yet, so this stays dynamic until that's sorted out.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const seo = settings.page_seo?.contact;
  return {
    title: seo?.title || "Contact Us",
    description:
      seo?.description ||
      "Get in touch with BKR Estates by phone, WhatsApp or email — we're here to help you find your next property.",
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <PageTheme page="contact">
      <section className="bg-[var(--color-secondary,#3b0b10)] py-16 text-center text-white md:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold md:text-5xl">Get in Touch</h1>
          <p className="mt-4 text-sm text-white/70 md:text-base">
            Have a question or ready to find your next property? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div className="space-y-4">
            {settings.phone && (
              <ContactRow
                icon={Phone}
                label="Call us"
                value={settings.phone}
                href={`tel:${settings.phone}`}
                event="call_click"
              />
            )}
            {settings.whatsapp && (
              <ContactRow
                icon={WhatsappIcon}
                label="WhatsApp"
                value={settings.whatsapp}
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                event="whatsapp_click"
              />
            )}
            {settings.email && (
              <ContactRow icon={Mail} label="Email us" value={settings.email} href={`mailto:${settings.email}`} />
            )}
            {settings.address && <ContactRow icon={MapPin} label="Visit us" value={settings.address} />}
            <ContactRow icon={Clock} label="Working Hours" value="Mon – Sat, 9:30 AM – 7:00 PM" />
          </div>

          <EnquiryForm />
        </div>
      </section>
    </PageTheme>
  );
}

function ContactRow({
  icon: IconC,
  label,
  value,
  href,
  event,
}: {
  icon: React.ElementType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  href?: string;
  event?: "call_click" | "whatsapp_click";
}) {
  const content = (
    <div className="flex items-start gap-3 rounded-xl border border-black/5 bg-white p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary,#7f1d1d)]/10 text-[var(--color-primary,#7f1d1d)]">
        <IconC size={18} />
      </span>
      <div>
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="text-sm font-semibold text-neutral-900">{value}</p>
      </div>
    </div>
  );
  if (!href) return content;
  if (event) {
    return (
      <TrackedLink href={href} event={event} className="block">
        {content}
      </TrackedLink>
    );
  }
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="block">
      {content}
    </a>
  );
}

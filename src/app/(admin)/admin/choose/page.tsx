import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users, Lock, ArrowRight } from "lucide-react";
import { getMyProfile } from "@/lib/admin-queries";

const CARDS = [
  {
    section: "cms" as const,
    href: "/admin",
    icon: LayoutDashboard,
    color: "#d0191f",
    title: "Content (CMS)",
    desc: "Properties, specifications, amenities, blog and site settings.",
  },
  {
    section: "crm" as const,
    href: "/crm",
    icon: Users,
    color: "#4f46e5",
    title: "Leads (CRM)",
    desc: "Enquiry pipeline, campaign attribution, WhatsApp & call tracking.",
  },
  {
    section: "vault" as const,
    href: "/vault-admin",
    icon: Lock,
    color: "#b45309",
    title: "Vault",
    desc: "Documents per project — contracts, approvals, brochures — shareable with an access key.",
  },
];

export default async function ChooseAreaPage() {
  const me = await getMyProfile();
  const isOwner = me?.role === "admin";
  const cards = isOwner ? CARDS : CARDS.filter((c) => me?.sections.includes(c.section));

  if (!isOwner && cards.length === 1) redirect(cards[0].href);
  if (!isOwner && cards.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 text-center">
        <div>
          <Image src="/brand/logo-v2.png" alt="BKR Estates" width={260} height={69} className="mx-auto h-auto w-56" />
          <h1 className="mt-3 text-lg font-semibold text-neutral-900">No access granted yet</h1>
          <p className="mt-1 text-sm text-neutral-500">Ask the account owner to grant you access to a section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/brand/logo-v2.png" alt="BKR Estates" width={260} height={69} className="h-auto w-56" />
          <h1 className="mt-3 text-xl font-semibold text-neutral-900">Welcome back</h1>
          <p className="text-sm text-neutral-500">Choose where you want to go</p>
        </div>

        <div className={`grid grid-cols-1 gap-5 ${cards.length === 3 ? "sm:grid-cols-3" : cards.length === 2 ? "sm:grid-cols-2" : ""}`}>
          {cards.map((c) => (
            <Link
              key={c.section}
              href={c.href}
              className="group rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: `${c.color}1a`, color: c.color }}
              >
                <c.icon size={22} />
              </span>
              <h2 className="mt-4 text-base font-semibold text-neutral-900">{c.title}</h2>
              <p className="mt-1 text-sm text-neutral-500">{c.desc}</p>
              <span className="mt-4 flex items-center gap-1 text-sm font-semibold" style={{ color: c.color }}>
                Enter {c.title.split(" ")[0]} <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

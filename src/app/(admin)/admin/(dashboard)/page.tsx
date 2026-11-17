import Link from "next/link";
import { Building2, Users, MessageCircle, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { getDashboardStats, getAllProperties } from "@/lib/admin-queries";
import { createDraftProperty } from "./properties/actions";

export default async function AdminDashboardPage() {
  const [stats, properties] = await Promise.all([getDashboardStats(), getAllProperties()]);
  const recentProperties = properties.slice(0, 6);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500">Overview of your listings</p>
        </div>
        <form action={createDraftProperty}>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full bg-[#1b5e3a] px-4 py-2 text-sm font-semibold text-white"
          >
            <Plus size={15} /> Add Property
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Building2} label="Published Properties" value={`${stats.published} / ${stats.totalProperties}`} />
        <StatCard icon={Users} label="Total Leads" value={stats.totalLeads} sub={`${stats.newLeads} new`} />
        <StatCard icon={TrendingUp} label="Leads This Week" value={stats.leadsThisWeek} />
        <StatCard
          icon={MessageCircle}
          label="WhatsApp / Call Clicks (7d)"
          value={stats.whatsappClicks + stats.callClicks}
          sub={`${stats.whatsappClicks} WA · ${stats.callClicks} calls`}
        />
      </div>

      <Link
        href="/crm"
        className="mt-6 flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50 p-5 transition hover:bg-indigo-100/60"
      >
        <div>
          <p className="text-sm font-semibold text-indigo-900">Leads live in the dedicated CRM now</p>
          <p className="text-xs text-indigo-600">Pipeline, campaign attribution, WhatsApp/call tracking</p>
        </div>
        <ArrowRight size={18} className="text-indigo-600" />
      </Link>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Recent Properties</h2>
          <Link href="/admin/properties" className="text-xs font-semibold text-[#1b5e3a]">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {recentProperties.length === 0 && <p className="text-xs text-neutral-400">No properties yet</p>}
          {recentProperties.map((p) => (
            <Link
              key={p.id}
              href={`/admin/properties/${p.id}/edit`}
              className="flex items-center justify-between border-b border-black/5 pb-2.5 last:border-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-neutral-800">{p.title}</p>
                <p className="text-xs text-neutral-400">{p.property_type?.name}</p>
              </div>
              <StatusPill status={p.status} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: IconC,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4">
      <IconC size={18} className="mb-2 text-[#1b5e3a]" />
      <p className="text-xl font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-neutral-400">{sub}</p>}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-600",
    published: "bg-emerald-100 text-emerald-700",
    paused: "bg-amber-100 text-amber-700",
    sold: "bg-blue-100 text-blue-700",
    archived: "bg-neutral-100 text-neutral-400",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${colors[status] ?? "bg-neutral-100"}`}>
      {status}
    </span>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllLeads, getDashboardStats, getLeadsBySource } from "@/lib/admin-queries";

export default async function CrmOverviewPage() {
  const [leads, stats, bySource] = await Promise.all([getAllLeads(), getDashboardStats(), getLeadsBySource()]);
  const recentLeads = leads.slice(0, 6);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">CRM Overview</h1>
          <p className="text-sm text-neutral-500">How leads are flowing in, and where they come from.</p>
        </div>
        <Link href="/crm/leads" className="flex items-center gap-1 text-sm font-semibold text-indigo-600">
          Open full pipeline <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Leads" value={stats.totalLeads} />
        <StatCard label="New" value={stats.newLeads} />
        <StatCard label="This Week" value={stats.leadsThisWeek} />
        <StatCard label="WhatsApp/Call Clicks (7d)" value={stats.whatsappClicks + stats.callClicks} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {bySource.length > 0 && (
          <div className="rounded-2xl border border-black/5 bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Leads by Source</p>
            <div className="space-y-2">
              {bySource.slice(0, 8).map(({ source, count }) => {
                const max = bySource[0]?.count || 1;
                return (
                  <div key={source} className="flex items-center gap-3 text-xs">
                    <span className="w-32 shrink-0 truncate text-neutral-600">{source}</span>
                    <div className="h-2 flex-1 rounded-full bg-neutral-100">
                      <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                    <span className="w-6 shrink-0 text-right font-medium text-neutral-700">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Recent Leads</p>
          <div className="space-y-3">
            {recentLeads.length === 0 && <p className="text-xs text-neutral-400">No leads yet</p>}
            {recentLeads.map((l) => (
              <div key={l.id} className="flex items-center justify-between border-b border-black/5 pb-2.5 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-neutral-800">{l.name}</p>
                  <p className="text-xs text-neutral-400">{l.property?.title ?? "General enquiry"}</p>
                </div>
                <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium capitalize text-neutral-600">
                  {l.status.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4">
      <p className="text-xl font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

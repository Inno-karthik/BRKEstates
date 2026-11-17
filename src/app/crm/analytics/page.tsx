import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Eye,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  MousePointerClick,
  Phone,
  Search,
  Share2,
  Smartphone,
  Users,
  FileDown,
  Bot,
  Scale,
  UserPlus,
} from "lucide-react";
import { WhatsappIcon } from "@/components/social-icons";
import { HourlyChart, TrendChart } from "@/components/crm/analytics-charts";
import { getAnalytics } from "@/lib/analytics-queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PERIODS = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

function pct(n: number, d: number) {
  return d > 0 ? `${((n / d) * 100).toFixed(n / d >= 0.1 ? 0 : 1)}%` : "—";
}

function delta(cur: number, prev: number) {
  if (prev === 0) return cur > 0 ? { text: "new", up: true } : null;
  const v = ((cur - prev) / prev) * 100;
  return { text: `${Math.abs(v).toFixed(0)}%`, up: v >= 0 };
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const sp = await searchParams;
  const days = [7, 30, 90].includes(Number(sp.days)) ? Number(sp.days) : 30;
  const a = await getAnalytics(days);

  const header = (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Analytics</h1>
        <p className="text-sm text-neutral-500">Visits, clicks and enquiries across the whole website — times in IST.</p>
      </div>
      <div className="inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5">
        {PERIODS.map((p) => (
          <Link
            key={p.days}
            href={`/crm/analytics?days=${p.days}`}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition",
              p.days === days ? "bg-indigo-600 text-white shadow" : "text-neutral-500 hover:text-neutral-800"
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>
    </div>
  );

  if (!a) {
    return (
      <div>
        {header}
        <div className="rounded-2xl border border-black/5 bg-white p-8 text-center text-sm text-neutral-500">
          Analytics couldn&apos;t be loaded. Please refresh, or check that you have CRM access.
        </div>
      </div>
    );
  }

  const t = (k: string) => a.by_type[k] ?? 0;
  const contacts = t("call_click") + t("whatsapp_click") + t("email_click") + t("chat_lead");
  const pageViews = t("page_view");
  const empty = pageViews === 0 && a.visitors === 0 && a.leads === 0 && contacts === 0;

  const kpis = [
    { label: "Visitors", value: a.visitors, icon: Users, d: delta(a.visitors, a.prev.visitors), sub: `${a.sessions} sessions` },
    { label: "Page views", value: pageViews, icon: Eye, d: delta(pageViews, a.prev.page_views), sub: a.visitors ? `${(pageViews / a.visitors).toFixed(1)} per visitor` : undefined },
    { label: "Leads (enquiries)", value: a.leads, icon: UserPlus, d: delta(a.leads, a.prev.leads), sub: `${pct(a.leads, a.visitors)} of visitors` },
    { label: "Contact actions", value: contacts, icon: MousePointerClick, d: delta(contacts, a.prev.contacts), sub: "calls, WhatsApp, email, chat" },
  ];

  const actions = [
    { label: "Phone calls", value: t("call_click"), icon: Phone },
    { label: "WhatsApp clicks", value: t("whatsapp_click"), icon: WhatsappIcon },
    { label: "Email clicks", value: t("email_click"), icon: Mail },
    { label: "Chatbot opened", value: t("chat_open"), icon: Bot },
    { label: "Chatbot leads", value: t("chat_lead"), icon: MessageCircle },
    { label: "Property views", value: t("property_view"), icon: Building2 },
    { label: "Property card clicks", value: t("property_click"), icon: MousePointerClick },
    { label: "Searches", value: t("search"), icon: Search },
    { label: "Saved to favourites", value: t("favorite_add"), icon: Heart },
    { label: "Added to compare", value: t("compare_add"), icon: Scale },
    { label: "Brochure downloads", value: t("brochure_download"), icon: FileDown },
    { label: "Directions / map", value: t("directions_click"), icon: MapPin },
    { label: "CTA buttons", value: t("cta_click"), icon: MousePointerClick },
    { label: "Social clicks", value: t("social_click"), icon: Share2 },
  ];

  const f = a.funnel;
  const steps = [
    { label: "Visitors", value: f.visitors },
    { label: "Viewed a property", value: f.property_viewers },
    { label: "Contacted us", value: f.contacted },
    { label: "Submitted an enquiry", value: f.leads },
  ];
  const maxStep = Math.max(...steps.map((s) => s.value), 1);
  const deviceTotal = a.devices.reduce((n, d) => n + d.visitors, 0) || 1;

  return (
    <div>
      {header}

      {empty && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No activity recorded yet for this period. Visits and clicks on the public website start appearing here automatically.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: IconC, d, sub }) => (
          <div key={label} className="rounded-2xl border border-black/5 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <IconC size={17} />
              </span>
              {d && (
                <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold", d.up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600")}>
                  {d.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {d.text}
                </span>
              )}
            </div>
            <p className="mt-3 text-2xl font-bold text-neutral-900">{value.toLocaleString("en-IN")}</p>
            <p className="text-xs text-neutral-500">{label}</p>
            {sub && <p className="mt-0.5 text-[11px] text-neutral-400">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-black/5 bg-white p-5 lg:col-span-2">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Traffic &amp; conversions</p>
            <div className="flex flex-wrap gap-3 text-[11px] text-neutral-500">
              <Legend color="#7f1d1d" label="Page views" />
              <Legend color="#6366f1" label="Visitors" />
              <Legend color="#d4af37" label="Contact actions" />
              <Legend color="#16a34a" label="Leads" />
            </div>
          </div>
          <TrendChart daily={a.daily} />
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">Conversion funnel</p>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={s.label}>
                <div className="mb-1 flex items-baseline justify-between text-xs">
                  <span className="text-neutral-600">{s.label}</span>
                  <span className="font-semibold text-neutral-900">
                    {s.value.toLocaleString("en-IN")}
                    {i > 0 && <span className="ml-1.5 font-normal text-neutral-400">{pct(s.value, steps[i - 1].value)}</span>}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-neutral-100">
                  <div className="h-2.5 rounded-full bg-gradient-to-r from-[#7f1d1d] to-[#d4af37]" style={{ width: `${Math.max((s.value / maxStep) * 100, s.value ? 3 : 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-black/5 pt-3 text-[11px] text-neutral-400">
            Visitor → lead: <b className="text-neutral-700">{pct(f.leads, f.visitors)}</b> · Visitor → contact: <b className="text-neutral-700">{pct(f.contacted, f.visitors)}</b>
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">Engagement — what visitors did</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {actions.map(({ label, value, icon: IconC }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border border-black/5 bg-neutral-50/60 p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#7f1d1d] shadow-sm ring-1 ring-black/5">
                <IconC size={15} />
              </span>
              <div className="min-w-0">
                <p className="text-base font-bold leading-tight text-neutral-900">{value.toLocaleString("en-IN")}</p>
                <p className="truncate text-[11px] text-neutral-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Top properties">
          {a.top_properties.length === 0 ? (
            <Empty />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-neutral-400">
                  <tr>
                    <th className="pb-2 font-medium">Property</th>
                    <th className="pb-2 text-right font-medium">Views</th>
                    <th className="pb-2 text-right font-medium">Calls</th>
                    <th className="pb-2 text-right font-medium">WhatsApp</th>
                    <th className="pb-2 text-right font-medium">Saves</th>
                    <th className="pb-2 text-right font-medium">Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {a.top_properties.map((p) => (
                    <tr key={p.id} className="border-t border-black/5">
                      <td className="max-w-[180px] truncate py-2 pr-2 text-neutral-800">
                        <Link href={`/listings/${p.slug}`} target="_blank" className="hover:underline">
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-2 text-right font-medium text-neutral-800">{p.views}</td>
                      <td className="py-2 text-right text-neutral-600">{p.calls}</td>
                      <td className="py-2 text-right text-neutral-600">{p.whatsapp}</td>
                      <td className="py-2 text-right text-neutral-600">{p.saves}</td>
                      <td className="py-2 text-right text-neutral-600">{p.leads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Top pages">
          <BarList rows={a.top_pages.map((p) => ({ label: p.path, value: p.views, sub: `${p.visitors} visitors` }))} />
        </Card>

        <Card title="Traffic sources">
          <BarList rows={a.sources.map((s) => ({ label: s.source, value: s.visitors, sub: `${s.views} views` }))} suffix="visitors" />
        </Card>

        <Card title="Devices">
          {a.devices.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-3">
              {a.devices.map((d) => (
                <div key={d.device}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 capitalize text-neutral-600">
                      <Smartphone size={13} /> {d.device}
                    </span>
                    <span className="font-semibold text-neutral-900">
                      {d.visitors} <span className="font-normal text-neutral-400">{pct(d.visitors, deviceTotal)}</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-100">
                    <div className="h-2 rounded-full bg-[#d4af37]" style={{ width: `${(d.visitors / deviceTotal) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Busiest hours (IST)">
          <HourlyChart hourly={a.hourly} />
        </Card>

        <div className="grid grid-cols-1 gap-6">
          <Card title="Popular searches">
            <BarList rows={a.top_searches.map((s) => ({ label: s.label, value: s.searches }))} />
          </Card>
          <Card title="Most-clicked buttons">
            <BarList rows={a.top_ctas.map((c) => ({ label: c.label, value: c.clicks }))} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</p>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="py-4 text-center text-xs text-neutral-400">No data yet</p>;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function BarList({ rows, suffix }: { rows: { label: string; value: number; sub?: string }[]; suffix?: string }) {
  if (rows.length === 0) return <Empty />;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="text-xs">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-neutral-700" title={r.label}>
              {r.label}
            </span>
            <span className="shrink-0 font-semibold text-neutral-900">
              {r.value.toLocaleString("en-IN")}
              {suffix && <span className="ml-1 font-normal text-neutral-400">{suffix}</span>}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-neutral-100">
            <div className="h-1.5 rounded-full bg-indigo-500" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
          {r.sub && <p className="mt-0.5 text-[10px] text-neutral-400">{r.sub}</p>}
        </div>
      ))}
    </div>
  );
}

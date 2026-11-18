"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Analytics } from "@/lib/analytics-queries";

const BURGUNDY = "#d0191f";
const GOLD = "#d4af37";
const SLATE = "#6366f1";

function shortDay(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  fontSize: 12,
};

export function TrendChart({ daily }: { daily: Analytics["daily"] }) {
  const data = daily.map((d) => ({ ...d, label: shortDay(d.day) }));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BURGUNDY} stopOpacity={0.35} />
              <stop offset="100%" stopColor={BURGUNDY} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gContacts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GOLD} stopOpacity={0.45} />
              <stop offset="100%" stopColor={GOLD} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#737373" }} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#737373" }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="page_views" name="Page views" stroke={BURGUNDY} strokeWidth={2} fill="url(#gViews)" />
          <Area type="monotone" dataKey="visitors" name="Visitors" stroke={SLATE} strokeWidth={2} fill="transparent" />
          <Area type="monotone" dataKey="contacts" name="Call / WhatsApp / email" stroke={GOLD} strokeWidth={2} fill="url(#gContacts)" />
          <Area type="monotone" dataKey="leads" name="Leads" stroke="#16a34a" strokeWidth={2} fill="transparent" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HourlyChart({ hourly }: { hourly: Analytics["hourly"] }) {
  const data = hourly.map((h) => ({ ...h, label: `${h.hour % 12 === 0 ? 12 : h.hour % 12}${h.hour < 12 ? "a" : "p"}` }));
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#737373" }} tickLine={false} axisLine={false} interval={2} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#737373" }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Bar dataKey="views" name="Page views" fill={GOLD} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

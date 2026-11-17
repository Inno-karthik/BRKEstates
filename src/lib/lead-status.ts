import type { LeadStatus } from "@/lib/types";

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-indigo-100 text-indigo-700",
  qualified: "bg-purple-100 text-purple-700",
  site_visit_planned: "bg-amber-100 text-amber-700",
  visited: "bg-teal-100 text-teal-700",
  negotiation: "bg-orange-100 text-orange-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-red-100 text-red-700",
  inactive: "bg-slate-200 text-slate-600",
  duplicate: "bg-fuchsia-100 text-fuchsia-700",
};

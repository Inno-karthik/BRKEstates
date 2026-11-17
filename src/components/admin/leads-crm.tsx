"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Trash2, Phone, Mail, MessageSquareText, ArrowRight } from "lucide-react";
import { updateLeadStatus, deleteLead } from "@/app/crm/leads/actions";
import { NotesModal } from "@/components/admin/lead-notes";
import { STATUS_COLORS } from "@/lib/lead-status";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/types";

export function LeadsCrm({ leads }: { leads: Lead[] }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [, startTransition] = useTransition();
  const [notesLead, setNotesLead] = useState<Lead | null>(null);

  const filtered = useMemo(
    () => (statusFilter ? leads.filter((l) => l.status === statusFilter) : leads),
    [leads, statusFilter]
  );

  return (
    <div>
      <div className="scrollbar-thin mb-4 flex gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible lg:pb-0">
        <button
          onClick={() => setStatusFilter("")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${!statusFilter ? "bg-[#1b5e3a] text-white" : "border border-black/10 text-neutral-600"}`}
        >
          All
        </button>
        {LEAD_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium capitalize ${statusFilter === s ? "bg-[#1b5e3a] text-white" : "border border-black/10 text-neutral-600"}`}
          >
            {s.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Mobile: compact name + date rows, full detail lives on its own page. */}
      <div className="space-y-2 lg:hidden">
        {filtered.map((lead) => (
          <Link
            key={lead.id}
            href={`/crm/leads/${lead.id}`}
            className="flex items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white px-4 py-3.5"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-neutral-900">{lead.name}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_COLORS[lead.status]}`}>
                  {lead.status.replace(/_/g, " ")}
                </span>
                <p className="text-xs text-neutral-400">
                  {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-black/10 text-neutral-500">
              <ArrowRight size={15} />
            </span>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-black/5 bg-white py-12 text-center text-sm text-neutral-400">No leads found.</p>
        )}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-black/5 bg-white lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs text-neutral-400">
              <th className="w-56 px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Message</th>
              <th className="w-px whitespace-nowrap px-4 py-3 font-medium">Source</th>
              <th className="w-px whitespace-nowrap px-4 py-3 font-medium">Status</th>
              <th className="w-px whitespace-nowrap px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-900">{lead.name}</p>
                  <div className="mt-0.5 space-y-0.5 text-xs text-neutral-400">
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-neutral-700">
                        <Phone size={11} /> {lead.phone}
                      </a>
                    )}
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-neutral-700">
                        <Mail size={11} /> {lead.email}
                      </a>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-neutral-600">
                  <p>{lead.property?.title ?? "General enquiry"}</p>
                  {lead.variant_label && <p className="mt-0.5 text-[11px] text-neutral-400">{lead.variant_label}</p>}
                  {lead.notes?.[0] && (
                    <p className="mt-1 text-[11px] italic text-neutral-400">Note: {lead.notes[0].note}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-neutral-600">{lead.message || <span className="text-neutral-300">—</span>}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-600">
                  {lead.utm_source ? (
                    <div>
                      <p>{lead.utm_source}</p>
                      {lead.utm_campaign && <p className="text-neutral-400">{lead.utm_campaign}</p>}
                    </div>
                  ) : (
                    <span className="text-neutral-400">Direct / Organic</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <select
                    value={lead.status}
                    onChange={(e) => startTransition(() => updateLeadStatus(lead.id, e.target.value as LeadStatus))}
                    className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-medium capitalize ${STATUS_COLORS[lead.status]}`}
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-400">
                  {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setNotesLead(lead)}
                      className="relative text-neutral-400 hover:text-neutral-700"
                      title="Notes"
                    >
                      <MessageSquareText size={14} />
                      {lead.notes && lead.notes.length > 0 && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1b5e3a] text-[8px] font-bold text-white">
                          {lead.notes.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => confirm("Delete this lead?") && startTransition(() => deleteLead(lead.id))}
                      className="text-neutral-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-12 text-center text-sm text-neutral-400">No leads found.</p>}
      </div>

      {notesLead && <NotesModal lead={notesLead} onClose={() => setNotesLead(null)} />}
    </div>
  );
}

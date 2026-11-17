"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone, Mail, Megaphone, Trash2, MessageSquareText } from "lucide-react";
import { updateLeadStatus, deleteLead } from "@/app/crm/leads/actions";
import { LeadNotesContent } from "@/components/admin/lead-notes";
import { STATUS_COLORS } from "@/lib/lead-status";
import { LEAD_STATUSES, type Lead, type LeadStatus } from "@/lib/types";

export function LeadDetailView({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);

  function changeStatus(s: LeadStatus) {
    setStatus(s);
    startTransition(() => updateLeadStatus(lead.id, s));
  }

  async function remove() {
    if (!confirm("Delete this lead?")) return;
    setDeleting(true);
    await deleteLead(lead.id);
    router.push("/crm/leads");
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/crm/leads" className="mb-5 flex items-center gap-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-800">
        <ArrowLeft size={15} /> Back to Leads
      </Link>

      <div className="rounded-2xl border border-black/5 bg-white p-5">
        <p className="text-lg font-bold text-neutral-900">{lead.name}</p>
        <p className="mt-0.5 text-xs text-neutral-400">
          {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <select
          value={status}
          onChange={(e) => changeStatus(e.target.value as LeadStatus)}
          className={`mt-3 rounded-full border-0 px-3 py-1.5 text-xs font-medium capitalize ${STATUS_COLORS[status]}`}
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        <Field label="Phone">
          {lead.phone ? (
            <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm font-medium text-neutral-800">
              <Phone size={14} className="text-neutral-400" /> {lead.phone}
            </a>
          ) : (
            <Empty />
          )}
        </Field>

        <Field label="Email">
          {lead.email ? (
            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm font-medium text-neutral-800 break-all">
              <Mail size={14} className="shrink-0 text-neutral-400" /> {lead.email}
            </a>
          ) : (
            <Empty />
          )}
        </Field>

        <Field label="Property">
          {lead.property ? (
            <Link href={`/listings/${lead.property.slug}`} target="_blank" className="text-sm font-medium text-[#9b1c1c] hover:underline">
              {lead.property.title}
            </Link>
          ) : (
            <p className="text-sm text-neutral-600">General enquiry</p>
          )}
          {lead.variant_label && <p className="mt-0.5 text-xs text-neutral-400">{lead.variant_label}</p>}
        </Field>

        {lead.message && (
          <Field label="Message">
            <p className="whitespace-pre-wrap text-sm text-neutral-700">{lead.message}</p>
          </Field>
        )}

        <Field label="Source / Campaign">
          {lead.utm_source ? (
            <div className="flex items-start gap-2 text-sm text-neutral-700">
              <Megaphone size={14} className="mt-0.5 shrink-0 text-neutral-400" />
              <div>
                <p>{lead.utm_source}</p>
                {lead.utm_campaign && <p className="text-xs text-neutral-400">{lead.utm_campaign}</p>}
                {lead.landing_page && <p className="mt-0.5 break-all text-xs text-neutral-400">{lead.landing_page}</p>}
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-600">Direct / Organic</p>
          )}
        </Field>

        <div className="rounded-2xl border border-black/5 bg-white p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <MessageSquareText size={13} /> Notes
          </p>
          <LeadNotesContent lead={lead} />
        </div>

        <button
          onClick={remove}
          disabled={deleting}
          className="flex w-full items-center justify-center gap-1.5 rounded-full border border-red-200 py-2.5 text-sm font-medium text-red-600 disabled:opacity-50"
        >
          <Trash2 size={14} /> Delete Lead
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{label}</p>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-neutral-300">—</p>;
}
